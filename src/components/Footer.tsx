import React from 'react';
import {MapPin, MessageCircle, ShieldCheck, Truck} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

export const Footer: React.FC = () => {
  const {store, navigate, setPrivacyOpen} = useStore();
  const settings = store?.settings;
  const businessName = settings?.businessName || 'OKIKS PET NUTRITION';
  const tagline = settings?.tagline || 'Healthy Pets. Happy Lives.';
  const address =
    settings?.address ||
    'Opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin, Kwara State, Nigeria.';
  const whatsappNumber = settings?.whatsappNumber || '2347053797289';
  const displayPhone = settings?.displayPhone || '+234 705 379 7289';

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    'Hello OKIKS PET NUTRITION, I would like to make an enquiry about your pet food products. Please assist me.',
  );

  return (
    <footer className="bg-[#183D2A] text-[#FAF8F0] border-t border-[#075C28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-2 inline-block">
              <img
                src="/assets/aistudio/OKIKS_Pet_Nutrition__LOGO_a91876f9.png"
                alt="OKIKS PET NUTRITION Official Brand Logo"
                className="h-14 w-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">{businessName}</h2>
              <p className="text-sm text-[#F4B900] font-medium mt-0.5">{tagline}</p>
            </div>
            <p className="text-sm text-[#FAF8F0]/80 leading-relaxed">
              Trusted pet nutrition store serving cat, bird, and rabbit owners, breeders,
              pet shops, and veterinary professionals across Nigeria.
            </p>
          </div>

          {/* Navigation & Categories */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-[#F4B900]">
              Shop Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/shop"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/shop');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  All Pet Products
                </a>
              </li>
              <li>
                <a
                  href="/cats"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cats');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  Cat Food &amp; Essentials
                </a>
              </li>
              <li>
                <a
                  href="/birds"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/birds');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  Bird Feeds &amp; Seed Mixes
                </a>
              </li>
              <li>
                <a
                  href="/rabbits"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/rabbits');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  Rabbit Pellets &amp; Forage
                </a>
              </li>
            </ul>

            <h3 className="font-display font-semibold text-sm tracking-wide text-[#F4B900] pt-3">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  About OKIKS
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/contact');
                  }}
                  className="text-[#FAF8F0]/85 hover:text-[#F4B900] transition-colors"
                >
                  Contact &amp; Visit Us
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-[#F4B900]">
              Delivery &amp; Ordering
            </h3>
            <div className="space-y-3 text-sm text-[#FAF8F0]/85 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#F4B900] shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  Nationwide delivery across Nigeria. Delivery charges and estimates depend on
                  your state and are confirmed on WhatsApp.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="w-4 h-4 text-[#F4B900] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p>
                  Orders are confirmed via WhatsApp and paid via bank transfer once availability
                  and total cost are verified.
                </p>
              </div>
            </div>
          </div>

          {/* Store Location & WhatsApp */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-[#F4B900]">
              Store Location &amp; Support
            </h3>
            <div className="space-y-3 text-sm text-[#FAF8F0]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F4B900] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">{address}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle
                  className="w-4 h-4 text-[#F4B900] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-[#FAF8F0]/70">WhatsApp Ordering Line</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-[#F4B900] transition-colors tabular-nums"
                  >
                    {displayPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Admin Row */}
        <div className="mt-12 pt-8 border-t border-[#FAF8F0]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F0]/75">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-[#F4B900] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin');
              }}
              className="hover:text-[#F4B900] transition-colors"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
