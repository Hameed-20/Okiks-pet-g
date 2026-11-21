import React from 'react';
import {ArrowRight, Minus, Plus, ShoppingBag, Trash2, X} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {formatNaira} from '../utils/storeHelpers';
import {SafeImage} from './SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cartOpen,
    setCartOpen,
    cartCalc,
    updateQuantity,
    removeFromCart,
    navigate,
  } = useStore();

  if (!cartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202820]/50 backdrop-blur-[1px]"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-[#E5E2D6]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E2D6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#075C28]" aria-hidden="true" />
            <h2 className="font-display font-bold text-lg text-[#183D2A]">
              Your Cart ({cartCalc.totalQuantity})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close shopping cart"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#202820] hover:bg-[#FAF8F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartCalc.lines.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F0] flex items-center justify-center text-[#075C28]">
                <ShoppingBag className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-display font-semibold text-base text-[#202820]">
                  Your cart is currently empty
                </p>
                <p className="text-sm text-[#202820]/70 max-w-xs mx-auto">
                  Explore our cat, bird, and rabbit nutrition categories to add items to your
                  WhatsApp order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/shop');
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            cartCalc.lines.map(({item, product, variant, lineSubtotal}) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3.5 pb-4 border-b border-[#E5E2D6] last:border-b-0"
              >
                <a
                  href={`/product/${product.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCartOpen(false);
                    navigate(`/product/${product.id}`);
                  }}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF8F0] border border-[#E5E2D6] shrink-0"
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </a>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-[#202820] leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      aria-label={`Remove ${product.name}`}
                      className="text-[#202820]/50 hover:text-red-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#202820]/65 mt-0.5">Size: {variant.label}</p>

                  <div className="mt-1 text-xs font-medium text-[#075C28]">
                    {variant.price !== null
                      ? `${formatNaira(variant.price)} each`
                      : 'Quotation required on WhatsApp'}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center border border-[#E5E2D6] rounded-md bg-[#FAF8F0] h-9">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="w-8 h-full flex items-center justify-center hover:text-[#075C28] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        className="w-8 h-full flex items-center justify-center hover:text-[#075C28] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sm font-bold text-[#202820] tabular-nums">
                      {lineSubtotal !== null ? formatNaira(lineSubtotal) : 'Quote'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Actions */}
        {cartCalc.lines.length > 0 && (
          <div className="p-5 border-t border-[#E5E2D6] bg-[#FAF8F0] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-[#202820]/80">
                <span>Total Quantity</span>
                <span className="font-semibold tabular-nums">
                  {cartCalc.totalQuantity} {cartCalc.totalQuantity === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-[#183D2A]">
                <span>
                  {cartCalc.hasQuotedItems ? 'Priced Items Subtotal' : 'Order Subtotal'}
                </span>
                <span className="tabular-nums">
                  {cartCalc.confirmedSubtotal > 0
                    ? formatNaira(cartCalc.confirmedSubtotal)
                    : 'Quote on WhatsApp'}
                </span>
              </div>
              {cartCalc.hasQuotedItems && (
                <p className="text-xs text-[#202820]/70 leading-relaxed">
                  Items marked for quotation will be priced and confirmed by our team on
                  WhatsApp.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="w-full py-3 px-4 rounded-lg border border-[#183D2A]/25 bg-white text-[#183D2A] text-sm font-semibold hover:bg-[#FAF8F0] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
