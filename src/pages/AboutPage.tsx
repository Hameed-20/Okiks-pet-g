import React from 'react';
import {CheckCircle2, MapPin, MessageCircle, ShoppingBag} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

export const AboutPage: React.FC = () => {
  const {store, navigate} = useStore();
  if (!store) return null;

  const {settings} = store;
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hello OKIKS PET NUTRITION, I would like to learn more about your products and services.',
  );

  const customersServed = [
    'Household Pet Owners',
    'Animal Breeders',
    'Retail Pet Shops',
    'Veterinary Professionals',
    'Bird & Rabbit Enthusiasts',
  ];

  return (
    <div className="bg-[#FAF8F0] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase">
              About {settings.businessName}
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#183D2A] text-balance">
              {settings.tagline}
            </h1>
            <p className="text-base text-[#202820]/80 leading-relaxed">{settings.aboutText}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-6 py-3 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] inline-flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Explore Catalog</span>
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-[#183D2A]/25 text-sm font-semibold text-[#183D2A] hover:border-[#075C28] inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#075C28]" aria-hidden="true" />
                <span>Chat With Us</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <img
              src="/assets/aistudio/OKIKS_Pet_Nutrition__LOGO_a91876f9.png"
              alt="OKIKS PET NUTRITION Official Brand Visual"
              className="w-full max-w-xs sm:max-w-sm mx-auto h-auto rounded-xl border border-[#E5E2D6] object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display font-bold text-xl text-[#183D2A]">Who We Serve</h2>
            <p className="text-sm text-[#202820]/75 leading-relaxed">
              Whether you are feeding one beloved family cat, managing an aviary, or running a
              commercial rabbitry, our focus is consistent supply and clear pricing.
            </p>
            <ul className="space-y-2.5 pt-1">
              {customersServed.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-medium text-[#202820]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#075C28] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display font-bold text-xl text-[#183D2A]">
              Physical Store &amp; Nationwide Reach
            </h2>
            <div className="flex items-start gap-3 text-sm text-[#202820]/80 leading-relaxed">
              <MapPin className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[#183D2A] mb-1">Store Location</p>
                <p>{settings.address}</p>
              </div>
            </div>
            <p className="text-sm text-[#202820]/80 leading-relaxed">{settings.deliveryNote}</p>
            <p className="text-sm text-[#202820]/80 leading-relaxed">
              All orders are verified by our team on WhatsApp before payment is made via bank
              transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
