import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import {
  deleteDeliveryZone,
  deleteProduct,
  deleteTestimonial,
  getStoreData,
  hasAdminHash,
  saveFaqs,
  saveSettings,
  setInitialAdminPassword,
  updateCategory,
  upsertDeliveryZone,
  upsertProduct,
  upsertTestimonial,
  verifyStoredAdminPassword,
} from './server/db.ts';
import type {
  CategoryInfo,
  DeliveryZone,
  FaqItem,
  Product,
  StoreSettings,
  Testimonial,
} from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, {recursive: true});
}

function createToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 12,
      nonce: crypto.randomBytes(8).toString('hex'),
    }),
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function verifyEnvPasscode(candidate: string): boolean {
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(envPass);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isSafeImagePath(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/uploads/')) {
    return !trimmed.includes('..');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  if (!verifyToken(token)) {
    res.status(401).json({error: 'Unauthorized. Please sign in to the Admin Dashboard.'});
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({limit: '8mb'}));

  // Serve uploaded product images cleanly in both dev and production
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public Storefront Read API
  app.get('/api/store', (_req, res) => {
    try {
      const data = getStoreData();
      res.json(data);
    } catch (err) {
      console.error('Error loading store data:', err);
      res.status(500).json({error: 'Failed to load store data.'});
    }
  });

  // Portable Static Netlify ZIP Bundle (dist + live store-snapshot.json + uploads)
  app.get('/api/netlify-bundle.zip', (_req, res) => {
    try {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
        res.status(404).json({error: 'Production build not found. Run npm run build first.'});
        return;
      }
      const snapshotJson = JSON.stringify(getStoreData(), null, 2);
      const tmpSnapshot = path.join(distDir, 'store-snapshot.json');
      fs.writeFileSync(tmpSnapshot, snapshotJson, 'utf8');

      const outZip = path.resolve(process.cwd(), 'data', 'okiks-pet-nutrition-netlify.zip');
      const pyScript = [
        'import os, sys, zipfile',
        'dist_dir, uploads_dir, out_zip = sys.argv[1], sys.argv[2], sys.argv[3]',
        'with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:',
        '  for root, _, files in os.walk(dist_dir):',
        '    for f in files:',
        '      full = os.path.join(root, f)',
        '      rel = os.path.relpath(full, dist_dir)',
        '      zf.write(full, rel)',
        '  if os.path.isdir(uploads_dir):',
        '    for root, _, files in os.walk(uploads_dir):',
        '      for f in files:',
        '        full = os.path.join(root, f)',
        '        rel = os.path.join("uploads", os.path.relpath(full, uploads_dir))',
        '        zf.write(full, rel)',
      ].join('\n');

      execFileSync('python3', ['-c', pyScript, distDir, UPLOADS_DIR, outZip]);
      res.download(outZip, 'okiks-pet-nutrition-netlify.zip');
    } catch (err) {
      console.error('Failed to build Netlify ZIP:', err);
      res.status(500).json({error: 'Could not generate Netlify deploy archive.'});
    }
  });

  // Admin Auth Status
  app.get('/api/admin/auth-status', (req, res) => {
    const envConfigured = Boolean(process.env.ADMIN_PASSWORD?.trim());
    const dbConfigured = hasAdminHash();
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    res.json({
      needsSetup: !envConfigured && !dbConfigured,
      envOverride: envConfigured,
      authenticated: verifyToken(token),
    });
  });

  // One-time Admin Setup (only active when no env passcode and no stored hash exist)
  app.post('/api/admin/setup', (req, res) => {
    const envConfigured = Boolean(process.env.ADMIN_PASSWORD?.trim());
    if (envConfigured || hasAdminHash()) {
      res.status(409).json({error: 'Admin password is already configured.'});
      return;
    }
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (password.length < 8) {
      res.status(400).json({error: 'Password must be at least 8 characters long.'});
      return;
    }
    const created = setInitialAdminPassword(password);
    if (!created) {
      res.status(409).json({error: 'Admin password is already configured.'});
      return;
    }
    res.json({token: createToken()});
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password) {
      res.status(400).json({error: 'Password is required.'});
      return;
    }
    const envConfigured = Boolean(process.env.ADMIN_PASSWORD?.trim());
    const valid = envConfigured
      ? verifyEnvPasscode(password)
      : verifyStoredAdminPassword(password);

    if (!valid) {
      res.status(401).json({error: 'Invalid administrator password.'});
      return;
    }
    res.json({token: createToken()});
  });

  // Admin Image Upload (base64 data URL validated and confined to public/uploads)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({error: 'Invalid image format. Upload PNG, JPG, or WEBP.'});
      return;
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) {
      res.status(400).json({error: 'Image exceeds 5MB limit.'});
      return;
    }
    const fileName = `product-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, fileName);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({error: 'Invalid upload path.'});
      return;
    }
    fs.writeFileSync(targetPath, buffer);
    res.json({url: `/uploads/${fileName}`});
  });

  // Admin Product CRUD
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = req.body as Partial<Product>;
    if (!body?.name?.trim()) {
      res.status(400).json({error: 'Product name is required.'});
      return;
    }
    if (!['cats', 'birds', 'rabbits'].includes(String(body.category))) {
      res.status(400).json({error: 'Valid category (cats, birds, rabbits) is required.'});
      return;
    }
    if (!body.description?.trim()) {
      res.status(400).json({error: 'Product description is required.'});
      return;
    }
    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      res.status(400).json({error: 'At least one package size variant is required.'});
      return;
    }
    for (const v of body.variants) {
      if (!v.label?.trim()) {
        res.status(400).json({error: 'Every pack size variant must have a label.'});
        return;
      }
      if (v.price !== null && (typeof v.price !== 'number' || Number.isNaN(v.price) || v.price < 0)) {
        res.status(400).json({error: 'Prices must be positive numbers or left blank for Request a Quote.'});
        return;
      }
    }
    const imageUrl = body.image?.trim() || '';
    if (!isSafeImagePath(imageUrl)) {
      res.status(400).json({error: 'Valid product image path or URL is required.'});
      return;
    }

    const saved = upsertProduct({
      id: body.id?.trim() || '',
      name: body.name.trim(),
      category: body.category as Product['category'],
      brand: (body.brand || '').trim(),
      description: body.description.trim(),
      image: imageUrl,
      variants: body.variants.map((v, idx) => ({
        id: v.id?.trim() || `var-${Date.now()}-${idx}`,
        label: v.label.trim(),
        price: v.price === null ? null : Math.round(v.price),
        stockStatus: v.stockStatus || 'in_stock',
      })),
      isFeatured: Boolean(body.isFeatured),
      isBestseller: Boolean(body.isBestseller),
      isDraft: Boolean(body.isDraft),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.json({product: saved});
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const id = String(req.params.id || '');
    const deleted = deleteProduct(id);
    if (!deleted) {
      res.status(404).json({error: 'Product not found.'});
      return;
    }
    res.json({ok: true});
  });

  // Admin Category Update
  app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const id = String(req.params.id || '');
    if (!['cats', 'birds', 'rabbits'].includes(id)) {
      res.status(400).json({error: 'Invalid category ID.'});
      return;
    }
    const body = req.body as Partial<CategoryInfo>;
    if (!body.name?.trim() || !body.headline?.trim() || !body.description?.trim()) {
      res.status(400).json({error: 'Category name, headline, and description are required.'});
      return;
    }
    const heroImage = body.heroImage?.trim() || '';
    if (!isSafeImagePath(heroImage)) {
      res.status(400).json({error: 'Valid category image URL is required.'});
      return;
    }
    const updated: CategoryInfo = {
      id: id as CategoryInfo['id'],
      name: body.name.trim(),
      slug: id as CategoryInfo['slug'],
      headline: body.headline.trim(),
      description: body.description.trim(),
      heroImage,
      isActive: body.isActive !== false,
    };
    updateCategory(updated);
    res.json({category: updated});
  });

  // Admin Delivery Zones CRUD
  app.post('/api/admin/delivery-zones', requireAdmin, (req, res) => {
    const body = req.body as Partial<DeliveryZone>;
    if (!body.name?.trim() || !Array.isArray(body.states) || body.states.length === 0) {
      res.status(400).json({error: 'Zone name and at least one Nigerian state are required.'});
      return;
    }
    if (
      body.fee !== null &&
      body.fee !== undefined &&
      (typeof body.fee !== 'number' || Number.isNaN(body.fee) || body.fee < 0)
    ) {
      res.status(400).json({error: 'Delivery fee must be a positive number or left blank.'});
      return;
    }
    const saved = upsertDeliveryZone({
      id: body.id?.trim() || '',
      name: body.name.trim(),
      states: body.states.map((s) => String(s).trim()).filter(Boolean),
      fee: body.fee === null || body.fee === undefined ? null : Math.round(body.fee),
      estimatedRange:
        body.estimatedRange?.trim() || 'Confirmed on WhatsApp based on destination',
      enabled: body.enabled !== false,
    });
    res.json({zone: saved});
  });

  app.delete('/api/admin/delivery-zones/:id', requireAdmin, (req, res) => {
    const id = String(req.params.id || '');
    const deleted = deleteDeliveryZone(id);
    if (!deleted) {
      res.status(404).json({error: 'Delivery zone not found.'});
      return;
    }
    res.json({ok: true});
  });

  // Admin Business Settings & Homepage Content
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const body = req.body as Partial<StoreSettings>;
    if (!body.businessName?.trim() || !body.whatsappNumber?.trim() || !body.address?.trim()) {
      res.status(400).json({error: 'Business name, WhatsApp number, and address are required.'});
      return;
    }
    const current = getStoreData().settings;
    const cleanedWa = body.whatsappNumber.replace(/[^\d]/g, '');
    if (cleanedWa.length < 10) {
      res.status(400).json({error: 'Enter a valid international WhatsApp number (digits only, e.g. 2347053797289).'});
      return;
    }
    const saved = saveSettings({
      ...current,
      ...body,
      businessName: body.businessName.trim(),
      whatsappNumber: cleanedWa,
      address: body.address.trim(),
    });
    res.json({settings: saved});
  });

  // Admin FAQs
  app.put('/api/admin/faqs', requireAdmin, (req, res) => {
    const items = Array.isArray(req.body?.faqs) ? (req.body.faqs as FaqItem[]) : null;
    if (!items) {
      res.status(400).json({error: 'Invalid FAQ list.'});
      return;
    }
    for (const item of items) {
      if (!item.question?.trim() || !item.answer?.trim()) {
        res.status(400).json({error: 'Every FAQ item must have a question and answer.'});
        return;
      }
    }
    const cleaned = items.map((f, idx) => ({
      id: f.id?.trim() || `faq-${Date.now()}-${idx}`,
      question: f.question.trim(),
      answer: f.answer.trim(),
      sortOrder: idx + 1,
    }));
    saveFaqs(cleaned);
    res.json({faqs: cleaned});
  });

  // Admin Testimonials (optional genuine reviews)
  app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
    const body = req.body as Partial<Testimonial>;
    if (!body.customerName?.trim() || !body.quote?.trim()) {
      res.status(400).json({error: 'Customer name and verified quote are required.'});
      return;
    }
    const saved = upsertTestimonial({
      id: body.id?.trim() || '',
      customerName: body.customerName.trim(),
      roleOrPet: (body.roleOrPet || 'Verified Customer').trim(),
      quote: body.quote.trim(),
      createdAt: body.createdAt || new Date().toISOString(),
    });
    res.json({testimonial: saved});
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
    const id = String(req.params.id || '');
    const deleted = deleteTestimonial(id);
    if (!deleted) {
      res.status(404).json({error: 'Testimonial not found.'});
      return;
    }
    res.json({ok: true});
  });

  // Vite middleware in development, static dist in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.use('/src/assets', express.static(path.join(distDir, 'src', 'assets')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OKIKS PET NUTRITION server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
