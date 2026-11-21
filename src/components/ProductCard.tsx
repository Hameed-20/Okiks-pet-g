import React, {useState} from 'react';
import {Minus, Plus, ShoppingBag} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import type {Product} from '../types';
import {formatNaira, getStockLabel} from '../utils/storeHelpers';
import {SafeImage} from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({product}) => {
  const {navigate, addToCart} = useStore();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || '',
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const isOutOfStock = selectedVariant?.stockStatus === 'out_of_stock';
  const categoryLabel =
    product.category === 'cats'
      ? 'Cats'
      : product.category === 'birds'
        ? 'Birds'
        : 'Rabbits';

  const handleAdd = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(product.id, selectedVariant.id, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group bg-white border border-[#E5E2D6] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image */}
      <a
        href={`/product/${product.id}`}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }}
        className="block relative h-44 sm:h-48 bg-[#FAF8F0] overflow-hidden"
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </a>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Unboxed Clean Metadata Line (Zero-Pill Discipline) */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#202820]/65 font-medium mb-1.5">
          <span>{categoryLabel}</span>
          {product.brand ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{product.brand}</span>
            </>
          ) : null}
          {product.isDraft ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#075C28] font-semibold">Draft Catalog Entry</span>
            </>
          ) : product.isBestseller ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#075C28] font-semibold">Popular Pick</span>
            </>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-base sm:text-lg text-[#202820] leading-snug mb-2">
          <a
            href={`/product/${product.id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/product/${product.id}`);
            }}
            className="hover:text-[#075C28] transition-colors"
          >
            {product.name}
          </a>
        </h3>

        {/* Description */}
        <p className="text-sm text-[#202820]/75 leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Pack Size Selector */}
        <div className="mb-4">
          <p className="text-xs font-medium text-[#202820]/70 mb-1.5">Pack Size</p>
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === selectedVariant?.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#183D2A] text-white border-[#183D2A]'
                      : 'bg-[#FAF8F0] text-[#202820] border-[#E5E2D6] hover:border-[#075C28]'
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Stock Status */}
        <div className="mt-auto pt-3 border-t border-[#E5E2D6] space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {selectedVariant && selectedVariant.price !== null ? (
                <span className="text-lg font-bold text-[#075C28] tabular-nums">
                  {formatNaira(selectedVariant.price)}
                </span>
              ) : (
                <span className="text-sm font-semibold text-[#075C28]">
                  Request a Quote
                </span>
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                isOutOfStock ? 'text-red-700' : 'text-[#202820]/70'
              }`}
            >
              {selectedVariant ? getStockLabel(selectedVariant.stockStatus) : 'Available'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center border border-[#E5E2D6] rounded-lg bg-[#FAF8F0] h-11">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-full flex items-center justify-center text-[#202820] hover:text-[#075C28] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-full flex items-center justify-center text-[#202820] hover:text-[#075C28] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 h-11 px-3 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-[#E5E2D6] text-[#202820]/50 cursor-not-allowed'
                  : justAdded
                    ? 'bg-[#F4B900] text-[#202820]'
                    : 'bg-[#075C28] text-white hover:bg-[#183D2A]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isOutOfStock ? 'Out of Stock' : justAdded ? 'Added' : 'Add to Cart'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/product/${product.id}`)}
            className="w-full py-2 text-xs font-semibold text-[#183D2A] hover:text-[#075C28] underline underline-offset-4 cursor-pointer text-center"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};
