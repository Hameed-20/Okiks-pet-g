import React, {useMemo, useState} from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import {SafeImage} from '../components/SafeImage';
import {useStore} from '../context/StoreContext';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  findDeliveryZoneForState,
  formatNaira,
  NIGERIAN_STATES,
  type CheckoutFormDetails,
} from '../utils/storeHelpers';

export const CheckoutPage: React.FC = () => {
  const {store, cartCalc, updateQuantity, removeFromCart, navigate} = useStore();

  const [form, setForm] = useState<CheckoutFormDetails>({
    fullName: '',
    phone: '',
    fulfillment: 'delivery',
    state: 'Kwara',
    cityOrLga: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [readyToSend, setReadyToSend] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!store) return null;

  const {settings, deliveryZones} = store;
  const matchedZone = useMemo(() => {
    if (form.fulfillment === 'pickup') return undefined;
    return findDeliveryZoneForState(deliveryZones, form.state);
  }, [deliveryZones, form.state, form.fulfillment]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) {
      next.fullName = 'Please enter your full name.';
    }
    const cleanPhone = form.phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      next.phone = 'Please enter a valid Nigerian phone or WhatsApp number.';
    }
    if (form.fulfillment === 'delivery') {
      if (!form.state) next.state = 'Please select your state.';
      if (!form.cityOrLga.trim()) next.cityOrLga = 'Please enter your city or LGA.';
      if (!form.address.trim()) next.address = 'Please enter your full delivery address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const orderMessage = useMemo(() => {
    return buildWhatsAppOrderMessage({
      businessName: settings.businessName,
      storeAddress: settings.address,
      calc: cartCalc,
      form,
      matchedZone,
    });
  }, [settings.businessName, settings.address, cartCalc, form, matchedZone]);

  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, orderMessage);

  const handlePrepareOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setReadyToSend(false);
      return;
    }
    setReadyToSend(true);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  if (cartCalc.lines.length === 0) {
    return (
      <div className="bg-[#FAF8F0] min-h-[70vh] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-[#E5E2D6] rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F0] flex items-center justify-center text-[#075C28]">
            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#183D2A]">
            Your cart is empty
          </h1>
          <p className="text-sm text-[#202820]/75 leading-relaxed">
            Add cat, bird, or rabbit nutrition products to your cart first, then return here to
            complete your WhatsApp order summary.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-3 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-1">
            WhatsApp Order Checkout
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A]">
            Review Your Order &amp; Send via WhatsApp
          </h1>
          <p className="text-sm text-[#202820]/75 mt-1">
            No online card payment is taken here. Payment is arranged via bank transfer after our
            team confirms availability on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Step 1 (Cart Review) + Step 2 & 3 (Customer & Delivery Details) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Cart Items Review */}
            <section className="bg-white border border-[#E5E2D6] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D6] pb-3">
                <h2 className="font-display font-bold text-lg text-[#183D2A]">
                  1. Selected Products ({cartCalc.totalQuantity})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="text-xs font-semibold text-[#075C28] hover:underline cursor-pointer"
                >
                  Add More Items
                </button>
              </div>

              <div className="divide-y divide-[#E5E2D6]">
                {cartCalc.lines.map(({item, product, variant, lineSubtotal}) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="py-4 first:pt-1 last:pb-1 flex gap-4 items-center"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FAF8F0] border border-[#E5E2D6] shrink-0">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#202820] truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#202820]/65">
                        Size: {variant.label} ·{' '}
                        {variant.price !== null
                          ? `${formatNaira(variant.price)} each`
                          : 'Quote required'}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center border border-[#E5E2D6] rounded-md bg-[#FAF8F0] h-8">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            className="w-7 h-full flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            className="w-7 h-full flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          aria-label={`Remove ${product.name}`}
                          className="text-xs text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-bold text-[#183D2A] tabular-nums shrink-0">
                      {lineSubtotal !== null ? formatNaira(lineSubtotal) : 'Quote'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 2 & 3: Customer & Fulfillment Form */}
            <form
              onSubmit={handlePrepareOrder}
              noValidate
              className="bg-white border border-[#E5E2D6] rounded-2xl p-5 sm:p-6 space-y-5"
            >
              <h2 className="font-display font-bold text-lg text-[#183D2A] border-b border-[#E5E2D6] pb-3">
                2. Customer &amp; Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs font-semibold text-[#202820] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => {
                      setForm({...form, fullName: e.target.value});
                      setReadyToSend(false);
                    }}
                    placeholder="e.g. Amina Bello"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-700 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs font-semibold text-[#202820] mb-1.5"
                  >
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => {
                      setForm({...form, phone: e.target.value});
                      setReadyToSend(false);
                    }}
                    placeholder="e.g. 0803 000 0000"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-700 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery vs Pickup Selection */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#202820]">Fulfillment Method *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({...form, fulfillment: 'delivery'});
                      setReadyToSend(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                      form.fulfillment === 'delivery'
                        ? 'border-[#075C28] bg-[#075C28]/5'
                        : 'border-[#E5E2D6] bg-[#FAF8F0]'
                    }`}
                  >
                    <Truck
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        form.fulfillment === 'delivery' ? 'text-[#075C28]' : 'text-[#202820]/60'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-semibold text-sm text-[#183D2A] block">
                        Nationwide Delivery
                      </span>
                      <span className="text-xs text-[#202820]/70">
                        Deliver to your Nigerian state &amp; address
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({...form, fulfillment: 'pickup'});
                      setReadyToSend(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                      form.fulfillment === 'pickup'
                        ? 'border-[#075C28] bg-[#075C28]/5'
                        : 'border-[#E5E2D6] bg-[#FAF8F0]'
                    }`}
                  >
                    <MapPin
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        form.fulfillment === 'pickup' ? 'text-[#075C28]' : 'text-[#202820]/60'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-semibold text-sm text-[#183D2A] block">
                        Store Pickup (Free)
                      </span>
                      <span className="text-xs text-[#202820]/70">
                        Collect at Tanke, Ilorin shop
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Delivery or Pickup Info */}
              {form.fulfillment === 'delivery' ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="checkout-state"
                        className="block text-xs font-semibold text-[#202820] mb-1.5"
                      >
                        State *
                      </label>
                      <select
                        id="checkout-state"
                        value={form.state}
                        onChange={(e) => {
                          setForm({...form, state: e.target.value});
                          setReadyToSend(false);
                        }}
                        className="w-full h-11 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-xs text-red-700 mt-1">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-xs font-semibold text-[#202820] mb-1.5"
                      >
                        City or LGA *
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        value={form.cityOrLga}
                        onChange={(e) => {
                          setForm({...form, cityOrLga: e.target.value});
                          setReadyToSend(false);
                        }}
                        placeholder="e.g. Ilorin South / Ikeja"
                        className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                      />
                      {errors.cityOrLga && (
                        <p className="text-xs text-red-700 mt-1">{errors.cityOrLga}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs font-semibold text-[#202820] mb-1.5"
                    >
                      Full Delivery Address *
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => {
                        setForm({...form, address: e.target.value});
                        setReadyToSend(false);
                      }}
                      placeholder="House number, street name, nearest bus stop or landmark"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-700 mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Delivery Zone Rate Preview */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] text-xs sm:text-sm text-[#202820]/85 space-y-1">
                    {matchedZone && matchedZone.fee !== null ? (
                      <>
                        <p className="font-semibold text-[#183D2A]">
                          Delivery Zone: {matchedZone.name} — {formatNaira(matchedZone.fee)}
                        </p>
                        <p className="text-xs text-[#202820]/70">
                          Timeline: {matchedZone.estimatedRange}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-[#183D2A]">
                        Delivery fee will be confirmed by our team on WhatsApp.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] space-y-1.5 text-sm">
                  <p className="font-semibold text-[#183D2A]">Store Pickup Address</p>
                  <p className="text-[#202820]/80">{settings.address}</p>
                  <p className="text-xs text-[#075C28] font-medium">
                    No delivery charge applies to physical store pickup.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="checkout-notes"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  Optional Order Notes
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => {
                    setForm({...form, notes: e.target.value});
                    setReadyToSend(false);
                  }}
                  placeholder="Any preferred delivery instructions, pet details, or pack questions..."
                  className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-lg bg-[#183D2A] text-white font-semibold text-sm sm:text-base hover:bg-[#075C28] transition-colors cursor-pointer"
              >
                Generate WhatsApp Order Summary
              </button>
            </form>
          </div>

          {/* RIGHT: Step 4 & 5 Order Summary & WhatsApp Launch */}
          <aside className="lg:col-span-5 bg-white border border-[#E5E2D6] rounded-2xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-lg text-[#183D2A] border-b border-[#E5E2D6] pb-3">
              3. Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-[#202820]/75">
                <span>Business</span>
                <span className="font-semibold text-[#183D2A]">{settings.businessName}</span>
              </div>
              <div className="flex justify-between text-[#202820]/75">
                <span>Total Items</span>
                <span className="font-semibold tabular-nums">{cartCalc.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-[#202820]/75">
                <span>
                  {cartCalc.hasQuotedItems ? 'Confirmed Items Subtotal' : 'Items Subtotal'}
                </span>
                <span className="font-semibold tabular-nums">
                  {cartCalc.confirmedSubtotal > 0
                    ? formatNaira(cartCalc.confirmedSubtotal)
                    : 'Quote on WhatsApp'}
                </span>
              </div>

              <div className="flex justify-between text-[#202820]/75">
                <span>Delivery Charge</span>
                <span className="font-semibold tabular-nums text-right">
                  {form.fulfillment === 'pickup'
                    ? '₦0 (Store Pickup)'
                    : matchedZone && matchedZone.fee !== null
                      ? formatNaira(matchedZone.fee)
                      : 'Confirmed on WhatsApp'}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E5E2D6] flex justify-between items-baseline text-base font-bold text-[#183D2A]">
                <span>Estimated Total</span>
                <span className="tabular-nums text-lg text-[#075C28]">
                  {cartCalc.allItemsPriced &&
                  (form.fulfillment === 'pickup' ||
                    (matchedZone && matchedZone.fee !== null))
                    ? formatNaira(
                        cartCalc.confirmedSubtotal +
                          (form.fulfillment === 'pickup' ? 0 : matchedZone?.fee || 0),
                      )
                    : 'To be confirmed on WhatsApp'}
                </span>
              </div>
            </div>

            {/* Step 5: WhatsApp Action */}
            {readyToSend ? (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] text-xs text-[#202820]/80 flex items-start gap-2.5">
                  <AlertCircle
                    className="w-4 h-4 text-[#075C28] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    Your order is <strong>not submitted or confirmed yet</strong>. Review the
                    generated message and send it inside WhatsApp so our team can confirm stock
                    and share bank transfer details.
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 px-5 rounded-lg bg-[#075C28] text-white font-bold text-base hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 text-[#F4B900]" aria-hidden="true" />
                  <span>Open WhatsApp &amp; Send Order</span>
                </a>

                {/* Fallback Copy / Preview */}
                <div className="space-y-2 pt-2 border-t border-[#E5E2D6]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#202820]/70">
                      Message Preview / Fallback
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#075C28] hover:underline cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#FAF8F0] border border-[#E5E2D6] text-xs text-[#202820]/85 whitespace-pre-wrap font-sans max-h-56 overflow-y-auto leading-relaxed">
                    {orderMessage}
                  </pre>
                  <p className="text-[11px] text-[#202820]/65">
                    If WhatsApp does not open automatically, copy the message above and send it
                    directly to {settings.displayPhone}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] text-xs text-[#202820]/75 leading-relaxed">
                Complete your customer and delivery details on the left, then click{' '}
                <strong>&ldquo;Generate WhatsApp Order Summary&rdquo;</strong> to unlock your
                ready-to-send WhatsApp checkout link.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
