import React, {useState} from 'react';
import {Menu, ShoppingBag, X} from 'lucide-react';
import {useStore} from '../context/StoreContext';

const NAV_LINKS = [
  {label: 'Home', path: '/'},
  {label: 'Shop', path: '/shop'},
  {label: 'Cats', path: '/cats'},
  {label: 'Birds', path: '/birds'},
  {label: 'Rabbits', path: '/rabbits'},
  {label: 'About Us', path: '/about'},
  {label: 'Contact', path: '/contact'},
];

export const Header: React.FC = () => {
  const {store, currentPath, navigate, cartCalc, setCartOpen, cartFeedback} = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const announcement =
    store?.settings.announcementText || 'Quality Nutrition for Happier, Healthier Pets.';
  const businessName = store?.settings.businessName || 'OKIKS PET NUTRITION';

  const handleNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="bg-[#183D2A] text-[#FAF8F0] text-xs font-medium py-2 px-4 text-center tracking-wide">
        <p className="truncate max-w-6xl mx-auto">{announcement}</p>
      </div>

      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E5E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Logo & Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075C28] rounded"
          >
            <img
              src="/assets/aistudio/OKIKS_Pet_Nutrition__LOGO_a91876f9.png"
              alt="OKIKS PET NUTRITION Logo"
              className="h-8 w-auto rounded object-contain shrink-0"
            />
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#183D2A] whitespace-nowrap">
              {businessName}
            </span>
          </a>

          {/* Zone 2: Primary Single-Line Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#202820]"
          >
            {NAV_LINKS.map((link) => {
              const active = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.path);
                  }}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#075C28] ${
                    active
                      ? 'border-[#075C28] text-[#075C28] font-semibold'
                      : 'border-transparent text-[#202820]/80 hover:text-[#075C28] hover:border-[#F4B900]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Cart Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping cart with ${cartCalc.totalQuantity} items`}
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[42px] rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4B900]"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              <span className="tabular-nums font-bold text-[#F4B900]">
                ({cartCalc.totalQuantity})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E5E2D6] text-[#183D2A] hover:bg-[#FAF8F0] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Category Quick Strip + Slide Menu */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-[#E5E2D6] bg-white px-4 py-4 space-y-1"
          >
            {NAV_LINKS.map((link) => {
              const active = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.path);
                  }}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-[#075C28] text-white'
                      : 'text-[#202820] hover:bg-[#FAF8F0]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-2 mt-2 border-t border-[#E5E2D6]">
              <a
                href="/checkout"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('/checkout');
                }}
                className="block px-3 py-3 rounded-lg text-base font-medium text-[#075C28] hover:bg-[#FAF8F0]"
              >
                WhatsApp Checkout
              </a>
            </div>
          </nav>
        )}

        {/* Added-to-cart confirmation banner */}
        {cartFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="bg-[#F4B900] text-[#202820] text-xs sm:text-sm font-semibold py-2 px-4 text-center border-t border-[#E5E2D6]"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
              <span>{cartFeedback}</span>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="underline font-bold cursor-pointer hover:text-[#075C28]"
              >
                View Cart
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
