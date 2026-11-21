import React from 'react';
import {X} from 'lucide-react';
import {useStore} from '../context/StoreContext';

export const PrivacyModal: React.FC = () => {
  const {privacyOpen, setPrivacyOpen, store} = useStore();
  if (!privacyOpen) return null;

  const businessName = store?.settings.businessName || 'OKIKS PET NUTRITION';
  const address =
    store?.settings.address ||
    'Opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin, Kwara State, Nigeria.';
  const phone = store?.settings.displayPhone || '+234 705 379 7289';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202820]/60"
      role="dialog"
      aria-modal="true"
      aria-label="Privacy Policy"
    >
      <div className="bg-white border border-[#E5E2D6] rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E5E2D6] flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[#183D2A]">
            Privacy Policy — {businessName}
          </h2>
          <button
            type="button"
            onClick={() => setPrivacyOpen(false)}
            aria-label="Close privacy policy"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#FAF8F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#202820]/85 leading-relaxed">
          <p>
            {businessName} respects your privacy. This storefront uses browser local storage
            solely to remember the items in your shopping cart across page visits.
          </p>
          <p>
            When you proceed to checkout, the name, phone number, and delivery address you enter
            are formatted into a WhatsApp message on your device so you can review and send your
            order directly to {phone}. We do not process online card payments on this website.
          </p>
          <p>
            Your order details are used strictly to confirm product availability, coordinate
            delivery or Tanke, Ilorin store pickup, and verify bank transfer payments.
          </p>
          <p className="text-xs text-[#202820]/65 pt-2 border-t border-[#E5E2D6]">
            Store Address: {address}
          </p>
        </div>
      </div>
    </div>
  );
};
