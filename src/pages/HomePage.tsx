import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import {FaqSection} from '../components/FaqSection';
import {ProductCard} from '../components/ProductCard';
import {SafeImage} from '../components/SafeImage';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

export const HomePage: React.FC = () => {
  const {store, navigate} = useStore();
  if (!store) return null;

  const {settings, categories, products, faqs, testimonials} = store;

  const featuredProducts = products.filter((p) => p.isFeatured);
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts.slice(0, 6) : products.slice(0, 6);

  const whatsappEnquiryUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hello OKIKS PET NUTRITION, I would like to make an enquiry about your pet food products. Please assist me.',
  );

  const trustPillars = [
    {
      title: 'Quality-Focused Pet Nutrition',
      desc: 'Carefully sourced feeds selected to support everyday vitality for cats, birds, and rabbits.',
    },
    {
      title: 'Affordable Options',
      desc: 'Practical feeding choices tailored for individual pet parents, breeders, and pet shops.',
    },
    {
      title: 'Trusted & Original Products',
      desc: 'Consistent stock handling from our established Tanke, Ilorin physical storefront.',
    },
    {
      title: 'Helpful Customer Assistance',
      desc: 'Direct guidance on product selection and pack availability through WhatsApp.',
    },
    {
      title: 'Nationwide Delivery',
      desc: 'Dispatch arranged across Nigeria, or fee-free pickup directly at our Ilorin shop.',
    },
    {
      title: 'Convenient WhatsApp Ordering',
      desc: 'Build your cart online and send a clear order summary to our team in seconds.',
    },
  ];

  const orderSteps = [
    {
      step: '01',
      title: 'Choose your pet category and products',
      desc: 'Explore Cat, Bird, or Rabbit feeds, compare available pack sizes, and inspect product details.',
    },
    {
      step: '02',
      title: 'Add products and quantities to your cart',
      desc: 'Select your preferred pack options across multiple pet categories in one convenient cart.',
    },
    {
      step: '03',
      title: 'Review your order and send it through WhatsApp',
      desc: 'Enter delivery or Tanke pickup details, review your complete order summary, and confirm on WhatsApp.',
    },
  ];

  return (
    <div>
      {/* SECTION 2: HERO */}
      <section className="bg-[#FAF8F0] border-b border-[#E5E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#075C28] uppercase">
                {settings.tagline} · Tanke, Ilorin &amp; Nationwide
              </p>

              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#183D2A] leading-[1.12] tracking-tight text-balance">
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#202820]/80 leading-relaxed max-w-xl">
                {settings.heroSubtext}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="px-6 py-3.5 rounded-lg bg-[#075C28] text-white font-semibold text-base hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-lg border border-[#183D2A]/30 bg-white text-[#183D2A] font-semibold text-base hover:bg-[#F4B900]/15 hover:border-[#075C28] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#075C28]" aria-hidden="true" />
                  <span>Chat With Us</span>
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#202820]/70 font-medium">
                <span>Cats, Birds &amp; Rabbits</span>
                <span aria-hidden="true">·</span>
                <span>2 Years Serving Pet Owners</span>
                <span aria-hidden="true">·</span>
                <span>Bank Transfer After Confirmation</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-[#E5E2D6] p-2 shadow-sm max-w-md lg:max-w-[440px] mx-auto">
                <img
                  src="/assets/aistudio/OKIKS_Pet_Nutrition__LOGO_a91876f9.png"
                  alt="OKIKS PET NUTRITION — Healthy Pets. Happy Lives. Featuring cat, bird, and rabbit nutrition"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SHOP BY PET CATEGORY */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                Shop By Pet Category
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A] text-balance">
                Dedicated nutrition for your favourite companion
              </h2>
            </div>
            <a
              href="/shop"
              onClick={(e) => {
                e.preventDefault();
                navigate('/shop');
              }}
              className="text-sm font-semibold text-[#075C28] hover:text-[#183D2A] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categories
              .filter((c) => c.isActive)
              .map((cat) => {
                const ctaLabel =
                  cat.id === 'cats'
                    ? 'Explore Cat Products'
                    : cat.id === 'birds'
                      ? 'Explore Bird Products'
                      : 'Explore Rabbit Products';
                return (
                  <article
                    key={cat.id}
                    className="group bg-[#FAF8F0] border border-[#E5E2D6] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <a
                      href={`/${cat.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${cat.slug}`);
                      }}
                      className="block h-44 sm:h-48 bg-white overflow-hidden"
                    >
                      <SafeImage
                        src={cat.heroImage}
                        alt={`${cat.name} pet food and nutrition`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </a>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-xl text-[#183D2A] mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-[#202820]/80 leading-relaxed mb-5 flex-1">
                        {cat.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/${cat.slug}`)}
                        className="w-full py-3 px-4 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{ctaLabel}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED PRODUCTS */}
      <section className="py-16 sm:py-20 bg-[#FAF8F0] border-y border-[#E5E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                Featured Catalog
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A] text-balance">
                Explore Cat, Bird &amp; Rabbit Products
              </h2>
              <p className="text-sm text-[#202820]/75 mt-2 leading-relaxed">
                Select pack sizes and quantities to build your cart. Draft catalog placeholders
                await verified brand &amp; pricing updates from the Admin Dashboard and can be
                quoted directly on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="self-start md:self-auto px-5 py-2.5 rounded-lg border border-[#183D2A]/25 bg-white text-sm font-semibold text-[#183D2A] hover:border-[#075C28] transition-colors cursor-pointer whitespace-nowrap"
            >
              View All Products
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 & 6: WHY CHOOSE OKIKS & HOW TO ORDER */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Why Choose OKIKS */}
          <div>
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                Why Choose OKIKS
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A] text-balance">
                Dependable pet nutrition with local store accountability
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-6 rounded-xl border border-[#E5E2D6] bg-[#FAF8F0]/60 space-y-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#075C28]" aria-hidden="true" />
                  <h3 className="font-display font-semibold text-lg text-[#183D2A]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#202820]/75 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How To Order */}
          <div className="pt-12 border-t border-[#E5E2D6]">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                How To Order
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A]">
                Three simple steps from cart to WhatsApp
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {orderSteps.map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-xl bg-[#183D2A] text-[#FAF8F0] space-y-3"
                >
                  <span className="font-display font-bold text-2xl text-[#F4B900] tabular-nums block">
                    {item.step}.
                  </span>
                  <h3 className="font-display font-semibold text-lg text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#FAF8F0]/80 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 & 8: DELIVERY, PICKUP & ABOUT OKIKS */}
      <section className="py-16 sm:py-20 bg-[#FAF8F0] border-t border-[#E5E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Delivery & Pickup */}
          <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                Delivery &amp; Pickup
              </p>
              <h2 className="font-display font-bold text-2xl text-[#183D2A]">
                Nationwide Nigerian Delivery or Tanke Store Pickup
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#202820]/80 leading-relaxed">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <p>{settings.deliveryNote}</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#183D2A]">Physical Store Pickup</p>
                  <p className="mt-0.5">{settings.pickupInfo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About OKIKS */}
          <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                About {settings.businessName}
              </p>
              <h2 className="font-display font-bold text-2xl text-[#183D2A]">
                {settings.yearsOperating} of serving Nigeria&apos;s pet community
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#202820]/80 leading-relaxed">
              {settings.aboutText}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors cursor-pointer"
              >
                Read Our Story
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-lg border border-[#E5E2D6] text-sm font-semibold text-[#183D2A] hover:border-[#075C28] transition-colors cursor-pointer"
              >
                Visit or Contact Store
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: GENUINE TESTIMONIALS (WHEN ENABLED & PRESENT) OR TRUST COMMITMENT */}
      {settings.showTestimonials && testimonials.length > 0 ? (
        <section className="py-16 sm:py-20 bg-white border-t border-[#E5E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
                Customer Feedback
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A]">
                Verified words from our customers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="p-6 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] flex flex-col justify-between space-y-4"
                >
                  <p className="text-sm text-[#202820]/85 leading-relaxed">“{t.quote}”</p>
                  <footer className="text-xs text-[#202820]/70">
                    <strong className="text-[#183D2A] font-semibold block">
                      {t.customerName}
                    </strong>
                    <span>{t.roleOrPet}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-white border-t border-[#E5E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-[#FAF8F0] border border-[#E5E2D6] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#075C28] uppercase">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Direct Storefront Support</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A]">
                  Serving pet owners, breeders, pet shops &amp; veterinary professionals
                </h2>
                <p className="text-sm sm:text-base text-[#202820]/80 leading-relaxed max-w-2xl">
                  Every order goes straight to our team on WhatsApp before payment so we can
                  verify current batch availability, confirm exact pack weights, and agree on
                  the best delivery or Tanke, Ilorin pickup option.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#075C28] text-white font-semibold text-sm hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#F4B900]" aria-hidden="true" />
                  <span>Ask About Stock &amp; Pricing</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: FAQ */}
      <FaqSection faqs={faqs} />

      {/* SECTION 11: FINAL CTA */}
      <section className="py-16 sm:py-20 bg-[#075C28] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-[#F4B900]">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white text-balance">
            Your Pet Deserves Better Nutrition.
          </h2>
          <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            Find quality nutrition essentials for your favourite companion. Explore our products
            and order directly through WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#F4B900] text-[#202820] font-bold text-base hover:bg-[#ffca28] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Explore Products</span>
            </button>
            <a
              href={whatsappEnquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#F4B900]" aria-hidden="true" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
