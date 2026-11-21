import React, {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import type {FaqItem} from '../types';

export const FaqSection: React.FC<{faqs: FaqItem[]}> = ({faqs}) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  if (!faqs.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-[#E5E2D6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase mb-2">
            Frequently Asked Questions
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#183D2A] text-balance">
            Everything you need to know about ordering
          </h2>
        </div>

        <div className="divide-y divide-[#E5E2D6] border-y border-[#E5E2D6]">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full py-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="font-display font-semibold text-base sm:text-lg text-[#202820] group-hover:text-[#075C28] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#075C28] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="pb-5 pr-8 text-sm sm:text-base text-[#202820]/80 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
