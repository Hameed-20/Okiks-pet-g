import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  CategoryInfo,
  DeliveryZone,
  FaqItem,
  Product,
  StoreData,
  StoreSettings,
  Testimonial,
} from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {recursive: true});
}

const DB_PATH = path.join(DATA_DIR, 'okiks.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    variants TEXT NOT NULL,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_bestseller INTEGER NOT NULL DEFAULT 0,
    is_draft INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS delivery_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    states TEXT NOT NULL,
    fee REAL,
    estimated_range TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    role_or_pet TEXT NOT NULL,
    quote TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const DEFAULT_SETTINGS: StoreSettings = {
  businessName: 'OKIKS PET NUTRITION',
  tagline: 'Healthy Pets. Happy Lives.',
  whatsappNumber: '2347053797289',
  displayPhone: '+234 705 379 7289',
  address: 'Opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin, Kwara State, Nigeria.',
  yearsOperating: '2 years',
  announcementText: 'Quality Nutrition for Happier, Healthier Pets.',
  heroHeadline: 'Better Nutrition. Happier Pets. Every Day.',
  heroSubtext:
    'Discover quality pet food and nutrition essentials for your cats, birds and rabbits. Shop with confidence and order conveniently through WhatsApp.',
  aboutText:
    'OKIKS PET NUTRITION has spent the last two years serving pet owners, animal breeders, pet shops, veterinary professionals, and animal enthusiasts across Nigeria. From our physical store in Tanke, Ilorin, we focus on original, dependable feeds paired with responsive guidance via WhatsApp.',
  pickupInfo:
    'Visit our physical store opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin, Kwara State to inspect products and collect your order directly with zero delivery fees.',
  deliveryNote:
    'Nationwide delivery across Nigeria is available. Delivery charges and dispatch estimates depend on destination and are confirmed with our team on WhatsApp before payment.',
  showTestimonials: false,
};

const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cats',
    name: 'Cats',
    slug: 'cats',
    headline: 'Cat Nutrition & Essentials',
    description:
      'Wholesome dry kibble, wet meals, and feline nutrition essentials selected for kittens and adult cats.',
    heroImage: '/assets/aistudio/image_20261121_164711_2_13158d4a.jpg',
    isActive: true,
  },
  {
    id: 'birds',
    name: 'Birds',
    slug: 'birds',
    headline: 'Bird Feeds & Seed Blends',
    description:
      'Balanced pellets, natural seed mixes, and daily avian feeds for budgies, parrots, and companion birds.',
    heroImage: '/assets/aistudio/image_20261121_164712_244e4ff2.jpg',
    isActive: true,
  },
  {
    id: 'rabbits',
    name: 'Rabbits',
    slug: 'rabbits',
    headline: 'Rabbit Pellets & Forage',
    description:
      'High-fiber pellets, hay blends, and everyday rabbit feeds suited for pet homes and rabbitries.',
    heroImage: '/assets/aistudio/image_20261121_164710_53376e15.jpg',
    isActive: true,
  },
];

const nowIso = new Date().toISOString();

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'draft-cat-dry-01',
    name: 'Draft Cat Product 01 — Dry Cat Food',
    category: 'cats',
    brand: '',
    description:
      'Editable draft catalog placeholder for dry cat food. Replace with verified product name, brand, pack weights, and pricing in the Admin Dashboard, or request a quote on WhatsApp.',
    image: '/assets/aistudio/image_20261121_164711_2_13158d4a.jpg',
    variants: [
      {
        id: 'cat-1-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'draft-cat-wet-02',
    name: 'Draft Cat Product 02 — Wet Cat Food',
    category: 'cats',
    brand: '',
    description:
      'Editable draft catalog placeholder for wet cat food. Update product details, confirmed unit prices, and available tin or pouch sizes in the Admin Dashboard.',
    image: '/assets/aistudio/image_20261121_164711_1_4b5c85d6.jpg',
    variants: [
      {
        id: 'cat-2-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'draft-bird-pellet-01',
    name: 'Draft Bird Product 01 — Bird Pellets',
    category: 'birds',
    brand: '',
    description:
      'Editable draft catalog placeholder for pelleted bird feed. Update exact brand, pack weight options, and Naira prices in the Admin Dashboard.',
    image: '/assets/aistudio/image_20261121_164712_244e4ff2.jpg',
    variants: [
      {
        id: 'bird-1-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'draft-bird-seed-02',
    name: 'Draft Bird Product 02 — Bird Seed Mix',
    category: 'birds',
    brand: '',
    description:
      'Editable draft catalog placeholder for bird seed mix. Edit pack sizes, stock status, and verified pricing in the Admin Dashboard, or message us on WhatsApp.',
    image: '/assets/aistudio/image_20261121_164712_1_192417b2.jpg',
    variants: [
      {
        id: 'bird-2-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'draft-rabbit-pellet-01',
    name: 'Draft Rabbit Product 01 — Rabbit Pellets',
    category: 'rabbits',
    brand: '',
    description:
      'Editable draft catalog placeholder for rabbit pellets. Update product title, brand, bag weights, and confirmed prices from the Admin Dashboard.',
    image: '/assets/aistudio/image_20261121_164710_53376e15.jpg',
    variants: [
      {
        id: 'rabbit-1-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'draft-rabbit-forage-02',
    name: 'Draft Rabbit Product 02 — Rabbit Forage & Greens',
    category: 'rabbits',
    brand: '',
    description:
      'Editable draft catalog placeholder for rabbit forage and daily feeding blends. Configure verified product specs and prices in the Admin Dashboard.',
    image: '/assets/aistudio/image_20261121_164711_3aa665aa.jpg',
    variants: [
      {
        id: 'rabbit-2-v1',
        label: 'Pack Size Pending (Draft)',
        price: null,
        stockStatus: 'confirm_availability',
      },
    ],
    isFeatured: true,
    isBestseller: false,
    isDraft: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
];

const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-kwara-ilorin',
    name: 'Ilorin & Kwara State',
    states: ['Kwara'],
    fee: null,
    estimatedRange: 'Confirmed on WhatsApp after order review',
    enabled: true,
  },
  {
    id: 'zone-southwest',
    name: 'Southwest Nigeria',
    states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
    fee: null,
    estimatedRange: 'Confirmed on WhatsApp based on courier route',
    enabled: true,
  },
  {
    id: 'zone-north-central',
    name: 'Abuja (FCT) & North Central',
    states: ['FCT Abuja', 'Niger', 'Kogi', 'Benue', 'Nasarawa', 'Plateau'],
    fee: null,
    estimatedRange: 'Confirmed on WhatsApp based on courier route',
    enabled: true,
  },
  {
    id: 'zone-south-east-south',
    name: 'South-South & Southeast Nigeria',
    states: [
      'Rivers',
      'Delta',
      'Edo',
      'Bayelsa',
      'Akwa Ibom',
      'Cross River',
      'Abia',
      'Anambra',
      'Ebonyi',
      'Enugu',
      'Imo',
    ],
    fee: null,
    estimatedRange: 'Confirmed on WhatsApp based on waybill schedule',
    enabled: true,
  },
  {
    id: 'zone-northern',
    name: 'Northern Nigeria',
    states: [
      'Kano',
      'Kaduna',
      'Katsina',
      'Sokoto',
      'Kebbi',
      'Zamfara',
      'Jigawa',
      'Bauchi',
      'Gombe',
      'Adamawa',
      'Taraba',
      'Borno',
      'Yobe',
    ],
    fee: null,
    estimatedRange: 'Confirmed on WhatsApp based on waybill schedule',
    enabled: true,
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What pet categories does OKIKS PET NUTRITION supply?',
    answer:
      'We focus on quality feeds and nutrition essentials for cats, birds, and rabbits—serving pet owners, animal breeders, pet shops, veterinary professionals, and animal enthusiasts.',
    sortOrder: 1,
  },
  {
    id: 'faq-2',
    question: 'How do I place an order on the website?',
    answer:
      'Browse your preferred pet category, select pack sizes and quantities, and add items to your cart. When ready, complete the checkout form and click the WhatsApp button to send your structured order summary directly to our team.',
    sortOrder: 2,
  },
  {
    id: 'faq-3',
    question: 'Why do some items show "Request a Quote" instead of a fixed price?',
    answer:
      'Draft catalog entries or items with fluctuating pack availability require confirmation before invoicing. Add them to your cart as usual and our team will confirm exact current Naira pricing on WhatsApp.',
    sortOrder: 3,
  },
  {
    id: 'faq-4',
    question: 'What pack sizes are available?',
    answer:
      'Available pack sizes vary by feed type and stock batch. Each product card displays selectable size options once configured, or you can enquire via WhatsApp for bulk and breeder quantities.',
    sortOrder: 4,
  },
  {
    id: 'faq-5',
    question: 'Do you deliver across Nigeria, and how are delivery charges calculated?',
    answer:
      'Yes, we arrange nationwide delivery across Nigeria. Unless a fixed zone rate is listed for your state at checkout, the delivery fee and estimated dispatch timeline depend on your exact destination and order weight and will be confirmed on WhatsApp.',
    sortOrder: 5,
  },
  {
    id: 'faq-6',
    question: 'Can I pick up my order in person?',
    answer:
      'Yes. You can choose Store Pickup at checkout and collect your order directly from our shop opposite Rhema Chapel, Tipper Garage, Tanke, Ilorin, Kwara State with no delivery fee.',
    sortOrder: 6,
  },
  {
    id: 'faq-7',
    question: 'How do I pay for my order?',
    answer:
      'Payment is made via bank transfer. After you send your order summary on WhatsApp, our team confirms item availability, total amount, and shares official bank transfer details.',
    sortOrder: 7,
  },
  {
    id: 'faq-8',
    question: 'Can I enquire about product availability or nutrition suitability before ordering?',
    answer:
      'Yes. Use the floating WhatsApp support button or the Chat With Us link on any page to speak directly with our team before placing your order.',
    sortOrder: 8,
  },
];

function seedDatabaseIfEmpty() {
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as {
    count: number;
  };
  if (settingsCount.count === 0) {
    db.prepare('INSERT INTO settings (id, data) VALUES (1, ?)').run(
      JSON.stringify(DEFAULT_SETTINGS),
    );
  }

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as {
    count: number;
  };
  if (categoryCount.count === 0) {
    const insertCat = db.prepare(
      'INSERT INTO categories (id, name, slug, headline, description, hero_image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (const c of DEFAULT_CATEGORIES) {
      insertCat.run(
        c.id,
        c.name,
        c.slug,
        c.headline,
        c.description,
        c.heroImage,
        c.isActive ? 1 : 0,
      );
    }
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as {
    count: number;
  };
  if (productCount.count === 0) {
    const insertProd = db.prepare(
      'INSERT INTO products (id, name, category, brand, description, image, variants, is_featured, is_bestseller, is_draft, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const p of DEFAULT_PRODUCTS) {
      insertProd.run(
        p.id,
        p.name,
        p.category,
        p.brand,
        p.description,
        p.image,
        JSON.stringify(p.variants),
        p.isFeatured ? 1 : 0,
        p.isBestseller ? 1 : 0,
        p.isDraft ? 1 : 0,
        p.createdAt,
        p.updatedAt,
      );
    }
  }

  const zoneCount = db.prepare('SELECT COUNT(*) as count FROM delivery_zones').get() as {
    count: number;
  };
  if (zoneCount.count === 0) {
    const insertZone = db.prepare(
      'INSERT INTO delivery_zones (id, name, states, fee, estimated_range, enabled) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const z of DEFAULT_DELIVERY_ZONES) {
      insertZone.run(
        z.id,
        z.name,
        JSON.stringify(z.states),
        z.fee,
        z.estimatedRange,
        z.enabled ? 1 : 0,
      );
    }
  }

  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as {count: number};
  if (faqCount.count === 0) {
    const insertFaq = db.prepare(
      'INSERT INTO faqs (id, question, answer, sort_order) VALUES (?, ?, ?, ?)',
    );
    for (const f of DEFAULT_FAQS) {
      insertFaq.run(f.id, f.question, f.answer, f.sortOrder);
    }
  }
}

seedDatabaseIfEmpty();

export function getStoreData(): StoreData {
  const settingsRow = db.prepare('SELECT data FROM settings WHERE id = 1').get() as
    | {data: string}
    | undefined;
  const settings: StoreSettings = settingsRow
    ? {...DEFAULT_SETTINGS, ...JSON.parse(settingsRow.data)}
    : DEFAULT_SETTINGS;

  const catRows = db
    .prepare(
      "SELECT id, name, slug, headline, description, hero_image, is_active FROM categories ORDER BY CASE id WHEN 'cats' THEN 1 WHEN 'birds' THEN 2 WHEN 'rabbits' THEN 3 ELSE 4 END",
    )
    .all() as Array<{
    id: string;
    name: string;
    slug: string;
    headline: string;
    description: string;
    hero_image: string;
    is_active: number;
  }>;

  const categories: CategoryInfo[] = catRows.map((row) => ({
    id: row.id as CategoryInfo['id'],
    name: row.name,
    slug: row.slug as CategoryInfo['slug'],
    headline: row.headline,
    description: row.description,
    heroImage: row.hero_image,
    isActive: row.is_active === 1,
  }));

  const prodRows = db
    .prepare('SELECT * FROM products ORDER BY created_at DESC')
    .all() as Array<{
    id: string;
    name: string;
    category: string;
    brand: string;
    description: string;
    image: string;
    variants: string;
    is_featured: number;
    is_bestseller: number;
    is_draft: number;
    created_at: string;
    updated_at: string;
  }>;

  const products: Product[] = prodRows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as Product['category'],
    brand: row.brand,
    description: row.description,
    image: row.image,
    variants: JSON.parse(row.variants),
    isFeatured: row.is_featured === 1,
    isBestseller: row.is_bestseller === 1,
    isDraft: row.is_draft === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const zoneRows = db.prepare('SELECT * FROM delivery_zones').all() as Array<{
    id: string;
    name: string;
    states: string;
    fee: number | null;
    estimated_range: string;
    enabled: number;
  }>;

  const deliveryZones: DeliveryZone[] = zoneRows.map((row) => ({
    id: row.id,
    name: row.name,
    states: JSON.parse(row.states),
    fee: row.fee,
    estimatedRange: row.estimated_range,
    enabled: row.enabled === 1,
  }));

  const faqRows = db
    .prepare('SELECT * FROM faqs ORDER BY sort_order ASC')
    .all() as Array<{
    id: string;
    question: string;
    answer: string;
    sort_order: number;
  }>;

  const faqs: FaqItem[] = faqRows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  }));

  const testimonialRows = db
    .prepare('SELECT * FROM testimonials ORDER BY created_at DESC')
    .all() as Array<{
    id: string;
    customer_name: string;
    role_or_pet: string;
    quote: string;
    created_at: string;
  }>;

  const testimonials: Testimonial[] = testimonialRows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    roleOrPet: row.role_or_pet,
    quote: row.quote,
    createdAt: row.created_at,
  }));

  return {
    settings,
    categories,
    products,
    deliveryZones,
    faqs,
    testimonials,
  };
}

export function upsertProduct(product: Product): Product {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(product.id);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(
      `UPDATE products SET
        name = ?, category = ?, brand = ?, description = ?, image = ?,
        variants = ?, is_featured = ?, is_bestseller = ?, is_draft = ?, updated_at = ?
      WHERE id = ?`,
    ).run(
      product.name,
      product.category,
      product.brand,
      product.description,
      product.image,
      JSON.stringify(product.variants),
      product.isFeatured ? 1 : 0,
      product.isBestseller ? 1 : 0,
      product.isDraft ? 1 : 0,
      now,
      product.id,
    );
    return {...product, updatedAt: now};
  }
  const newProduct: Product = {
    ...product,
    id: product.id || `prod-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(
    `INSERT INTO products (
      id, name, category, brand, description, image, variants,
      is_featured, is_bestseller, is_draft, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    newProduct.id,
    newProduct.name,
    newProduct.category,
    newProduct.brand,
    newProduct.description,
    newProduct.image,
    JSON.stringify(newProduct.variants),
    newProduct.isFeatured ? 1 : 0,
    newProduct.isBestseller ? 1 : 0,
    newProduct.isDraft ? 1 : 0,
    newProduct.createdAt,
    newProduct.updatedAt,
  );
  return newProduct;
}

export function deleteProduct(id: string): boolean {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updateCategory(category: CategoryInfo): void {
  db.prepare(
    'UPDATE categories SET name = ?, headline = ?, description = ?, hero_image = ?, is_active = ? WHERE id = ?',
  ).run(
    category.name,
    category.headline,
    category.description,
    category.heroImage,
    category.isActive ? 1 : 0,
    category.id,
  );
}

export function upsertDeliveryZone(zone: DeliveryZone): DeliveryZone {
  const existing = db.prepare('SELECT id FROM delivery_zones WHERE id = ?').get(zone.id);
  if (existing) {
    db.prepare(
      'UPDATE delivery_zones SET name = ?, states = ?, fee = ?, estimated_range = ?, enabled = ? WHERE id = ?',
    ).run(
      zone.name,
      JSON.stringify(zone.states),
      zone.fee,
      zone.estimatedRange,
      zone.enabled ? 1 : 0,
      zone.id,
    );
    return zone;
  }
  const newZone: DeliveryZone = {
    ...zone,
    id: zone.id || `zone-${crypto.randomUUID().slice(0, 8)}`,
  };
  db.prepare(
    'INSERT INTO delivery_zones (id, name, states, fee, estimated_range, enabled) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(
    newZone.id,
    newZone.name,
    JSON.stringify(newZone.states),
    newZone.fee,
    newZone.estimatedRange,
    newZone.enabled ? 1 : 0,
  );
  return newZone;
}

export function deleteDeliveryZone(id: string): boolean {
  const result = db.prepare('DELETE FROM delivery_zones WHERE id = ?').run(id);
  return result.changes > 0;
}

export function saveSettings(settings: StoreSettings): StoreSettings {
  db.prepare('INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)').run(
    JSON.stringify(settings),
  );
  return settings;
}

export function saveFaqs(faqs: FaqItem[]): FaqItem[] {
  const tx = db.transaction((items: FaqItem[]) => {
    db.prepare('DELETE FROM faqs').run();
    const stmt = db.prepare(
      'INSERT INTO faqs (id, question, answer, sort_order) VALUES (?, ?, ?, ?)',
    );
    items.forEach((f, idx) => {
      stmt.run(f.id || `faq-${idx + 1}`, f.question, f.answer, idx + 1);
    });
  });
  tx(faqs);
  return faqs;
}

export function upsertTestimonial(t: Testimonial): Testimonial {
  const newT: Testimonial = {
    ...t,
    id: t.id || `test-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: t.createdAt || new Date().toISOString(),
  };
  db.prepare(
    'INSERT OR REPLACE INTO testimonials (id, customer_name, role_or_pet, quote, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(newT.id, newT.customerName, newT.roleOrPet, newT.quote, newT.createdAt);
  return newT;
}

export function deleteTestimonial(id: string): boolean {
  const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
  return result.changes > 0;
}

// Admin authentication helpers (server-only)
export function hasAdminHash(): boolean {
  const row = db.prepare('SELECT id FROM admin_auth WHERE id = 1').get();
  return Boolean(row);
}

export function setInitialAdminPassword(password: string): boolean {
  if (hasAdminHash()) {
    return false;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const result = db
    .prepare(
      'INSERT OR IGNORE INTO admin_auth (id, password_hash, salt, created_at) VALUES (1, ?, ?, ?)',
    )
    .run(hash, salt, new Date().toISOString());
  return result.changes > 0;
}

export function verifyStoredAdminPassword(password: string): boolean {
  const row = db
    .prepare('SELECT password_hash, salt FROM admin_auth WHERE id = 1')
    .get() as {password_hash: string; salt: string} | undefined;
  if (!row) return false;
  const derived = crypto.scryptSync(password, row.salt, 64);
  const expected = Buffer.from(row.password_hash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}
