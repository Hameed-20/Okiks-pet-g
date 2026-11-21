import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {DEFAULT_STATIC_STORE} from '../data/defaultStore';
import type {CartItem, StoreData} from '../types';
import {calculateCart, type CartCalculation} from '../utils/storeHelpers';

const CART_STORAGE_KEY = 'okiks_pet_nutrition_cart_v1';

interface StoreContextValue {
  store: StoreData | null;
  loading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  currentPath: string;
  navigate: (to: string) => void;
  cart: CartItem[];
  cartCalc: CartCalculation;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  cartFeedback: string | null;
  privacyOpen: boolean;
  setPrivacyOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function loadPersistedCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === 'string' &&
        typeof item.variantId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [cart, setCart] = useState<CartItem[]>(loadPersistedCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const refreshStore = useCallback(async () => {
    try {
      try {
        const res = await fetch('/api/store');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as StoreData;
          setStore(data);
          setError(null);
          return;
        }
      } catch {
        // Fall through to static snapshot
      }

      try {
        const snapRes = await fetch('/store-snapshot.json');
        const snapType = snapRes.headers.get('content-type') || '';
        if (snapRes.ok && snapType.includes('application/json')) {
          const snapData = (await snapRes.json()) as StoreData;
          setStore(snapData);
          setError(null);
          return;
        }
      } catch {
        // Fall through to built-in default catalog
      }

      setStore(DEFAULT_STATIC_STORE);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStore();
  }, [refreshStore]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota failures
    }
  }, [cart]);

  useEffect(() => {
    const handlePop = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = useCallback((to: string) => {
    const normalized = to.startsWith('/') ? to : `/${to}`;
    if (normalized !== window.location.pathname) {
      window.history.pushState({}, '', normalized);
      setCurrentPath(normalized);
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  // Sync page title and meta description per route for SEO
  useEffect(() => {
    const baseName = store?.settings.businessName || 'OKIKS PET NUTRITION';
    const path = currentPath.toLowerCase();
    let title = `${baseName} – Healthy Pets. Happy Lives.`;
    let description =
      'Discover quality pet food and nutrition essentials for cats, birds, and rabbits across Nigeria with convenient WhatsApp ordering.';

    if (path === '/shop') {
      title = `Shop All Pet Nutrition | ${baseName}`;
      description =
        'Browse cat, bird, and rabbit feeds at OKIKS PET NUTRITION. Order nationwide across Nigeria or pick up in Tanke, Ilorin.';
    } else if (path === '/cats') {
      title = `Cat Food & Nutrition Essentials | ${baseName}`;
      description =
        'Explore dry and wet cat food options from OKIKS PET NUTRITION. Order directly via WhatsApp for delivery or Ilorin store pickup.';
    } else if (path === '/birds') {
      title = `Bird Feeds & Seed Blends | ${baseName}`;
      description =
        'Shop quality bird pellets and seed mixes at OKIKS PET NUTRITION for budgies, parrots, and companion birds.';
    } else if (path === '/rabbits') {
      title = `Rabbit Pellets & Forage | ${baseName}`;
      description =
        'Browse rabbit pellets and daily forage nutrition at OKIKS PET NUTRITION with nationwide delivery across Nigeria.';
    } else if (path === '/about') {
      title = `About Us | ${baseName}`;
      description =
        'Learn about OKIKS PET NUTRITION in Tanke, Ilorin—two years of supplying pet owners, breeders, pet shops, and vets.';
    } else if (path === '/contact') {
      title = `Contact & Store Location | ${baseName}`;
      description =
        'Visit OKIKS PET NUTRITION opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin or chat with our team on WhatsApp.';
    } else if (path === '/checkout') {
      title = `WhatsApp Checkout | ${baseName}`;
      description = 'Review your pet nutrition order and send it directly to OKIKS PET NUTRITION on WhatsApp.';
    } else if (path === '/admin') {
      title = `Owner Portal | ${baseName}`;
    } else if (path.startsWith('/product/') && store) {
      const id = currentPath.split('/product/')[1];
      const found = store.products.find((p) => p.id === id);
      if (found) {
        title = `${found.name} | ${baseName}`;
        description = found.description.slice(0, 155);
      }
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
  }, [currentPath, store]);

  const addToCart = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      if (quantity < 1) return;
      setCart((prev) => {
        const idx = prev.findIndex(
          (item) => item.productId === productId && item.variantId === variantId,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {...next[idx], quantity: next[idx].quantity + quantity};
          return next;
        }
        return [...prev, {productId, variantId, quantity}];
      });
      const prod = store?.products.find((p) => p.id === productId);
      setCartFeedback(prod ? `Added "${prod.name}" to your cart` : 'Added item to your cart');
      window.setTimeout(() => {
        setCartFeedback((curr) =>
          curr && (prod ? curr.includes(prod.name) : curr === 'Added item to your cart')
            ? null
            : curr,
        );
      }, 3000);
    },
    [store],
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) =>
          prev.filter(
            (item) => !(item.productId === productId && item.variantId === variantId),
          ),
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? {...item, quantity}
            : item,
        ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCalc = useMemo(() => {
    return calculateCart(cart, store?.products || []);
  }, [cart, store?.products]);

  return (
    <StoreContext.Provider
      value={{
        store,
        loading,
        error,
        refreshStore,
        currentPath,
        navigate,
        cart,
        cartCalc,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartFeedback,
        privacyOpen,
        setPrivacyOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
