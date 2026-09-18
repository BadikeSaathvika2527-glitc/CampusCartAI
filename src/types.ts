export type UserRole = 'student' | 'seller' | 'admin';

export interface StudentProfile {
  college: string;
  course: string;
  year: number;
  semester: number;
  hostelStatus: 'hostel' | 'day_scholar';
  hostelRoom?: string;
  budgetPreference?: number;
  preferredCategories?: string[];
}

export interface Address {
  id: string;
  label: string; // e.g., "Hostel Block B, Room 304" or "Home"
  fullName: string;
  phone: string;
  campusName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  profile?: StudentProfile;
  addresses?: Address[];
  sellerStoreId?: string;
  demoWalletBalance?: number;
  createdAt?: string;
  passwordHash?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  redirectTab?: 'shop' | 'seller' | 'admin';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  college?: string;
  course?: string;
  year?: number;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string; // Lucide icon name
  itemCount?: number;
  icon?: any;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  helpfulCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  price: number; // in INR ₹
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  specs: ProductSpec[];
  imageUrl: string;
  sellerId: string;
  storeName: string;
  deliveryDays: number;
  isHostelEssential?: boolean;
  isExamEssential?: boolean;
  isCseEssential?: boolean;
  isTripEssential?: boolean;
  isPresentationEssential?: boolean;
  tags: string[];
  isActive: boolean;
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartCalculation {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  appliedCouponCode?: string;
  deliveryFee: number;
  finalTotal: number;
  itemCount: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'cod' | 'demo_wallet';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sellerId: string;
  storeName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryOption: 'standard' | 'express';
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    message: string;
  }[];
}

export interface StudentKitItem {
  productId: string;
  quantity: number;
  isCore: boolean;
}

export interface StudentKit {
  id: string;
  title: string;
  slug: string;
  context: string;
  tagline: string;
  description: string;
  estimatedPrice: number;
  discountedPrice: number;
  originalPrice?: number;
  bannerImage?: string;
  targetSituation?: string;
  highlights?: string[];
  badge: string;
  iconName: string;
  itemIds: StudentKitItem[];
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
  expiryDate: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'ai' | 'promo';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  rating: number;
  totalSales: number;
  isApproved: boolean;
  contactEmail: string;
  phone: string;
  campusLocation: string;
  buildingLocation?: string;
  ownerName?: string;
}

// AI Context Engine Types
export interface AIRequirement {
  category: string;
  keywords: string[];
  quantity: number;
  purpose: string;
}

export interface AIProductRecommendation {
  product: Product;
  quantity: number;
  whyRecommended: string;
  isCore: boolean;
  alternativeOptions?: Product[];
}

export interface AIContextResponse {
  context: string;
  contextTitle: string;
  contextDescription: string;
  detectedBudget?: number;
  recommendations: AIProductRecommendation[];
  originalTotal: number;
  discountTotal: number;
  deliveryFee: number;
  finalTotal: number;
  isWithinBudget: boolean;
  budgetMessage: string;
  suggestedAdjustments?: string[];
  isFallback?: boolean;
}
