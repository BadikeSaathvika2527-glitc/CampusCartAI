import fs from 'fs';
import path from 'path';
import {
  User,
  Category,
  Product,
  Store,
  StudentKit,
  Coupon,
  Order,
  CartItem,
  NotificationItem,
  Review,
  OrderStatus
} from '../src/types.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_STORES,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_STUDENT_KITS
} from './seedData.ts';
import { INITIAL_PRODUCTS } from './productsData.ts';

interface DBSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  stores: Store[];
  studentKits: StudentKit[];
  coupons: Coupon[];
  orders: Order[];
  carts: Record<string, CartItem[]>; // userId -> CartItem[]
  wishlists: Record<string, string[]>; // userId -> productId[]
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campuscart.db.json');

class Database {
  private data: DBSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DBSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading DB file, re-initializing from seeds:', e);
    }
    return this.getInitialData();
  }

  private getInitialData(): DBSchema {
    // Initial sample orders for realistic seller & admin dashboards
    const sampleOrders: Order[] = [
      {
        id: 'ord-1001',
        orderNumber: 'CC-2026-1001',
        userId: 'student-1',
        customerName: 'Aarav Sharma',
        customerEmail: 'aarav.cse@campus.edu',
        customerPhone: '+91 91234 56780',
        items: [
          {
            productId: 'p-stat-notebooks',
            productName: 'Classmate Pulse 6-Subject Spiral Notebook (300 Pages)',
            price: 180,
            quantity: 2,
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            sellerId: 'seller-3',
            storeName: 'Campus Stationery & Books'
          },
          {
            productId: 'p-stat-pens',
            productName: 'Reynolds Jetter Classic Ball Pen Set (Pack of 5, Blue)',
            price: 120,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
            sellerId: 'seller-3',
            storeName: 'Campus Stationery & Books'
          }
        ],
        shippingAddress: {
          id: 'addr-1',
          label: 'Hostel Room',
          fullName: 'Aarav Sharma',
          phone: '+91 91234 56780',
          campusName: 'NIT Campus',
          addressLine1: 'Aryabhatta Hostel, 3rd Floor, Room 314',
          city: 'Bengaluru',
          pincode: '560064',
          isDefault: true
        },
        deliveryOption: 'standard',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: 480,
        discount: 50,
        deliveryFee: 0,
        total: 430,
        couponCode: 'STUDENT50',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: 'Delivered',
        trackingHistory: [
          { status: 'placed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), message: 'Order placed by student' },
          { status: 'confirmed', timestamp: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(), message: 'Store confirmed order' },
          { status: 'packed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), message: 'Order packed at Campus Stationery & Books' },
          { status: 'out_for_delivery', timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString(), message: 'Out for hostel gate drop' },
          { status: 'delivered', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), message: 'Delivered to Aryabhatta Hostel' }
        ]
      },
      {
        id: 'ord-1002',
        orderNumber: 'CC-2026-1002',
        userId: 'student-2',
        customerName: 'Priya Patel',
        customerEmail: 'priya.ece@campus.edu',
        customerPhone: '+91 91234 56781',
        items: [
          {
            productId: 'p-hostel-bedsheet',
            productName: 'Bombay Dyeing Pure Cotton Single Bedsheet with Pillow Cover',
            price: 499,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
            sellerId: 'seller-2',
            storeName: 'Student Living & Bedding'
          },
          {
            productId: 'p-hostel-lock',
            productName: 'Godrej Nav-Tal 7-Levers Heavy Duty Brass Padlock (3 Keys)',
            price: 380,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1510519138197-060d1d2c5b40?w=600&auto=format&fit=crop&q=80',
            sellerId: 'seller-2',
            storeName: 'Student Living & Bedding'
          },
          {
            productId: 'p-elec-lamp',
            productName: 'Wipro Garnet 6W Rechargeable LED Study Lamp',
            price: 649,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop&q=80',
            sellerId: 'seller-1',
            storeName: 'Campus Tech Hub'
          }
        ],
        shippingAddress: {
          id: 'addr-2',
          label: 'Girls Hostel',
          fullName: 'Priya Patel',
          phone: '+91 91234 56781',
          campusName: 'DTU Main Campus',
          addressLine1: 'Kalpana Chawla Hostel, Wing B, Room 108',
          city: 'New Delhi',
          pincode: '110042',
          isDefault: true
        },
        deliveryOption: 'express',
        paymentMethod: 'demo_wallet',
        paymentStatus: 'paid',
        orderStatus: 'preparing',
        subtotal: 1528,
        discount: 100,
        deliveryFee: 49,
        total: 1477,
        couponCode: 'WELCOME100',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: 'Today by 7:00 PM',
        trackingHistory: [
          { status: 'placed', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), message: 'Order placed with Demo Wallet' },
          { status: 'confirmed', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), message: 'Order confirmed by Campus Sellers' },
          { status: 'preparing', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), message: 'Items being gathered for packaging' }
        ]
      }
    ];

    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        userId: 'student-1',
        title: 'Welcome to CampusCart AI!',
        message: 'Try telling our AI assistant: "Hostel essentials under ₹3,000" or "Exam stationery under ₹500".',
        type: 'ai',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif-2',
        userId: 'student-1',
        title: 'Order CC-2026-1001 Delivered',
        message: 'Your exam stationery was delivered to Aryabhatta Hostel.',
        type: 'order',
        link: '/orders/ord-1001',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const initialWishlists: Record<string, string[]> = {
      'student-1': ['p-elec-laptopstand', 'p-cse-arduino']
    };

    const initialCarts: Record<string, CartItem[]> = {
      'student-1': []
    };

    const initial: DBSchema = {
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      stores: INITIAL_STORES,
      studentKits: INITIAL_STUDENT_KITS,
      coupons: INITIAL_COUPONS,
      orders: sampleOrders,
      carts: initialCarts,
      wishlists: initialWishlists,
      notifications: initialNotifications
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DBSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB file:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  // --- PRODUCTS ---
  public getProducts(filters?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    sellerId?: string;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
  }): Product[] {
    let result = this.data.products.filter(p => p.isActive);

    if (filters?.sellerId) {
      result = this.data.products.filter(p => p.sellerId === filters.sellerId);
    }

    if (filters?.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters?.minRating !== undefined) {
      result = result.filter(p => p.rating >= filters.minRating!);
    }
    if (filters?.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'discount':
          result.sort((a, b) => b.discountPercent - a.discountPercent);
          break;
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.persist();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.persist();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.persist();
    return true;
  }

  public addProductReview(productId: string, review: Review): Product | undefined {
    const p = this.getProductById(productId);
    if (!p) return undefined;
    if (!p.reviews) p.reviews = [];
    p.reviews.unshift(review);
    p.reviewCount += 1;
    const totalRating = p.reviews.reduce((acc, r) => acc + r.rating, 0);
    p.rating = Number((totalRating / p.reviews.length).toFixed(1));
    this.persist();
    return p;
  }

  // --- STORES ---
  public getStores(): Store[] {
    return this.data.stores;
  }

  public getStoreById(id: string): Store | undefined {
    return this.data.stores.find(s => s.id === id);
  }

  public getStoreBySellerId(sellerId: string): Store | undefined {
    return this.data.stores.find(s => s.sellerId === sellerId);
  }

  // --- STUDENT KITS ---
  public getStudentKits(): StudentKit[] {
    return this.data.studentKits;
  }

  public getStudentKitById(id: string): StudentKit | undefined {
    return this.data.studentKits.find(k => k.id === id || k.slug === id);
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.persist();
    return coupon;
  }

  // --- CART ---
  public getCart(userId: string): CartItem[] {
    return this.data.carts[userId] || [];
  }

  public addToCart(userId: string, productId: string, quantity = 1): CartItem[] {
    const product = this.getProductById(productId);
    if (!product || product.stock <= 0) {
      throw new Error('Product is currently out of stock');
    }

    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }

    const existing = this.data.carts[userId].find(item => item.productId === productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }
      existing.quantity = newQty;
    } else {
      if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }
      this.data.carts[userId].push({
        productId,
        product,
        quantity
      });
    }

    this.persist();
    return this.data.carts[userId];
  }

  public updateCartQuantity(userId: string, productId: string, quantity: number): CartItem[] {
    if (!this.data.carts[userId]) return [];

    if (quantity <= 0) {
      this.data.carts[userId] = this.data.carts[userId].filter(i => i.productId !== productId);
      this.persist();
      return this.data.carts[userId];
    }

    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    const item = this.data.carts[userId].find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.persist();
    }
    return this.data.carts[userId];
  }

  public removeFromCart(userId: string, productId: string): CartItem[] {
    if (!this.data.carts[userId]) return [];
    this.data.carts[userId] = this.data.carts[userId].filter(i => i.productId !== productId);
    this.persist();
    return this.data.carts[userId];
  }

  public clearCart(userId: string): void {
    this.data.carts[userId] = [];
    this.persist();
  }

  public addKitToCart(userId: string, kitId: string): CartItem[] {
    const kit = this.getStudentKitById(kitId);
    if (!kit) throw new Error('Kit not found');

    for (const item of kit.itemIds) {
      try {
        this.addToCart(userId, item.productId, item.quantity);
      } catch (e) {
        console.warn(`Could not add item ${item.productId} from kit ${kitId}:`, e);
      }
    }
    return this.getCart(userId);
  }

  // --- WISHLIST ---
  public getWishlist(userId: string): Product[] {
    const ids = this.data.wishlists[userId] || [];
    return ids.map(id => this.getProductById(id)).filter((p): p is Product => !!p);
  }

  public toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: Product[] } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }
    const idx = this.data.wishlists[userId].indexOf(productId);
    let inWishlist = false;
    if (idx >= 0) {
      this.data.wishlists[userId].splice(idx, 1);
      inWishlist = false;
    } else {
      this.data.wishlists[userId].push(productId);
      inWishlist = true;
    }
    this.persist();
    return { inWishlist, wishlist: this.getWishlist(userId) };
  }

  // --- ORDERS & INVENTORY ATOMICITY ---
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.data.orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersForSeller(sellerId: string): Order[] {
    return this.data.orders.filter(o => o.items.some(item => item.sellerId === sellerId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public placeOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'trackingHistory'>): Order {
    // 1. Validate stock for each item
    for (const item of orderData.items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product "${item.productName}" not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`);
      }
    }

    // 2. Deduct inventory atomically
    for (const item of orderData.items) {
      const product = this.getProductById(item.productId)!;
      product.stock -= item.quantity;
      if (product.stock <= 5) {
        // notify seller
        this.addNotification({
          userId: item.sellerId,
          title: `Low Stock Alert: ${product.name}`,
          message: `Only ${product.stock} units remaining in stock. Please restock soon.`,
          type: 'stock'
        });
      }
    }

    const orderId = 'ord-' + Date.now().toString(36);
    const orderNumber = 'CC-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      trackingHistory: [
        {
          status: 'placed',
          timestamp: now,
          message: 'Order placed successfully on CampusCart AI'
        }
      ]
    };

    // Deduct demo wallet if used
    if (orderData.paymentMethod === 'demo_wallet') {
      const user = this.getUserById(orderData.userId);
      if (user && (user.demoWalletBalance || 0) >= newOrder.total) {
        user.demoWalletBalance = (user.demoWalletBalance || 0) - newOrder.total;
      }
    }

    this.data.orders.unshift(newOrder);

    // Clear user cart
    this.clearCart(orderData.userId);

    // Notify student
    this.addNotification({
      userId: orderData.userId,
      title: `Order Confirmed: ${newOrder.orderNumber}`,
      message: `Your campus order of ${newOrder.items.length} items (Total: ₹${newOrder.total}) has been placed.`,
      type: 'order',
      link: `/orders/${newOrder.id}`
    });

    // Notify involved sellers
    const sellerIds = Array.from(new Set(newOrder.items.map(i => i.sellerId)));
    for (const sId of sellerIds) {
      this.addNotification({
        userId: sId,
        title: `New Student Order Received`,
        message: `Order #${newOrder.orderNumber} placed for your store items.`,
        type: 'order'
      });
    }

    this.persist();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, customMessage?: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    let message = customMessage || `Order status updated to ${newStatus.replace('_', ' ')}`;
    if (newStatus === 'confirmed') message = 'Store verified and confirmed your order';
    if (newStatus === 'preparing') message = 'Campus items are being gathered and packed';
    if (newStatus === 'packed') message = 'Package sealed and dispatched to campus logistics';
    if (newStatus === 'out_for_delivery') message = 'Out for campus delivery to student hostel/location';
    if (newStatus === 'delivered') message = 'Successfully delivered and handed over';

    order.trackingHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      message
    });

    // Notify student
    this.addNotification({
      userId: order.userId,
      title: `Order Update: ${order.orderNumber}`,
      message,
      type: 'order',
      link: `/orders/${order.id}`
    });

    this.persist();
    return order;
  }

  public cancelOrder(orderId: string, reason = 'Cancelled by student'): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.orderStatus === 'delivered' || order.orderStatus === 'out_for_delivery') {
      throw new Error('Order cannot be cancelled after dispatch or delivery.');
    }

    // Restore inventory
    for (const item of order.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }

    // Refund wallet if paid by wallet
    if (order.paymentMethod === 'demo_wallet') {
      const user = this.getUserById(order.userId);
      if (user) {
        user.demoWalletBalance = (user.demoWalletBalance || 0) + order.total;
      }
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    order.updatedAt = new Date().toISOString();
    order.trackingHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: `Order cancelled: ${reason}. Inventory restored.`
    });

    this.addNotification({
      userId: order.userId,
      title: `Order Cancelled: ${order.orderNumber}`,
      message: `Order was cancelled. Any deductions were refunded to your demo wallet.`,
      type: 'order'
    });

    this.persist();
    return order;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(userId: string): void {
    for (const n of this.data.notifications) {
      if (n.userId === userId) n.isRead = true;
    }
    this.persist();
  }

  // --- RESET TO SEEDS (Useful for testing) ---
  public resetToSeeds(): DBSchema {
    this.data = this.getInitialData();
    return this.data;
  }
}

export const db = new Database();
