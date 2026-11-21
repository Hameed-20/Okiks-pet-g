import React from 'react';
import {MessageCircle} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

export const FloatingWhatsApp: React.FC = () => {
  const {store, currentPath} = useStore();

  // Keep admin workspace uncluttered
  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const phone = store?.settings.whatsappNumber || '2347053797289';
  const enquiryUrl = buildWhatsAppUrl(
    phone,
    'Hello OKIKS PET NUTRITION, I would like to make an enquiry about your pet food products. Please assist me.',
  );

  return (
    <a
      href={enquiryUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with OKIKS PET NUTRITION on WhatsApp"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#075C28] text-white shadow-lg border border-white/20 hover:bg-[#183D2A] hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4B900]"
    >
      <MessageCircle className="w-5 h-5 text-[#F4B900] shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
        Chat on WhatsApp
      </span>
    </a>
  );
};
