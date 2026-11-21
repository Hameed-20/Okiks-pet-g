import React from 'react';
import {CartDrawer} from './components/CartDrawer';
import {FloatingWhatsApp} from './components/FloatingWhatsApp';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {PrivacyModal} from './components/PrivacyModal';
import {StoreProvider, useStore} from './context/StoreContext';
import {AboutPage} from './pages/AboutPage';
import {AdminPage} from './pages/AdminPage';
import {CheckoutPage} from './pages/CheckoutPage';
import {ContactPage} from './pages/ContactPage';
import {HomePage} from './pages/HomePage';
import {ProductDetailPage} from './pages/ProductDetailPage';
import {ShopPage} from './pages/ShopPage';

const StorefrontRouter: React.FC = () => {
  const {loading, error, currentPath, refreshStore} = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F0]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm font-medium text-[#183D2A]">
            Loading OKIKS PET NUTRITION storefront...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F0]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h1 className="font-display font-bold text-2xl text-[#183D2A]">
            Could not load storefront
          </h1>
          <p className="text-sm text-[#202820]/75 max-w-md">{error}</p>
          <button
            type="button"
            onClick={() => void refreshStore()}
            className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer"
          >
            Try Again
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const normalized = currentPath.toLowerCase().replace(/\/+$/, '') || '/';

  let pageView: React.ReactNode;
  if (normalized === '/') {
    pageView = <HomePage />;
  } else if (normalized === '/shop') {
    pageView = <ShopPage />;
  } else if (normalized === '/cats') {
    pageView = <ShopPage forcedCategory="cats" />;
  } else if (normalized === '/birds') {
    pageView = <ShopPage forcedCategory="birds" />;
  } else if (normalized === '/rabbits') {
    pageView = <ShopPage forcedCategory="rabbits" />;
  } else if (normalized.startsWith('/product/')) {
    const productId = currentPath.slice('/product/'.length);
    pageView = <ProductDetailPage productId={productId} />;
  } else if (normalized === '/checkout') {
    pageView = <CheckoutPage />;
  } else if (normalized === '/about') {
    pageView = <AboutPage />;
  } else if (normalized === '/contact') {
    pageView = <ContactPage />;
  } else if (normalized === '/admin') {
    pageView = <AdminPage />;
  } else {
    pageView = <HomePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F0] text-[#202820] overflow-x-hidden">
      <Header />
      <main className="flex-1">{pageView}</main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
      <PrivacyModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontRouter />
    </StoreProvider>
  );
}
