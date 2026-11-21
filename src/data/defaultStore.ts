import type {StoreData} from '../types';

export const DEFAULT_STATIC_STORE: StoreData = {
  settings: {
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
  },
  categories: [
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
  ],
  products: [
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
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
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
    },
  ],
  deliveryZones: [
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
  ],
  faqs: [
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
  ],
  testimonials: [],
};
