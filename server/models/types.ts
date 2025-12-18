import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  specs: string[];
  description?: string;
  image: string;
  images?: string[];
  colors?: string[];
  ramOptions?: string[];
  storageOptions?: string[];
  variants?: ProductVariant[];
  category: 'phone' | 'accessory' | 'tablet' | 'charger' | 'case' | 'earphones' | 'smartwatch';
  featured?: boolean;
  stock?: number;
  sellerId: string;
  sellerName?: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
  warranty?: string;
  returnPolicy?: string;
  shippingInfo?: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    freeShipping: boolean;
    shippingCharge?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
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
  images: string[];
  sku?: string;
  price?: number;
  stock?: number;
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
  updatedBy?: string;
}

export interface TrackingStage {
  stage: string;
  completed: boolean;
  timestamp?: Date;
}

export interface Order {
  _id?: ObjectId;
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
  deliveredAt?: Date;
  sellerId?: string;
  sellerName?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'seller' | 'delivery';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  sellerId?: string;
  deliveryPersonId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Seller {
  _id?: ObjectId;
  id: string;
  userId: string;
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
  rating: number;
  totalReviews: number;
  totalSales: number;
  status: 'pending' | 'approved' | 'suspended';
  commission: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryPerson {
  _id?: ObjectId;
  id: string;
  userId: string;
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
  assignedOrders: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  _id?: ObjectId;
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  sellerResponse?: {
    message: string;
    respondedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Session {
  _id?: ObjectId;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}
