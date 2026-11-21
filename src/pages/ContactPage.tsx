import React, {useState} from 'react';
import {MapPin, MessageCircle, Send, Truck} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {buildWhatsAppUrl} from '../utils/storeHelpers';

export const ContactPage: React.FC = () => {
  const {store} = useStore();
  const [name, setName] = useState('');
  const [petType, setPetType] = useState('Cats');
  const [message, setMessage] = useState('');

  if (!store) return null;
  const {settings} = store;

  const directEnquiryUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hello OKIKS PET NUTRITION, I would like to make an enquiry about your pet food products. Please assist me.',
  );

  const customMessage = `Hello ${settings.businessName},\nName: ${name.trim() || 'Customer'}\nPet Category: ${petType}\nEnquiry: ${message.trim() || 'I would like product & pricing details.'}`;
  const customWhatsAppUrl = buildWhatsAppUrl(settings.whatsappNumber, customMessage);

  return (
    <div className="bg-[#FAF8F0] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
            Contact &amp; Store Visit
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#183D2A] mb-3">
            Reach {settings.businessName}
          </h1>
          <p className="text-base text-[#202820]/80 leading-relaxed">
            Have questions about cat, bird, or rabbit feed availability, pack sizes, or
            nationwide delivery? Message us directly on WhatsApp or visit our store in Tanke,
            Ilorin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Store Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display font-bold text-base text-[#183D2A]">
                    Physical Store Address
                  </h2>
                  <p className="text-sm text-[#202820]/80 mt-1 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#E5E2D6]">
                <MessageCircle
                  className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-display font-bold text-base text-[#183D2A]">
                    WhatsApp Ordering &amp; Enquiries
                  </h2>
                  <p className="text-sm font-semibold text-[#075C28] mt-1 tabular-nums">
                    {settings.displayPhone}
                  </p>
                  <a
                    href={directEnquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#183D2A] underline underline-offset-4 mt-2 hover:text-[#075C28]"
                  >
                    Open Direct WhatsApp Chat
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#E5E2D6]">
                <Truck className="w-5 h-5 text-[#075C28] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display font-bold text-base text-[#183D2A]">
                    Delivery &amp; Bank Transfer
                  </h2>
                  <p className="text-sm text-[#202820]/80 mt-1 leading-relaxed">
                    {settings.deliveryNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Enquiry Composer */}
          <div className="lg:col-span-7 bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="font-display font-bold text-xl text-[#183D2A]">
                Send a WhatsApp Enquiry
              </h2>
              <p className="text-sm text-[#202820]/70 mt-1">
                Fill in your question below to open a pre-filled chat with our team.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-pet"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  Pet Category
                </label>
                <select
                  id="contact-pet"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                >
                  <option value="Cats">Cats</option>
                  <option value="Birds">Birds</option>
                  <option value="Rabbits">Rabbits</option>
                  <option value="Multiple Pets / Wholesale">Multiple Pets / Wholesale</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-msg"
                className="block text-xs font-semibold text-[#202820] mb-1.5"
              >
                Your Enquiry
              </label>
              <textarea
                id="contact-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about specific product availability, pack sizes, breeder bulk rates, or delivery to your state..."
                className="w-full p-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
              />
            </div>

            <a
              href={customWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#F4B900]" aria-hidden="true" />
              <span>Continue to WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
