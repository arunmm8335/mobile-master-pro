export enum ViewState {
  HOME = 'HOME',
  SHOP = 'SHOP',
  PRODUCT = 'PRODUCT',
  TRADE_IN = 'TRADE_IN',
  REPAIRS = 'REPAIRS',
  CONTACT = 'CONTACT',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ADMIN = 'ADMIN',
  CHECKOUT = 'CHECKOUT',
  WISHLIST = 'WISHLIST',
  ORDERS = 'ORDERS',
  SELLER_DASHBOARD = 'SELLER_DASHBOARD',
  DELIVERY_DASHBOARD = 'DELIVERY_DASHBOARD',
  SELLER_REGISTER = 'SELLER_REGISTER',
  PROFILE = 'PROFILE'
}

export interface SelectedOptions {
  color?: string;
  ram?: string;
  storage?: string;
}

export interface ProductVariant {
  color?: string;
  ram?: string;
  storage?: string;
  images: string[]; // Images specific to this variant
  sku?: string; // Stock keeping unit for this variant
  price?: number; // Optional price override for this variant
  stock?: number; // Stock specific to this variant
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'seller' | 'delivery';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  sellerId?: string; // Reference to seller profile if user is a seller
  deliveryPersonId?: string; // Reference to delivery person profile
}

export interface Seller {
  id: string;
  userId: string; // Reference to user account
  storeName: string;
  storeDescription?: string;
  storeImage?: string;
  storeBanner?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  rating: number; // Average seller rating
  totalReviews: number;
  totalSales: number;
  status: 'pending' | 'approved' | 'suspended';
  commission: number; // Platform commission percentage
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DeliveryPerson {
  id: string;
  userId: string; // Reference to user account
  vehicleType: 'bike' | 'scooter' | 'car' | 'van';
  vehicleNumber: string;
  licenseNumber: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  status: 'pending' | 'approved' | 'suspended';
  assignedOrders: string[]; // Order IDs
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId: string; // Ensures verified purchase
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[]; // Customer uploaded images
  helpful: number; // Helpful votes count
  verified: boolean; // Verified purchase
  sellerResponse?: {
    message: string;
    respondedAt: Date;
  };
  createdAt?: string | Date;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number; // For sale display
  specs: string[];
  description?: string; // Detailed description
  image: string; // Primary image (for backwards compatibility)
  images?: string[]; // Gallery of multiple images
  colors?: string[];
  ramOptions?: string[];
  storageOptions?: string[];
  variants?: ProductVariant[]; // Variant-specific data (color/RAM/storage combinations with images)
  category: 'phone' | 'accessory' | 'tablet' | 'charger' | 'case' | 'earphones' | 'smartwatch';
  featured?: boolean;
  stock?: number; // If <= 0, treated as out of stock
  sellerId: string; // Reference to seller
  sellerName?: string; // Denormalized for display
  rating: number; // Average product rating
  totalReviews: number;
  totalSales: number;
  status: 'pending' | 'approved' | 'rejected'; // Admin approval
  tags?: string[]; // For search and filtering
  warranty?: string; // Warranty information
  returnPolicy?: string; // Return policy
  shippingInfo?: {
    weight: number; // in kg
    dimensions: { length: number; width: number; height: number }; // in cm
    freeShipping: boolean;
    shippingCharge?: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
  sellerName?: string;
  options?: SelectedOptions;
  selectedColor?: string;
  selectedRam?: string;
  selectedStorage?: string;
}

export interface TrackingUpdate {
  status: string;
  message: string;
  location?: string;
  timestamp: Date;
  updatedBy?: string; // User ID who made the update
}

export interface TrackingStage {
  stage: string;
  completed: boolean;
  timestamp?: Date | string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCharge?: number;
  discount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: 'razorpay' | 'cod';
  paymentProvider?: 'razorpay' | 'cod';
  paymentOrderId?: string;
  shippingAddress?: string;
  phone?: string;
  shipping?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
    landmark?: string;
  };
  trackingUpdates?: TrackingUpdate[];
  trackingStages?: TrackingStage[];
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryOtp?: string | null;
  deliveredAt?: Date | string;
  sellerId?: string;
  sellerName?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface TradeInEstimation {
  estimatedValue: string;
  reasoning: string;
}