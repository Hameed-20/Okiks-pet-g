import React, {useState} from 'react';
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {ProductCard} from '../components/ProductCard';
import {SafeImage} from '../components/SafeImage';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl, formatNaira, getStockLabel} from '../utils/storeHelpers';

export const ProductDetailPage: React.FC<{productId: string}> = ({productId}) => {
  const {store, navigate, addToCart, setCartOpen} = useStore();
  const product = store?.products.find((p) => p.id === productId);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (product?.variants[0]?.id) {
      setSelectedVariantId(product.variants[0].id);
      setQuantity(1);
    }
  }, [product?.id]);

  if (!store) return null;

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display font-bold text-2xl text-[#183D2A]">Product Not Found</h1>
        <p className="text-sm text-[#202820]/75">
          This product may have been removed or updated by the store owner.
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const isOutOfStock = selectedVariant?.stockStatus === 'out_of_stock';
  const categoryName =
    product.category === 'cats'
      ? 'Cats'
      : product.category === 'birds'
        ? 'Birds'
        : 'Rabbits';

  const whatsappProductUrl = buildWhatsAppUrl(
    store.settings.whatsappNumber,
    `Hello ${store.settings.businessName}, I would like to enquire about "${product.name}" (Size: ${selectedVariant?.label || 'Pending'}). Please confirm availability and pricing.`,
  );

  const relatedProducts = store.products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : b.category === product.category ? 1 : 0))
    .slice(0, 3);

  const handleAddAndOpen = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(product.id, selectedVariant.id, quantity);
    setCartOpen(true);
  };

  return (
    <div className="bg-[#FAF8F0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm font-medium text-[#202820]/70">
          <button
            type="button"
            onClick={() => navigate(`/${product.category}`)}
            className="inline-flex items-center gap-1.5 text-[#075C28] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to {categoryName}</span>
          </button>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.name}</span>
        </div>

        {/* Contiguous Purchase Module */}
        <div className="bg-white border border-[#E5E2D6] rounded-2xl p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Gallery */}
          <div className="lg:col-span-5">
            <div className="max-w-md mx-auto aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF8F0] border border-[#E5E2D6]">
              <SafeImage
                src={product.image}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Purchase Details */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#202820]/70 mb-2">
                <span>{categoryName}</span>
                {product.brand ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Brand: {product.brand}</span>
                  </>
                ) : null}
                {product.isDraft ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#075C28] font-semibold">
                      Draft Catalog Placeholder
                    </span>
                  </>
                ) : null}
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A] leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#E5E2D6]">
              {selectedVariant && selectedVariant.price !== null ? (
                <p className="text-2xl sm:text-3xl font-bold text-[#075C28] tabular-nums">
                  {formatNaira(selectedVariant.price)}
                </p>
              ) : (
                <p className="text-lg font-bold text-[#075C28]">
                  Request a Quote on WhatsApp
                </p>
              )}

              <span
                className={`text-sm font-semibold ${
                  isOutOfStock ? 'text-red-700' : 'text-[#183D2A]'
                }`}
              >
                {selectedVariant ? getStockLabel(selectedVariant.stockStatus) : ''}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#202820]/80 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-[#183D2A]">Select Package Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const active = variant.id === selectedVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#183D2A] text-white border-[#183D2A]'
                          : 'bg-[#FAF8F0] text-[#202820] border-[#E5E2D6] hover:border-[#075C28]'
                      }`}
                    >
                      {variant.label}
                      {variant.price !== null ? ` — ${formatNaira(variant.price)}` : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="inline-flex items-center justify-between border border-[#E5E2D6] rounded-lg bg-[#FAF8F0] h-12 px-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center hover:text-[#075C28] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-base font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-full flex items-center justify-center hover:text-[#075C28] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddAndOpen}
                className={`flex-1 h-12 px-6 rounded-lg font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isOutOfStock
                    ? 'bg-[#E5E2D6] text-[#202820]/50 cursor-not-allowed'
                    : 'bg-[#075C28] text-white hover:bg-[#183D2A]'
                }`}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

            <a
              href={whatsappProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg border border-[#183D2A]/25 text-sm font-semibold text-[#183D2A] hover:border-[#075C28] hover:bg-[#FAF8F0] transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#075C28]" aria-hidden="true" />
              <span>Enquire About This Product on WhatsApp</span>
            </a>

            {/* Delivery & Payment Transparency */}
            <div className="pt-4 border-t border-[#E5E2D6] space-y-2.5 text-xs sm:text-sm text-[#202820]/75">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Nationwide delivery across Nigeria. Delivery fee confirmed via WhatsApp unless
                  pre-configured by zone.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Free store pickup available at Opposite Rhema Chapel, Tipper Garage, Tanke,
                  Ilorin.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl text-[#183D2A] mb-6">
              Related Nutrition Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
