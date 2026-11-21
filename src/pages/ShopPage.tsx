import React, {useMemo, useState} from 'react';
import {MessageCircle, Search, SlidersHorizontal, X} from 'lucide-react';
import {ProductCard} from '../components/ProductCard';
import {SafeImage} from '../components/SafeImage';
import {useStore} from '../context/StoreContext';
import type {CategoryId} from '../types';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

interface ShopPageProps {
  forcedCategory?: CategoryId;
}

export const ShopPage: React.FC<ShopPageProps> = ({forcedCategory}) => {
  const {store, navigate} = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    forcedCategory || 'all',
  );
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'featured'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'price_asc' | 'price_desc'>(
    'default',
  );

  // Keep active category synced when user navigates between /cats, /birds, /rabbits, /shop
  React.useEffect(() => {
    setSelectedCategory(forcedCategory || 'all');
  }, [forcedCategory]);

  const products = store?.products || [];
  const categories = store?.categories || [];
  const settings = store?.settings;

  const activeCategoryInfo = forcedCategory
    ? categories.find((c) => c.id === forcedCategory)
    : undefined;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const effectiveCategory = forcedCategory || selectedCategory;

    const list = products.filter((p) => {
      if (effectiveCategory !== 'all' && p.category !== effectiveCategory) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.description} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (availabilityFilter === 'in_stock') {
        const hasStock = p.variants.some(
          (v) => v.stockStatus === 'in_stock' || v.stockStatus === 'low_stock',
        );
        if (!hasStock) return false;
      } else if (availabilityFilter === 'featured') {
        if (!p.isFeatured && !p.isBestseller) return false;
      }
      return true;
    });

    const getLowestPrice = (p: (typeof list)[number]) => {
      const nums = p.variants
        .map((v) => v.price)
        .filter((val): val is number => val !== null && Number.isFinite(val));
      return nums.length > 0 ? Math.min(...nums) : Number.POSITIVE_INFINITY;
    };

    if (sortBy === 'name_asc') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => {
        const pa = getLowestPrice(a);
        const pb = getLowestPrice(b);
        if (pa === Infinity && pb === Infinity) return 0;
        if (pa === Infinity) return 1;
        if (pb === Infinity) return -1;
        return pb - pa;
      });
    }
    return list;
  }, [products, forcedCategory, selectedCategory, searchQuery, availabilityFilter, sortBy]);

  // Related products from other categories when viewing a dedicated category page
  const relatedOtherCategoryProducts = useMemo(() => {
    if (!forcedCategory) return [];
    return products.filter((p) => p.category !== forcedCategory).slice(0, 3);
  }, [products, forcedCategory]);

  const enquiryUrl = buildWhatsAppUrl(
    settings?.whatsappNumber || '2347053797289',
    activeCategoryInfo
      ? `Hello OKIKS PET NUTRITION, I would like to enquire about your ${activeCategoryInfo.name} nutrition products.`
      : 'Hello OKIKS PET NUTRITION, I would like to make an enquiry about your pet food products.',
  );

  return (
    <div className="bg-[#FAF8F0] min-h-screen">
      {/* Category Hero or General Shop Header */}
      {activeCategoryInfo ? (
        <section className="bg-white border-b border-[#E5E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#202820]/65">
                  <a
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                    }}
                    className="hover:text-[#075C28]"
                  >
                    Home
                  </a>
                  <span className="mx-2" aria-hidden="true">
                    /
                  </span>
                  <span className="text-[#075C28] font-semibold">{activeCategoryInfo.name}</span>
                </nav>

                <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#183D2A] text-balance">
                  {activeCategoryInfo.headline}
                </h1>
                <p className="text-base sm:text-lg text-[#202820]/80 leading-relaxed max-w-2xl">
                  {activeCategoryInfo.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={enquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#F4B900]" aria-hidden="true" />
                    <span>Enquire About {activeCategoryInfo.name} Feed</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate('/shop')}
                    className="px-4 py-2.5 rounded-lg border border-[#E5E2D6] text-sm font-semibold text-[#183D2A] hover:border-[#075C28] transition-colors cursor-pointer"
                  >
                    Browse All Pet Categories
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="max-w-xs sm:max-w-sm mx-auto aspect-[16/10] rounded-2xl overflow-hidden border border-[#E5E2D6] bg-[#FAF8F0]">
                  <SafeImage
                    src={activeCategoryInfo.heroImage}
                    alt={activeCategoryInfo.headline}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border-b border-[#E5E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
              Full Store Catalog
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#183D2A] mb-3">
              Shop Pet Nutrition Essentials
            </h1>
            <p className="text-base text-[#202820]/80 max-w-2xl leading-relaxed">
              Filter by pet category, search by product name, and add items from multiple
              categories into a single WhatsApp order.
            </p>
          </div>
        </section>
      )}

      {/* Search, Category Filter & Sort Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-[#E5E2D6] rounded-xl p-4 sm:p-5 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-xl">
              <Search
                className="w-4 h-4 text-[#202820]/50 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCategoryInfo ? activeCategoryInfo.name.toLowerCase() : 'all'} products by name...`}
                aria-label="Search products by name"
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm text-[#202820] placeholder:text-[#202820]/50 focus:outline-none focus:border-[#075C28]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#202820]/60 hover:text-[#202820] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#202820]/70 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Filter:</span>
              </div>

              <select
                value={availabilityFilter}
                onChange={(e) =>
                  setAvailabilityFilter(e.target.value as 'all' | 'in_stock' | 'featured')
                }
                aria-label="Filter by availability"
                className="h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-xs sm:text-sm font-medium text-[#202820] focus:outline-none focus:border-[#075C28]"
              >
                <option value="all">All Items</option>
                <option value="featured">Featured &amp; Popular</option>
                <option value="in_stock">Confirmed In Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'default' | 'name_asc' | 'price_asc' | 'price_desc',
                  )
                }
                aria-label="Sort products"
                className="h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-xs sm:text-sm font-medium text-[#202820] focus:outline-none focus:border-[#075C28]"
              >
                <option value="default">Sort: Featured Order</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Tabs on /shop */}
          {!forcedCategory && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E2D6]">
              {(
                [
                  {id: 'all', label: 'All Categories'},
                  {id: 'cats', label: 'Cats'},
                  {id: 'birds', label: 'Birds'},
                  {id: 'rabbits', label: 'Rabbits'},
                ] as const
              ).map((tab) => {
                const active = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#075C28] text-white'
                        : 'bg-[#FAF8F0] text-[#202820] border border-[#E5E2D6] hover:border-[#075C28]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Count */}
        <p className="text-xs sm:text-sm text-[#202820]/70 font-medium mb-5 tabular-nums">
          Showing {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {/* Product Grid or Helpful Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E5E2D6] rounded-2xl p-10 text-center space-y-4">
            <h2 className="font-display font-bold text-xl text-[#183D2A]">
              No matching products found
            </h2>
            <p className="text-sm text-[#202820]/75 max-w-md mx-auto">
              Try clearing your search or filter selections, or contact us directly on WhatsApp
              if you are looking for a specific brand or pack size.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                  if (!forcedCategory) setSelectedCategory('all');
                }}
                className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer"
              >
                Reset Filters
              </button>
              <a
                href={enquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg border border-[#183D2A]/25 text-sm font-semibold text-[#183D2A] hover:border-[#075C28]"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Related Products From Other Categories (Explicitly Separated on Category Pages) */}
        {forcedCategory && relatedOtherCategoryProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E5E2D6]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-1">
                  Related Categories
                </p>
                <h2 className="font-display font-bold text-2xl text-[#183D2A]">
                  Other Pet Nutrition Products You May Also Need
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="text-sm font-semibold text-[#075C28] hover:underline cursor-pointer self-start sm:self-auto"
              >
                Explore All Categories
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedOtherCategoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
