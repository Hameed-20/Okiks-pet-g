import type {CartItem, DeliveryZone, Product, ProductVariant, StockStatus} from '../types';

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function getStockLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Limited Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'confirm_availability':
    default:
      return 'Confirm Availability';
  }
}

export function resolveVariant(product: Product, variantId: string): ProductVariant {
  return product.variants.find((v) => v.id === variantId) || product.variants[0];
}

export function findDeliveryZoneForState(
  zones: DeliveryZone[],
  state: string,
): DeliveryZone | undefined {
  if (!state) return undefined;
  return zones.find((z) => z.enabled && z.states.includes(state));
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const cleanNumber = phoneDigits.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export interface CartCalculation {
  lines: Array<{
    item: CartItem;
    product: Product;
    variant: ProductVariant;
    lineSubtotal: number | null;
  }>;
  totalQuantity: number;
  confirmedSubtotal: number;
  hasQuotedItems: boolean;
  allItemsPriced: boolean;
}

export function calculateCart(cart: CartItem[], products: Product[]): CartCalculation {
  const lines: CartCalculation['lines'] = [];
  let totalQuantity = 0;
  let confirmedSubtotal = 0;
  let hasQuotedItems = false;

  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const variant = resolveVariant(product, item.variantId);
    if (!variant) continue;

    totalQuantity += item.quantity;
    if (variant.price !== null && Number.isFinite(variant.price)) {
      const lineSubtotal = variant.price * item.quantity;
      confirmedSubtotal += lineSubtotal;
      lines.push({item, product, variant, lineSubtotal});
    } else {
      hasQuotedItems = true;
      lines.push({item, product, variant, lineSubtotal: null});
    }
  }

  return {
    lines,
    totalQuantity,
    confirmedSubtotal,
    hasQuotedItems,
    allItemsPriced: lines.length > 0 && !hasQuotedItems,
  };
}

export interface CheckoutFormDetails {
  fullName: string;
  phone: string;
  fulfillment: 'delivery' | 'pickup';
  state: string;
  cityOrLga: string;
  address: string;
  notes: string;
}

export function buildWhatsAppOrderMessage(params: {
  businessName: string;
  storeAddress: string;
  calc: CartCalculation;
  form: CheckoutFormDetails;
  matchedZone?: DeliveryZone;
}): string {
  const {businessName, storeAddress, calc, form, matchedZone} = params;
  const lines: string[] = [];

  lines.push(`Hello ${businessName},`);
  lines.push('I would like to place an order with the following details:');
  lines.push('');
  lines.push('*CUSTOMER DETAILS*');
  lines.push(`Name: ${form.fullName.trim()}`);
  lines.push(`Phone: ${form.phone.trim()}`);
  lines.push(
    `Fulfillment: ${form.fulfillment === 'pickup' ? 'Store Pickup' : 'Nationwide Delivery'}`,
  );

  if (form.fulfillment === 'pickup') {
    lines.push(`Pickup Location: ${storeAddress}`);
  } else {
    lines.push(`State: ${form.state}`);
    lines.push(`City / LGA: ${form.cityOrLga.trim()}`);
    lines.push(`Delivery Address: ${form.address.trim()}`);
  }

  lines.push('');
  lines.push('*ORDER ITEMS*');
  calc.lines.forEach((line, idx) => {
    const unitText =
      line.variant.price !== null ? formatNaira(line.variant.price) : 'Request a Quote';
    const subText =
      line.lineSubtotal !== null ? formatNaira(line.lineSubtotal) : 'To be quoted';
    lines.push(
      `${idx + 1}. ${line.product.name} (${line.variant.label}) x ${line.item.quantity} — Unit: ${unitText} | Subtotal: ${subText}`,
    );
  });

  lines.push('');
  lines.push('*ORDER SUMMARY*');
  lines.push(`Total Items: ${calc.totalQuantity}`);
  if (calc.confirmedSubtotal > 0) {
    lines.push(
      `Items Subtotal${calc.hasQuotedItems ? ' (Priced items)' : ''}: ${formatNaira(calc.confirmedSubtotal)}`,
    );
  } else {
    lines.push('Items Subtotal: Quotation required on WhatsApp');
  }

  if (form.fulfillment === 'pickup') {
    lines.push('Delivery Fee: ₦0 (Store Pickup)');
    if (calc.allItemsPriced) {
      lines.push(`Estimated Order Total: ${formatNaira(calc.confirmedSubtotal)}`);
    } else {
      lines.push('Estimated Order Total: To be confirmed on WhatsApp');
    }
  } else if (matchedZone && matchedZone.fee !== null) {
    lines.push(`Delivery Zone: ${matchedZone.name}`);
    lines.push(`Delivery Fee: ${formatNaira(matchedZone.fee)}`);
    if (calc.allItemsPriced) {
      lines.push(
        `Estimated Order Total: ${formatNaira(calc.confirmedSubtotal + matchedZone.fee)}`,
      );
    } else {
      lines.push('Estimated Order Total: Items + Delivery to be confirmed on WhatsApp');
    }
  } else {
    lines.push('Delivery Fee: Delivery fee will be confirmed by our team on WhatsApp.');
    lines.push('Order Total: To be confirmed on WhatsApp');
  }

  if (form.notes.trim()) {
    lines.push('');
    lines.push(`*NOTES*: ${form.notes.trim()}`);
  }

  lines.push('');
  lines.push('Please confirm availability, total cost, and bank transfer details. Thank you.');
  return lines.join('\n');
}
