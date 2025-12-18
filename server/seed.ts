import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobilemaster';

const MOCK_SELLERS = [
  {
    id: "seller-1",
    userId: "seller-user-1",
    businessName: "Premium Mobile Store",
    ownerName: "John Smith",
    email: "john@premiumstore.com",
    password: "seller123",
    phone: "+1234567890",
    address: "123 Tech Street, Silicon Valley, CA",
    gstNumber: "GST123456789",
    businessType: "retailer",
    status: "approved",
    rating: 4.8,
    totalSales: 1250,
    totalProducts: 45,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "seller-2",
    userId: "seller-user-2",
    businessName: "Gadget Galaxy",
    ownerName: "Sarah Johnson",
    email: "sarah@gadgetgalaxy.com",
    password: "seller123",
    phone: "+1234567891",
    address: "456 Innovation Ave, Austin, TX",
    gstNumber: "GST987654321",
    businessType: "wholesaler",
    status: "approved",
    rating: 4.6,
    totalSales: 890,
    totalProducts: 32,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "seller-3",
    userId: "seller-user-3",
    businessName: "Tech Haven",
    ownerName: "Mike Chen",
    email: "mike@techhaven.com",
    password: "seller123",
    phone: "+1234567892",
    address: "789 Startup Blvd, Seattle, WA",
    gstNumber: "GST456789123",
    businessType: "retailer",
    status: "approved",
    rating: 4.9,
    totalSales: 2100,
    totalProducts: 68,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const MOCK_DELIVERY_PERSONS = [
  {
    id: "delivery-1",
    userId: "delivery-user-1",
    name: "David Williams",
    email: "david@delivery.com",
    password: "delivery123",
    phone: "+1234567893",
    vehicleType: "bike",
    vehicleNumber: "BIKE-001",
    licenseNumber: "DL123456",
    status: "active",
    isAvailable: true,
    currentOrders: 2,
    completedDeliveries: 487,
    totalDeliveries: 487,
    rating: 4.7,
    earnings: 12500,
    assignedOrders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "delivery-2",
    userId: "delivery-user-2",
    name: "Emily Davis",
    email: "emily@delivery.com",
    password: "delivery123",
    phone: "+1234567894",
    vehicleType: "car",
    vehicleNumber: "CAR-002",
    licenseNumber: "DL789012",
    status: "active",
    isAvailable: true,
    currentOrders: 1,
    completedDeliveries: 623,
    totalDeliveries: 623,
    rating: 4.9,
    earnings: 18900,
    assignedOrders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 999,
    originalPrice: 1099,
    sellerId: "seller-1",
    sellerName: "Premium Mobile Store",
    description: "The ultimate iPhone with titanium design, A17 Pro chip, and professional camera system.",
    specs: ["A17 Pro chip", "ProMotion display", "Action button", "Titanium design"],
    colors: ["Natural Titanium", "Blue Titanium", "Black Titanium"],
    ramOptions: ["8GB"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1695048133586-13eb37f5617e?w=800",
      "https://images.unsplash.com/photo-1695048133296-e4ca9275dd0c?w=800"
    ],
    category: "phone" as const,
    stock: 45,
    rating: 4.8,
    totalReviews: 234,
    totalSales: 567,
    status: "approved",
    featured: true,
    variants: [
      {
        color: "Natural Titanium",
        ram: "8GB",
        storage: "128GB",
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          "https://images.unsplash.com/photo-1695048133586-13eb37f5617e?w=800"
        ],
        price: 999,
        stock: 15
      },
      {
        color: "Blue Titanium",
        ram: "8GB",
        storage: "256GB",
        images: [
          "https://images.unsplash.com/photo-1592286927505-86db1e0d8e30?w=800",
          "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
        ],
        price: 1099,
        stock: 20
      },
      {
        color: "Black Titanium",
        ram: "8GB",
        storage: "512GB",
        images: [
          "https://images.unsplash.com/photo-1678685888221-cda15f3346e6?w=800",
          "https://images.unsplash.com/photo-1678685888665-7599a8cc60fc?w=800"
        ],
        price: 1299,
        stock: 10
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1199,
    sellerId: "seller-2",
    sellerName: "Gadget Galaxy",
    description: "Samsung's most powerful phone with AI features, 200MP camera, and built-in S Pen.",
    specs: ["Snapdragon 8 Gen 3", "200MP camera", "S Pen included", "5000mAh battery"],
    colors: ["Titanium Gray", "Titanium Black", "Titanium Violet"],
    ramOptions: ["12GB"],
    storageOptions: ["256GB", "512GB", "1TB"],
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ],
    category: "phone" as const,
    stock: 38,
    rating: 4.7,
    totalReviews: 189,
    totalSales: 423,
    status: "approved",
    featured: true,
    variants: [
      {
        color: "Titanium Gray",
        storage: "256GB",
        images: [
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
        ],
        stock: 15
      },
      {
        color: "Titanium Black",
        storage: "512GB",
        images: [
          "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800",
          "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"
        ],
        price: 1299,
        stock: 12
      },
      {
        color: "Titanium Violet",
        storage: "1TB",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
          "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"
        ],
        price: 1499,
        stock: 11
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 899,
    sellerId: "seller-3",
    sellerName: "Tech Haven",
    description: "Google's flagship with AI-powered camera, Tensor G3 chip, and 7 years of updates.",
    specs: ["Tensor G3", "AI-powered camera", "7 years updates", "Temperature sensor"],
    colors: ["Obsidian", "Porcelain", "Bay"],
    ramOptions: ["12GB"],
    storageOptions: ["128GB", "256GB", "512GB"],
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ],
    category: "phone" as const,
    stock: 52,
    rating: 4.6,
    totalReviews: 156,
    totalSales: 312,
    status: "approved",
    featured: false,
    variants: [
      {
        color: "Obsidian",
        storage: "128GB",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
        ],
        stock: 20
      },
      {
        color: "Porcelain",
        storage: "256GB",
        images: [
          "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800",
          "https://images.unsplash.com/photo-1600087626014-e652e18bbff2?w=800"
        ],
        price: 999,
        stock: 18
      },
      {
        color: "Bay",
        storage: "512GB",
        images: [
          "https://images.unsplash.com/photo-1592286927505-86db1e0d8e30?w=800",
          "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
        ],
        price: 1099,
        stock: 14
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 799,
    sellerId: "seller-1",
    sellerName: "Premium Mobile Store",
    description: "Flagship killer with Snapdragon 8 Gen 3, 120Hz display, and 100W fast charging.",
    specs: ["Snapdragon 8 Gen 3", "120Hz AMOLED", "100W charging", "Hasselblad camera"],
    colors: ["Flowy Emerald", "Silky Black"],
    ramOptions: ["12GB", "16GB"],
    storageOptions: ["256GB", "512GB"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"
    ],
    category: "phone" as const,
    stock: 30,
    rating: 4.5,
    totalReviews: 98,
    totalSales: 187,
    status: "approved",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "5",
    name: "iPad Air M2",
    brand: "Apple",
    price: 599,
    sellerId: "seller-2",
    sellerName: "Gadget Galaxy",
    description: "Powerful and portable iPad with M2 chip, perfect for creativity and productivity.",
    specs: ["M2 chip", "10.9-inch display", "Apple Pencil support", "All-day battery"],
    colors: ["Space Gray", "Starlight", "Purple", "Blue"],
    storageOptions: ["128GB", "256GB"],
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
      "https://images.unsplash.com/photo-1585790050230-5dd28404f905?w=800"
    ],
    category: "tablet" as const,
    stock: 28,
    rating: 4.8,
    totalReviews: 145,
    totalSales: 298,
    status: "approved",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "6",
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    price: 799,
    sellerId: "seller-3",
    sellerName: "Tech Haven",
    description: "Premium Android tablet with S Pen, AMOLED display, and DeX mode.",
    specs: ["Snapdragon 8 Gen 2", "11-inch AMOLED", "S Pen included", "IP68 water resistant"],
    colors: ["Graphite", "Beige"],
    storageOptions: ["128GB", "256GB"],
    image: "https://images.unsplash.com/photo-1585789575046-e4d635a8f4e6?w=800",
    images: [
      "https://images.unsplash.com/photo-1585789575046-e4d635a8f4e6?w=800",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"
    ],
    category: "tablet" as const,
    stock: 22,
    rating: 4.6,
    totalReviews: 87,
    totalSales: 156,
    status: "approved",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "7",
    name: "AirPods Pro 2",
    brand: "Apple",
    price: 249,
    sellerId: "seller-1",
    sellerName: "Premium Mobile Store",
    description: "Premium wireless earbuds with adaptive audio and active noise cancellation.",
    specs: ["Adaptive Audio", "Active noise cancellation", "USB-C charging", "6 hours battery"],
    colors: ["White"],
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
    images: [
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
      "https://images.unsplash.com/photo-1590658165737-15a047b7a005?w=800"
    ],
    category: "accessory" as const,
    stock: 75,
    rating: 4.9,
    totalReviews: 423,
    totalSales: 1245,
    status: "approved",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "8",
    name: "Samsung Galaxy Buds2 Pro",
    brand: "Samsung",
    price: 229,
    sellerId: "seller-2",
    sellerName: "Gadget Galaxy",
    description: "Premium earbuds with intelligent ANC and 360 audio for immersive sound.",
    specs: ["Intelligent ANC", "360 audio", "Hi-Fi sound", "8 hours battery"],
    colors: ["Graphite", "White", "Bora Purple"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"
    ],
    category: "accessory" as const,
    stock: 68,
    rating: 4.5,
    totalReviews: 298,
    totalSales: 687,
    status: "approved",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "9",
    name: "Apple Watch Series 9",
    brand: "Apple",
    price: 399,
    sellerId: "seller-3",
    sellerName: "Tech Haven",
    description: "Advanced smartwatch with health monitoring, fitness tracking, and Always-On display.",
    specs: ["S9 chip", "Always-On Retina", "ECG & blood oxygen", "18 hours battery"],
    colors: ["Midnight", "Starlight", "Product Red"],
    storageOptions: ["GPS", "GPS + Cellular"],
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800"
    ],
    category: "accessory" as const,
    stock: 42,
    rating: 4.8,
    totalReviews: 334,
    totalSales: 578,
    status: "approved",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "10",
    name: "Anker PowerCore 20K",
    brand: "Anker",
    price: 59,
    sellerId: "seller-1",
    sellerName: "Premium Mobile Store",
    description: "Ultra-high capacity power bank with 20,000mAh for multiple charges on the go.",
    specs: ["20,000mAh capacity", "PowerIQ 3.0", "USB-C & USB-A", "2 devices simultaneously"],
    colors: ["Black"],
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800"
    ],
    category: "accessory" as const,
    stock: 125,
    rating: 4.7,
    totalReviews: 567,
    totalSales: 1432,
    status: "approved",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'mobilemaster';
    const db = client.db(dbName);

    // Clear existing data
    await db.collection('products').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('sellers').deleteMany({});
    await db.collection('delivery_persons').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('reviews').deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sellers
    await db.collection('sellers').insertMany(MOCK_SELLERS);
    console.log('✅ Inserted sellers');

    // Insert delivery persons
    await db.collection('delivery_persons').insertMany(MOCK_DELIVERY_PERSONS);
    console.log('✅ Inserted delivery persons');

    // Insert products
    await db.collection('products').insertMany(MOCK_PRODUCTS);
    console.log('✅ Inserted products');

    // Insert admin user
    const adminUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In production, hash this!
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('users').insertOne(adminUser);
    console.log('✅ Inserted admin user');

    // Insert regular users
    const regularUsers = [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'user123',
        role: 'user',
        phone: '+1234567895',
        address: '123 Main St, New York, NY',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'user123',
        role: 'user',
        phone: '+1234567896',
        address: '456 Oak Ave, Los Angeles, CA',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('users').insertMany(regularUsers);
    console.log('✅ Inserted regular users');

    // Insert seller user accounts
    const sellerUsers = [
      {
        id: 'seller-user-1',
        name: 'John Smith',
        email: 'john@premiumstore.com',
        password: 'seller123',
        role: 'seller',
        sellerId: 'seller-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'seller-user-2',
        name: 'Sarah Johnson',
        email: 'sarah@gadgetgalaxy.com',
        password: 'seller123',
        role: 'seller',
        sellerId: 'seller-2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'seller-user-3',
        name: 'Mike Chen',
        email: 'mike@techhaven.com',
        password: 'seller123',
        role: 'seller',
        sellerId: 'seller-3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('users').insertMany(sellerUsers);
    console.log('✅ Inserted seller user accounts');

    // Insert delivery user accounts
    const deliveryUsers = [
      {
        id: 'delivery-user-1',
        name: 'David Williams',
        email: 'david@delivery.com',
        password: 'delivery123',
        role: 'delivery',
        deliveryPersonId: 'delivery-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'delivery-user-2',
        name: 'Emily Davis',
        email: 'emily@delivery.com',
        password: 'delivery123',
        role: 'delivery',
        deliveryPersonId: 'delivery-2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('users').insertMany(deliveryUsers);
    console.log('✅ Inserted delivery user accounts');

    // Insert sample orders
    const sampleOrders = [
      {
        id: 'order-1',
        userId: 'user-1',
        userName: 'Alice Johnson',
        items: [
          {
            productId: '1',
            name: 'iPhone 15 Pro',
            price: 999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
            selectedColor: 'Natural Titanium',
            selectedStorage: '128GB'
          }
        ],
        total: 999,
        status: 'delivered',
        shippingAddress: '123 Main St, New York, NY',
        phone: '+1234567895',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        sellerId: 'seller-1',
        sellerName: 'Premium Mobile Store',
        deliveryPersonId: 'delivery-1',
        deliveryPersonName: 'David Williams',
        trackingStages: [
          { stage: 'Order Placed', completed: true, timestamp: new Date('2025-12-10') },
          { stage: 'Confirmed', completed: true, timestamp: new Date('2025-12-11') },
          { stage: 'Shipped', completed: true, timestamp: new Date('2025-12-12') },
          { stage: 'Out for Delivery', completed: true, timestamp: new Date('2025-12-13') },
          { stage: 'Delivered', completed: true, timestamp: new Date('2025-12-14') }
        ],
        createdAt: new Date('2025-12-10'),
        updatedAt: new Date('2025-12-14')
      },
      {
        id: 'order-2',
        userId: 'user-2',
        userName: 'Bob Smith',
        items: [
          {
            productId: '2',
            name: 'Samsung Galaxy S24 Ultra',
            price: 1199,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
            selectedColor: 'Titanium Gray',
            selectedStorage: '256GB'
          },
          {
            productId: '7',
            name: 'AirPods Pro 2',
            price: 249,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800'
          }
        ],
        total: 1448,
        status: 'shipped',
        shippingAddress: '456 Oak Ave, Los Angeles, CA',
        phone: '+1234567896',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        sellerId: 'seller-2',
        sellerName: 'Gadget Galaxy',
        deliveryPersonId: 'delivery-2',
        deliveryPersonName: 'Emily Davis',
        trackingStages: [
          { stage: 'Order Placed', completed: true, timestamp: new Date('2025-12-15') },
          { stage: 'Confirmed', completed: true, timestamp: new Date('2025-12-16') },
          { stage: 'Shipped', completed: true, timestamp: new Date('2025-12-17') },
          { stage: 'Out for Delivery', completed: false },
          { stage: 'Delivered', completed: false }
        ],
        createdAt: new Date('2025-12-15'),
        updatedAt: new Date('2025-12-17')
      },
      {
        id: 'order-3',
        userId: 'user-1',
        userName: 'Alice Johnson',
        items: [
          {
            productId: '3',
            name: 'Google Pixel 8 Pro',
            price: 899,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
            selectedColor: 'Obsidian',
            selectedStorage: '128GB'
          }
        ],
        total: 899,
        status: 'confirmed',
        shippingAddress: '123 Main St, New York, NY',
        phone: '+1234567895',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        sellerId: 'seller-3',
        sellerName: 'Tech Haven',
        trackingStages: [
          { stage: 'Order Placed', completed: true, timestamp: new Date('2025-12-18') },
          { stage: 'Confirmed', completed: true, timestamp: new Date('2025-12-18') },
          { stage: 'Shipped', completed: false },
          { stage: 'Out for Delivery', completed: false },
          { stage: 'Delivered', completed: false }
        ],
        createdAt: new Date('2025-12-18'),
        updatedAt: new Date('2025-12-18')
      }
    ];
    await db.collection('orders').insertMany(sampleOrders);
    console.log('✅ Inserted sample orders');

    // Insert sample reviews
    const sampleReviews = [
      {
        id: 'review-1',
        productId: '1',
        userId: 'user-1',
        userName: 'Alice Johnson',
        rating: 5,
        comment: 'Absolutely amazing phone! The titanium design feels premium and the camera is incredible.',
        verifiedPurchase: true,
        helpful: 45,
        createdAt: new Date('2025-12-15'),
        updatedAt: new Date('2025-12-15')
      },
      {
        id: 'review-2',
        productId: '1',
        userId: 'user-2',
        userName: 'Bob Smith',
        rating: 4,
        comment: 'Great phone but the battery could be better. Camera system is top-notch though.',
        verifiedPurchase: true,
        helpful: 23,
        createdAt: new Date('2025-12-16'),
        updatedAt: new Date('2025-12-16')
      },
      {
        id: 'review-3',
        productId: '2',
        userId: 'user-1',
        userName: 'Alice Johnson',
        rating: 5,
        comment: 'The S Pen is a game changer! Best Android phone I have ever used.',
        verifiedPurchase: true,
        helpful: 67,
        createdAt: new Date('2025-12-14'),
        updatedAt: new Date('2025-12-14')
      },
      {
        id: 'review-4',
        productId: '7',
        userId: 'user-2',
        userName: 'Bob Smith',
        rating: 5,
        comment: 'Sound quality is exceptional. Adaptive audio works like magic!',
        verifiedPurchase: true,
        helpful: 89,
        createdAt: new Date('2025-12-17'),
        updatedAt: new Date('2025-12-17')
      }
    ];
    await db.collection('reviews').insertMany(sampleReviews);
    console.log('✅ Inserted sample reviews');

    // Create indexes
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ sellerId: 1 });
    await db.collection('products').createIndex({ status: 1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('sellers').createIndex({ email: 1 }, { unique: true });
    await db.collection('delivery_persons').createIndex({ email: 1 }, { unique: true });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ sellerId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('reviews').createIndex({ productId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    console.log('✅ Created indexes');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Seller 1: john@premiumstore.com / seller123');
    console.log('   Seller 2: sarah@gadgetgalaxy.com / seller123');
    console.log('   Seller 3: mike@techhaven.com / seller123');
    console.log('   Delivery 1: david@delivery.com / delivery123');
    console.log('   Delivery 2: emily@delivery.com / delivery123');
    console.log('   User 1: alice@example.com / user123');
    console.log('   User 2: bob@example.com / user123');
    console.log('\n📊 Database Summary:');
    console.log(`   Products: ${MOCK_PRODUCTS.length}`);
    console.log(`   Sellers: ${MOCK_SELLERS.length}`);
    console.log(`   Delivery Persons: ${MOCK_DELIVERY_PERSONS.length}`);
    console.log('   Orders: 3');
    console.log('   Reviews: 4');
    console.log('   Users: 8 (1 admin + 2 regular + 3 sellers + 2 delivery)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Connection closed');
  }
}

seedDatabase();
