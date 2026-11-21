import React, {useCallback, useEffect, useState} from 'react';
import {
  CheckCircle2,
  Download,
  FolderKanban,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import {SafeImage} from '../components/SafeImage';
import {useStore} from '../context/StoreContext';
import type {
  CategoryId,
  CategoryInfo,
  DeliveryZone,
  FaqItem,
  Product,
  ProductVariant,
  StockStatus,
  StoreSettings,
  Testimonial,
} from '../types';
import {formatNaira, NIGERIAN_STATES} from '../utils/storeHelpers';

type AdminTab = 'products' | 'categories' | 'delivery' | 'settings';

const EMPTY_VARIANT = (): ProductVariant => ({
  id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  label: '',
  price: null,
  stockStatus: 'in_stock',
});

export const AdminPage: React.FC = () => {
  const {store, refreshStore, navigate} = useStore();

  // Auth state held strictly in memory
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    needsSetup: boolean;
    envOverride: boolean;
    staticOnly: boolean;
  }>({loading: true, needsSetup: false, envOverride: false, staticOnly: false});

  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error'; text: string} | null>(
    null,
  );

  // Product editor state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Category editor state
  const [categoryDrafts, setCategoryDrafts] = useState<CategoryInfo[]>([]);

  // Delivery zone editor state
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Settings / FAQ / Testimonials state
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings | null>(null);
  const [faqsDraft, setFaqsDraft] = useState<FaqItem[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({
    customerName: '',
    roleOrPet: '',
    quote: '',
  });

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setFeedback({type, text});
    window.setTimeout(() => {
      setFeedback((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth-status');
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          setAuthStatus({
            loading: false,
            needsSetup: false,
            envOverride: false,
            staticOnly: true,
          });
          return;
        }
        const data = await res.json();
        setAuthStatus({
          loading: false,
          needsSetup: Boolean(data.needsSetup),
          envOverride: Boolean(data.envOverride),
          staticOnly: false,
        });
      } catch {
        setAuthStatus({
          loading: false,
          needsSetup: false,
          envOverride: false,
          staticOnly: true,
        });
      }
    };
    void checkAuth();
  }, []);

  useEffect(() => {
    if (store) {
      setCategoryDrafts(store.categories);
      setSettingsDraft(store.settings);
      setFaqsDraft(store.faqs);
    }
  }, [store]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: passwordInput}),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Could not save admin password.');
        return;
      }
      setToken(data.token);
      setPasswordInput('');
      setConfirmPasswordInput('');
      setAuthStatus((prev) => ({...prev, needsSetup: false}));
    } catch {
      setAuthError('Network error while setting up admin account.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!passwordInput) {
      setAuthError('Please enter your administrator password.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: passwordInput}),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setToken(data.token);
      setPasswordInput('');
    } catch {
      setAuthError('Network error while signing in.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      setToken(null);
      throw new Error('Your admin session expired. Please sign in again.');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be smaller than 5MB.');
      return;
    }
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({dataUrl}),
      });
      setEditingProduct({...editingProduct, image: res.url});
      showToast('success', 'Product image uploaded.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      await authFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(editingProduct),
      });
      await refreshStore();
      setEditingProduct(null);
      showToast('success', 'Product saved and published to storefront.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setSaving(true);
    try {
      await authFetch(`/api/admin/products/${id}`, {method: 'DELETE'});
      await refreshStore();
      setDeletingProductId(null);
      showToast('success', 'Product deleted.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not delete product.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (cat: CategoryInfo) => {
    setSaving(true);
    try {
      await authFetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify(cat),
      });
      await refreshStore();
      showToast('success', `${cat.name} category updated.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setSaving(true);
    try {
      await authFetch('/api/admin/delivery-zones', {
        method: 'POST',
        body: JSON.stringify(editingZone),
      });
      await refreshStore();
      setEditingZone(null);
      showToast('success', 'Delivery zone saved.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save delivery zone.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    setSaving(true);
    try {
      await authFetch(`/api/admin/delivery-zones/${id}`, {method: 'DELETE'});
      await refreshStore();
      showToast('success', 'Delivery zone deleted.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete zone.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettingsAndFaqs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    setSaving(true);
    try {
      await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsDraft),
      });
      await authFetch('/api/admin/faqs', {
        method: 'PUT',
        body: JSON.stringify({faqs: faqsDraft}),
      });
      await refreshStore();
      showToast('success', 'Business settings and FAQs saved.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.customerName.trim() || !newTestimonial.quote.trim()) {
      showToast('error', 'Enter customer name and verified quote.');
      return;
    }
    setSaving(true);
    try {
      await authFetch('/api/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify(newTestimonial),
      });
      setNewTestimonial({customerName: '', roleOrPet: '', quote: ''});
      await refreshStore();
      showToast('success', 'Verified testimonial added.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not add testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    setSaving(true);
    try {
      await authFetch(`/api/admin/testimonials/${id}`, {method: 'DELETE'});
      await refreshStore();
      showToast('success', 'Testimonial removed.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not remove testimonial.');
    } finally {
      setSaving(false);
    }
  };

  if (authStatus.loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F0]">
        <p className="text-sm font-medium text-[#183D2A]">Checking administrator access...</p>
      </div>
    );
  }

  if (authStatus.staticOnly) {
    return (
      <div className="bg-[#FAF8F0] min-h-[70vh] py-14 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#075C28]/10 text-[#075C28] flex items-center justify-center">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#183D2A]">
            Static Storefront Mode
          </h1>
          <p className="text-sm text-[#202820]/80 leading-relaxed">
            This copy is hosted as a static Netlify site. All customer browsing, search, cart,
            and WhatsApp ordering features are active. To edit products, prices, or settings in
            the database, sign into your full-stack server and export a new Netlify bundle.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated View (First-run Setup OR Login)
  if (!token) {
    return (
      <div className="bg-[#FAF8F0] min-h-[75vh] py-14 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#E5E2D6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#075C28]/10 text-[#075C28] flex items-center justify-center">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#183D2A]">
              {authStatus.needsSetup
                ? 'Claim Administrator Password'
                : 'OKIKS Admin Dashboard'}
            </h1>
            <p className="text-sm text-[#202820]/75 leading-relaxed">
              {authStatus.needsSetup
                ? 'Create your secure administrator password to manage products, delivery zones, and business settings.'
                : 'Sign in with your administrator password to manage the OKIKS storefront.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800">
              {authError}
            </div>
          )}

          {authStatus.needsSetup ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-new-pass"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  New Admin Password (min. 8 characters)
                </label>
                <input
                  id="admin-new-pass"
                  type="password"
                  required
                  minLength={8}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-confirm-pass"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="admin-confirm-pass"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full h-11 rounded-lg bg-[#075C28] text-white font-semibold text-sm hover:bg-[#183D2A] transition-colors cursor-pointer disabled:opacity-60"
              >
                {authSubmitting ? 'Saving...' : 'Save Password & Enter Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-semibold text-[#202820] mb-1.5"
                >
                  Administrator Password
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm focus:outline-none focus:border-[#075C28]"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full h-11 rounded-lg bg-[#075C28] text-white font-semibold text-sm hover:bg-[#183D2A] transition-colors cursor-pointer disabled:opacity-60"
              >
                {authSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#E5E2D6]">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-[#075C28] hover:underline cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const products = store?.products || [];
  const deliveryZones = store?.deliveryZones || [];
  const testimonials: Testimonial[] = store?.testimonials || [];

  return (
    <div className="bg-[#FAF8F0] min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Admin Header */}
        <div className="bg-white border border-[#E5E2D6] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#075C28] uppercase">
              Store Administration
            </p>
            <h1 className="font-display font-bold text-2xl text-[#183D2A]">
              OKIKS Catalog &amp; Operations
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/api/netlify-bundle.zip"
              download="okiks-pet-nutrition-netlify.zip"
              className="px-4 py-2 rounded-lg bg-[#F4B900] text-[#202820] text-xs sm:text-sm font-bold hover:bg-[#ffca28] inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Netlify Bundle (.zip)</span>
            </a>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-4 py-2 rounded-lg border border-[#E5E2D6] text-xs sm:text-sm font-semibold text-[#183D2A] hover:border-[#075C28] cursor-pointer"
            >
              View Live Storefront
            </button>
            <button
              type="button"
              onClick={() => setToken(null)}
              className="px-4 py-2 rounded-lg bg-[#183D2A] text-white text-xs sm:text-sm font-semibold hover:bg-[#202820] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedback && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Admin Tabs */}
        <div className="flex flex-wrap gap-2 bg-white border border-[#E5E2D6] rounded-xl p-2">
          {(
            [
              {id: 'products', label: 'Products', icon: Package},
              {id: 'categories', label: 'Categories', icon: FolderKanban},
              {id: 'delivery', label: 'Delivery Zones', icon: Truck},
              {id: 'settings', label: 'Business Settings & FAQs', icon: Settings},
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#075C28] text-white'
                    : 'text-[#202820] hover:bg-[#FAF8F0]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-[#183D2A]">
                  Products ({products.length})
                </h2>
                <p className="text-xs sm:text-sm text-[#202820]/70">
                  Replace draft placeholders with confirmed product names, brands, pack sizes,
                  and Naira prices.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingProduct({
                    id: '',
                    name: '',
                    category: 'cats',
                    brand: '',
                    description: '',
                    image: '/assets/aistudio/image_20261121_164711_2_13158d4a.jpg',
                    variants: [EMPTY_VARIANT()],
                    isFeatured: true,
                    isBestseller: false,
                    isDraft: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] inline-flex items-center gap-2 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Editor Modal / Form */}
            {editingProduct && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-white border border-[#075C28] rounded-2xl p-6 space-y-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#E5E2D6] pb-3">
                  <h3 className="font-display font-bold text-lg text-[#183D2A]">
                    {editingProduct.id ? 'Edit Product' : 'Create New Product'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="text-xs font-semibold text-[#202820]/70 hover:text-[#202820] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({...editingProduct, name: e.target.value})
                      }
                      placeholder="Enter verified product title"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Category *</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as CategoryId,
                        })
                      }
                      className="w-full h-11 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                    >
                      <option value="cats">Cats</option>
                      <option value="birds">Birds</option>
                      <option value="rabbits">Rabbits</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Brand / Manufacturer (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.brand}
                      onChange={(e) =>
                        setEditingProduct({...editingProduct, brand: e.target.value})
                      }
                      placeholder="Leave blank if unconfirmed"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Product Image URL or Upload *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={editingProduct.image}
                        onChange={(e) =>
                          setEditingProduct({...editingProduct, image: e.target.value})
                        }
                        className="flex-1 h-11 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-xs"
                      />
                      <label className="h-11 px-3.5 rounded-lg border border-[#075C28] text-[#075C28] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#075C28]/5 whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({...editingProduct, description: e.target.value})
                    }
                    className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>

                {/* Package Size Variants */}
                <div className="space-y-3 pt-2 border-t border-[#E5E2D6]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#183D2A]">
                      Package Size Variants &amp; Pricing (₦)
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          ...editingProduct,
                          variants: [...editingProduct.variants, EMPTY_VARIANT()],
                        })
                      }
                      className="text-xs font-semibold text-[#075C28] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pack Size</span>
                    </button>
                  </div>

                  {editingProduct.variants.map((variant, idx) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-[#FAF8F0] p-3 rounded-xl border border-[#E5E2D6]"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium mb-1">
                          Pack Size Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.label}
                          onChange={(e) => {
                            const next = [...editingProduct.variants];
                            next[idx] = {...variant, label: e.target.value};
                            setEditingProduct({...editingProduct, variants: next});
                          }}
                          placeholder="e.g. 2kg Bag"
                          className="w-full h-9 px-2.5 rounded border border-[#E5E2D6] bg-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium mb-1">
                          Price ₦ (blank = Quote)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={variant.price === null ? '' : variant.price}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const next = [...editingProduct.variants];
                            next[idx] = {
                              ...variant,
                              price: val === '' ? null : Number(val),
                            };
                            setEditingProduct({...editingProduct, variants: next});
                          }}
                          placeholder="Request Quote"
                          className="w-full h-9 px-2.5 rounded border border-[#E5E2D6] bg-white text-xs tabular-nums"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium mb-1">
                          Stock Status
                        </label>
                        <select
                          value={variant.stockStatus}
                          onChange={(e) => {
                            const next = [...editingProduct.variants];
                            next[idx] = {
                              ...variant,
                              stockStatus: e.target.value as StockStatus,
                            };
                            setEditingProduct({...editingProduct, variants: next});
                          }}
                          className="w-full h-9 px-2 rounded border border-[#E5E2D6] bg-white text-xs"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Limited Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="confirm_availability">Confirm Availability</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                        {editingProduct.variants.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove pack size"
                            onClick={() => {
                              setEditingProduct({
                                ...editingProduct,
                                variants: editingProduct.variants.filter((_, i) => i !== idx),
                              });
                            }}
                            className="p-2 text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visibility Flags */}
                <div className="flex flex-wrap gap-6 pt-2 text-xs sm:text-sm font-medium">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isFeatured}
                      onChange={(e) =>
                        setEditingProduct({...editingProduct, isFeatured: e.target.checked})
                      }
                      className="w-4 h-4 accent-[#075C28]"
                    />
                    <span>Featured on Homepage</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isBestseller}
                      onChange={(e) =>
                        setEditingProduct({...editingProduct, isBestseller: e.target.checked})
                      }
                      className="w-4 h-4 accent-[#075C28]"
                    />
                    <span>Mark as Popular / Bestseller</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isDraft}
                      onChange={(e) =>
                        setEditingProduct({...editingProduct, isDraft: e.target.checked})
                      }
                      className="w-4 h-4 accent-[#075C28]"
                    />
                    <span>Draft Placeholder Entry</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E2D6]">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 rounded-lg border border-[#E5E2D6] text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-[#E5E2D6] rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#FAF8F0]">
                    <SafeImage
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col space-y-2">
                    <div className="text-xs text-[#202820]/65 font-medium flex items-center gap-1.5 flex-wrap">
                      <span className="capitalize">{prod.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{prod.isDraft ? 'Draft' : 'Verified'}</span>
                      {prod.isFeatured && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#075C28]">Featured</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-[#183D2A]">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#202820]/75 line-clamp-2">{prod.description}</p>
                    <p className="text-xs font-semibold text-[#075C28] tabular-nums">
                      {prod.variants.length} pack option(s) ·{' '}
                      {prod.variants[0]?.price !== null
                        ? formatNaira(prod.variants[0].price)
                        : 'Request Quote'}
                    </p>

                    <div className="pt-3 mt-auto border-t border-[#E5E2D6] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prod)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E2D6] text-xs font-semibold text-[#183D2A] hover:border-[#075C28] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      {deletingProductId === prod.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="px-2.5 py-1.5 rounded bg-red-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(null)}
                            className="px-2 py-1.5 text-xs text-[#202820]/70 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(prod.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {categoryDrafts.map((cat, idx) => (
              <div
                key={cat.id}
                className="bg-white border border-[#E5E2D6] rounded-2xl p-5 space-y-4"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF8F0]">
                  <SafeImage
                    src={cat.heroImage}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const next = [...categoryDrafts];
                      next[idx] = {...cat, name: e.target.value};
                      setCategoryDrafts(next);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Category Headline</label>
                  <input
                    type="text"
                    value={cat.headline}
                    onChange={(e) => {
                      const next = [...categoryDrafts];
                      next[idx] = {...cat, headline: e.target.value};
                      setCategoryDrafts(next);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={cat.description}
                    onChange={(e) => {
                      const next = [...categoryDrafts];
                      next[idx] = {...cat, description: e.target.value};
                      setCategoryDrafts(next);
                    }}
                    className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.isActive}
                    onChange={(e) => {
                      const next = [...categoryDrafts];
                      next[idx] = {...cat, isActive: e.target.checked};
                      setCategoryDrafts(next);
                    }}
                    className="w-4 h-4 accent-[#075C28]"
                  />
                  <span>Show category on storefront</span>
                </label>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveCategory(cat)}
                  className="w-full py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] cursor-pointer"
                >
                  Save {cat.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DELIVERY ZONES */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-[#183D2A]">
                  Delivery Zones &amp; Fees
                </h2>
                <p className="text-xs sm:text-sm text-[#202820]/70">
                  Leave fee blank to display &ldquo;Delivery fee will be confirmed by our team on
                  WhatsApp&rdquo; at checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingZone({
                    id: '',
                    name: '',
                    states: [],
                    fee: null,
                    estimatedRange: 'Confirmed on WhatsApp based on destination',
                    enabled: true,
                  })
                }
                className="px-5 py-2.5 rounded-lg bg-[#075C28] text-white text-sm font-semibold hover:bg-[#183D2A] inline-flex items-center gap-2 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Delivery Zone</span>
              </button>
            </div>

            {editingZone && (
              <form
                onSubmit={handleSaveZone}
                className="bg-white border border-[#075C28] rounded-2xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Zone Name *</label>
                    <input
                      type="text"
                      required
                      value={editingZone.name}
                      onChange={(e) => setEditingZone({...editingZone, name: e.target.value})}
                      placeholder="e.g. Ilorin Metro"
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Fee ₦ (blank = confirm on WhatsApp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingZone.fee === null ? '' : editingZone.fee}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setEditingZone({
                          ...editingZone,
                          fee: val === '' ? null : Number(val),
                        });
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Estimated Timeline Note
                    </label>
                    <input
                      type="text"
                      value={editingZone.estimatedRange}
                      onChange={(e) =>
                        setEditingZone({...editingZone, estimatedRange: e.target.value})
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Covered Nigerian States *</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6]">
                    {NIGERIAN_STATES.map((st) => {
                      const checked = editingZone.states.includes(st);
                      return (
                        <label
                          key={st}
                          className="inline-flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...editingZone.states, st]
                                : editingZone.states.filter((s) => s !== st);
                              setEditingZone({...editingZone, states: next});
                            }}
                            className="accent-[#075C28]"
                          />
                          <span className="truncate">{st}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingZone.enabled}
                    onChange={(e) =>
                      setEditingZone({...editingZone, enabled: e.target.checked})
                    }
                    className="w-4 h-4 accent-[#075C28]"
                  />
                  <span>Zone enabled</span>
                </label>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingZone(null)}
                    className="px-4 py-2 rounded-lg border border-[#E5E2D6] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[#075C28] text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Zone
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryZones.map((zone) => (
                <div
                  key={zone.id}
                  className="bg-white border border-[#E5E2D6] rounded-xl p-5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-[#183D2A]">
                        {zone.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#075C28] tabular-nums">
                        {zone.fee !== null
                          ? formatNaira(zone.fee)
                          : 'Confirm Fee on WhatsApp'}{' '}
                        · {zone.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingZone(zone)}
                        className="text-xs font-semibold text-[#183D2A] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#202820]/70">{zone.estimatedRange}</p>
                  <p className="text-xs text-[#202820]/80">
                    States: {zone.states.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & FAQS */}
        {activeTab === 'settings' && settingsDraft && (
          <form onSubmit={handleSaveSettingsAndFaqs} className="space-y-8">
            <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-[#183D2A] border-b border-[#E5E2D6] pb-3">
                Business Details &amp; Homepage Copy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsDraft.businessName}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, businessName: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsDraft.tagline}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, tagline: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    WhatsApp Ordering Number (digits only, e.g. 2347053797289) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsDraft.whatsappNumber}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, whatsappNumber: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Display Phone</label>
                  <input
                    type="text"
                    value={settingsDraft.displayPhone}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, displayPhone: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Physical Store Address *
                </label>
                <input
                  type="text"
                  required
                  value={settingsDraft.address}
                  onChange={(e) =>
                    setSettingsDraft({...settingsDraft, address: e.target.value})
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Announcement Bar</label>
                <input
                  type="text"
                  value={settingsDraft.announcementText}
                  onChange={(e) =>
                    setSettingsDraft({...settingsDraft, announcementText: e.target.value})
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={settingsDraft.heroHeadline}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, heroHeadline: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Hero Subtext</label>
                  <input
                    type="text"
                    value={settingsDraft.heroSubtext}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, heroSubtext: e.target.value})
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">About OKIKS Copy</label>
                <textarea
                  rows={3}
                  value={settingsDraft.aboutText}
                  onChange={(e) =>
                    setSettingsDraft({...settingsDraft, aboutText: e.target.value})
                  }
                  className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Store Pickup Copy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.pickupInfo}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, pickupInfo: e.target.value})
                    }
                    className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Delivery Overview Copy
                  </label>
                  <textarea
                    rows={2}
                    value={settingsDraft.deliveryNote}
                    onChange={(e) =>
                      setSettingsDraft({...settingsDraft, deliveryNote: e.target.value})
                    }
                    className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={settingsDraft.showTestimonials}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      showTestimonials: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[#075C28]"
                />
                <span>Display Customer Testimonials section (when genuine reviews exist)</span>
              </label>
            </div>

            {/* FAQs Editor */}
            <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D6] pb-3">
                <h2 className="font-display font-bold text-xl text-[#183D2A]">Manage FAQs</h2>
                <button
                  type="button"
                  onClick={() =>
                    setFaqsDraft([
                      ...faqsDraft,
                      {
                        id: `faq-${Date.now()}`,
                        question: '',
                        answer: '',
                        sortOrder: faqsDraft.length + 1,
                      },
                    ])
                  }
                  className="text-xs font-semibold text-[#075C28] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqsDraft.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-xl bg-[#FAF8F0] border border-[#E5E2D6] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#075C28]">FAQ #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFaqsDraft(faqsDraft.filter((_, itemIdx) => itemIdx !== idx))
                        }
                        className="text-xs text-red-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...faqsDraft];
                        next[idx] = {...faq, question: e.target.value};
                        setFaqsDraft(next);
                      }}
                      placeholder="Question"
                      className="w-full h-10 px-3 rounded border border-[#E5E2D6] bg-white text-sm"
                    />
                    <textarea
                      rows={2}
                      required
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...faqsDraft];
                        next[idx] = {...faq, answer: e.target.value};
                        setFaqsDraft(next);
                      }}
                      placeholder="Answer"
                      className="w-full p-2.5 rounded border border-[#E5E2D6] bg-white text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 rounded-lg bg-[#075C28] text-white font-semibold text-sm hover:bg-[#183D2A] cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save All Settings & FAQs'}
              </button>
            </div>

            {/* Verified Testimonials Manager */}
            <div className="bg-white border border-[#E5E2D6] rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[#183D2A]">
                Verified Customer Reviews ({testimonials.length})
              </h2>
              <p className="text-xs text-[#202820]/70">
                Only add genuine customer feedback when received.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newTestimonial.customerName}
                  onChange={(e) =>
                    setNewTestimonial({...newTestimonial, customerName: e.target.value})
                  }
                  placeholder="Customer Name"
                  className="h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                />
                <input
                  type="text"
                  value={newTestimonial.roleOrPet}
                  onChange={(e) =>
                    setNewTestimonial({...newTestimonial, roleOrPet: e.target.value})
                  }
                  placeholder="Role or Pet (e.g. Cat Owner, Ilorin)"
                  className="h-10 px-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="h-10 px-4 rounded-lg bg-[#183D2A] text-white text-xs font-semibold hover:bg-[#075C28] cursor-pointer"
                >
                  Add Genuine Review
                </button>
              </div>
              <textarea
                rows={2}
                value={newTestimonial.quote}
                onChange={(e) =>
                  setNewTestimonial({...newTestimonial, quote: e.target.value})
                }
                placeholder="Customer's exact review..."
                className="w-full p-3 rounded-lg border border-[#E5E2D6] bg-[#FAF8F0] text-sm"
              />

              {testimonials.length > 0 && (
                <div className="space-y-2 pt-2">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-[#FAF8F0] border border-[#E5E2D6] flex items-start justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#183D2A]">
                          {t.customerName} ({t.roleOrPet})
                        </p>
                        <p className="text-[#202820]/80 mt-0.5">{t.quote}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="text-red-700 font-semibold hover:underline cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
