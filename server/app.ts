import express from 'express';
import { db } from './db.ts';
import { generateStudentKitRecommendation, getGeminiApiKey } from './gemini.ts';
import type { Product, OrderStatus, PaymentMethod, User, UserRole } from '../src/types.ts';
import {
  hashPassword,
  verifyPassword,
  createToken,
  sanitizeUser,
  authenticateUser,
  requireAuth,
  requireRole,
  migrateUsersAndSeedAdmin
} from './auth.ts';

export const app = express();

app.use(express.json());

// Run migration and ensure initial admin account on startup
migrateUsersAndSeedAdmin();

// Enable basic CORS and header normalization
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If Vercel rewrites stripped the '/api' prefix, prepend it so routes match cleanly
  if (req.url && !req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/assets') && !req.url.startsWith('/vite')) {
    const apiPrefixes = [
      '/health', '/ai', '/users', '/auth', '/categories', '/products',
      '/kits', '/cart', '/wishlist', '/coupons', '/checkout',
      '/orders', '/recommendations', '/notifications', '/seller',
      '/admin', '/seed', '/stores'
    ];
    if (apiPrefixes.some(p => req.url.startsWith(p))) {
      req.url = '/api' + req.url;
    }
  }

  next();
});

// Authenticate user on every incoming request
app.use(authenticateUser);

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(getGeminiApiKey());
  res.json({
    status: 'ok',
    service: 'CampusCart AI Backend',
    tagline: 'One Student. Every Need. One Smart Campus Cart.',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    hasGeminiKey: hasKey,
    productsCount: db.getProducts({}).length
  });
});

// --- AUTH & RBAC ENDPOINTS ---

/**
 * Public Student Registration:
 * - Every new public registration MUST automatically create a STUDENT account.
 * - Any client attempt to pass { role: 'admin' } or { role: 'seller' } is strictly rejected or forced to 'student'.
 * - Passwords are securely hashed with PBKDF2 + cryptographic salt.
 */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword, college, course, year, phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required for registration' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password do not match' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  // SECURITY: Never allow public registration to create ADMIN or SELLER accounts.
  if (req.body.role && req.body.role.toLowerCase() !== 'student') {
    console.warn(`[CampusCart RBAC Alert] Public registration attempt with forbidden role '${req.body.role}' from IP ${req.ip}. Forcing STUDENT role.`);
  }

  const newStudent: User = {
    id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    name: String(name).trim(),
    email: normalizedEmail,
    phone: phone ? String(phone).trim() : '+91 90000 00000',
    role: 'student', // ALWAYS STRICTLY STUDENT
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 2000,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    profile: {
      college: college ? String(college).trim() : 'Campus University',
      course: course ? String(course).trim() : 'General Studies',
      year: year ? Number(year) : 1,
      semester: year ? Number(year) * 2 - 1 : 1,
      hostelStatus: 'hostel',
      hostelRoom: 'Campus Hostel'
    }
  };

  db.createUser(newStudent);
  const token = createToken(newStudent);

  res.status(201).json({
    success: true,
    message: 'Student account created successfully!',
    token,
    user: sanitizeUser(newStudent),
    redirectTab: 'shop'
  });
});

/**
 * Universal Login:
 * - Checks email and securely verifies password hash.
 * - Automatically checks stored role and specifies appropriate dashboard/home redirect.
 * - STUDENT -> 'shop'
 * - SELLER -> 'seller'
 * - ADMIN -> 'admin'
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.getUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address' });
  }

  const isValidPassword = verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
  }

  const token = createToken(user);
  let redirectTab: 'shop' | 'seller' | 'admin' = 'shop';
  if (user.role === 'admin') {
    redirectTab = 'admin';
  } else if (user.role === 'seller') {
    redirectTab = 'seller';
  }

  res.json({
    success: true,
    token,
    user: sanitizeUser(user),
    redirectTab
  });
});

/**
 * Dedicated Admin Login:
 * - Requires ADMIN role. Non-admin accounts are rejected with 403 Forbidden.
 */
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Admin email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.getUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid administrator credentials' });
  }

  const isValidPassword = verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid administrator credentials' });
  }

  if (user.role !== 'admin') {
    console.warn(`[CampusCart RBAC Alert] Non-admin user ${user.id} (${user.role}) attempted admin portal login.`);
    return res.status(403).json({
      error: 'Access Denied: This portal is reserved strictly for authorized University Administrators.',
      code: 'FORBIDDEN'
    });
  }

  const token = createToken(user);
  res.json({
    success: true,
    token,
    user: sanitizeUser(user),
    redirectTab: 'admin'
  });
});

/**
 * Demo Login (For test personas):
 * - Issues an authenticated token for a seeded test persona without hardcoding passwords in client code.
 */
app.post('/api/auth/demo-login', (req, res) => {
  const { personaId, role } = req.body || {};
  let targetUser: User | undefined;

  if (personaId) {
    targetUser = db.getUserById(personaId);
  } else if (role) {
    targetUser = db.getUsers().find(u => u.role === role);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target persona not found in database' });
  }

  const token = createToken(targetUser);
  let redirectTab: 'shop' | 'seller' | 'admin' = 'shop';
  if (targetUser.role === 'admin') redirectTab = 'admin';
  else if (targetUser.role === 'seller') redirectTab = 'seller';

  res.json({
    success: true,
    token,
    user: sanitizeUser(targetUser),
    redirectTab
  });
});

/**
 * Get currently authenticated user session
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: sanitizeUser(req.user!)
  });
});

/**
 * User Logout
 */
app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Legacy User Endpoints (Preserved for compatibility, secured)
app.get('/api/users/all', (_req, res) => {
  const users = db.getUsers().map(sanitizeUser);
  res.json(users);
});

app.get('/api/users/current', (req, res) => {
  if (req.user) {
    return res.json(sanitizeUser(req.user));
  }
  const userId = (req.query.userId as string) || 'student-1';
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(sanitizeUser(user));
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'User not found with this email' });
  }

  // If password is provided, verify it
  if (password && !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = createToken(user);
  res.json({ success: true, token, user: sanitizeUser(user) });
});

app.post('/api/users/register', (req, res) => {
  // Delegate to safe student registration
  req.url = '/api/auth/register';
  return app._router.handle(req, res);
});

/**
 * Update User Profile:
 * - SECURITY: Explicitly rejects any attempt by a student/seller to modify their role.
 * - Users can only edit their own profile unless they are an admin.
 */
app.put('/api/users/profile', requireAuth, (req, res) => {
  const { userId, profile, addresses, name, phone, role } = req.body || {};
  const targetId = userId || req.user!.id;

  // SECURITY CHECK 1: Disallow unauthorized role changes
  if (role && role !== req.user!.role) {
    console.warn(`[CampusCart Security Alert] User ${req.user!.id} (${req.user!.role}) attempted to elevate role to '${role}'! REJECTED.`);
    return res.status(403).json({
      error: 'Unauthorized role modification attempt: You cannot modify account roles.',
      code: 'ROLE_MODIFICATION_FORBIDDEN'
    });
  }

  // SECURITY CHECK 2: Non-admin can only update their own record
  if (req.user!.role !== 'admin' && req.user!.id !== targetId) {
    return res.status(403).json({
      error: 'Access Denied: You cannot modify another user\'s profile.',
      code: 'FORBIDDEN'
    });
  }

  const updates: Partial<User> = {};
  if (profile) updates.profile = profile;
  if (addresses) updates.addresses = addresses;
  if (name) updates.name = String(name).trim();
  if (phone) updates.phone = String(phone).trim();

  const updated = db.updateUser(targetId, updates);
  if (!updated) return res.status(404).json({ error: 'User not found' });

  res.json(sanitizeUser(updated));
});


// --- CATEGORIES ---
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const { search, categoryId, minPrice, maxPrice, minRating, inStockOnly, sellerId, sortBy } = req.query;
  const products = db.getProducts({
    search: search as string,
    categoryId: categoryId as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    inStockOnly: inStockOnly === 'true',
    sellerId: sellerId as string,
    sortBy: sortBy as any
  });
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', requireRole(['seller', 'admin']), (req, res) => {
  const productData = req.body;
  if (!productData.name || !productData.price || !productData.categoryId) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  // If seller, ensure sellerId and store are tied to authenticated seller
  let sellerId = productData.sellerId;
  let storeName = productData.storeName;
  if (req.user!.role === 'seller') {
    sellerId = req.user!.id;
    const store = db.getStoreBySellerId(req.user!.id);
    if (store) storeName = store.name;
  }

  const newProduct: Product = {
    ...productData,
    id: 'p-' + Date.now().toString(36),
    sellerId: sellerId || req.user!.id,
    storeName: storeName || 'Campus Partner Store',
    slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: 4.5,
    reviewCount: 0,
    isActive: true,
    tags: Array.isArray(productData.tags)
      ? productData.tags
      : String(productData.tags || '')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
  };
  const created = db.createProduct(newProduct);
  res.status(201).json(created);
});

app.put('/api/products/:id', requireRole(['seller', 'admin']), (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // If user is seller, verify they own this product
  if (req.user!.role === 'seller' && product.sellerId !== req.user!.id) {
    return res.status(403).json({
      error: 'Access Denied: You cannot modify products belonging to another seller store.',
      code: 'FORBIDDEN'
    });
  }

  const updated = db.updateProduct(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/products/:id', requireRole(['seller', 'admin']), (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (req.user!.role === 'seller' && product.sellerId !== req.user!.id) {
    return res.status(403).json({
      error: 'Access Denied: You cannot delete products belonging to another seller store.',
      code: 'FORBIDDEN'
    });
  }

  const deleted = db.deleteProduct(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { userId, userName, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }
  const updated = db.addProductReview(req.params.id, {
    id: 'rev-' + Date.now().toString(36),
    userId: userId || 'student-1',
    userName: userName || 'Verified Student',
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  });
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

// --- STUDENT KITS ---
app.get('/api/kits', (req, res) => {
  res.json(db.getStudentKits());
});

app.get('/api/kits/:id', (req, res) => {
  const kit = db.getStudentKitById(req.params.id);
  if (!kit) return res.status(404).json({ error: 'Student Kit not found' });

  const populatedItems = kit.itemIds.map(item => ({
    ...item,
    product: db.getProductById(item.productId)
  })).filter(i => !!i.product);

  res.json({ ...kit, items: populatedItems });
});

app.post('/api/kits/:id/add-to-cart', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    const cart = db.addKitToCart(userId, req.params.id);
    res.json({ success: true, cart });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- CART ---
app.get('/api/cart', (req, res) => {
  const userId = (req.query.userId as string) || 'student-1';
  const cart = db.getCart(userId);
  res.json(cart);
});

app.post('/api/cart/add', (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }
  try {
    const cart = db.addToCart(userId, productId, quantity || 1);
    res.json({ success: true, cart });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/cart/update', (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({ error: 'userId, productId and quantity are required' });
  }
  try {
    const cart = db.updateCartQuantity(userId, productId, quantity);
    res.json({ success: true, cart });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/cart/remove', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }
  const cart = db.removeFromCart(userId, productId);
  res.json({ success: true, cart });
});

app.post('/api/cart/clear', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  db.clearCart(userId);
  res.json({ success: true, cart: [] });
});

// --- WISHLIST ---
app.get('/api/wishlist', (req, res) => {
  const userId = (req.query.userId as string) || 'student-1';
  res.json(db.getWishlist(userId));
});

app.post('/api/wishlist/toggle', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }
  const result = db.toggleWishlist(userId, productId);
  res.json(result);
});

app.post('/api/wishlist/move-to-cart', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }
  try {
    db.addToCart(userId, productId, 1);
    db.toggleWishlist(userId, productId);
    res.json({ success: true, cart: db.getCart(userId), wishlist: db.getWishlist(userId) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- COUPONS ---
app.get('/api/coupons', (req, res) => {
  res.json(db.getCoupons());
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });
  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired campus coupon code' });
  }
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({
      error: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrder}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'fixed') {
    discount = coupon.discountAmount;
  } else {
    discount = Math.round((subtotal * coupon.discountAmount) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  res.json({
    valid: true,
    code: coupon.code,
    discount,
    description: coupon.description
  });
});

// --- CHECKOUT & CALCULATIONS ---
app.post('/api/checkout/calculate', (req, res) => {
  const { items, couponCode, deliveryOption } = req.body;
  let subtotal = 0;
  let originalTotal = 0;

  for (const item of items || []) {
    const product = db.getProductById(item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
      originalTotal += product.originalPrice * item.quantity;
    }
  }

  let couponDiscount = 0;
  let appliedCoupon = undefined;
  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    if (coupon && subtotal >= coupon.minOrder) {
      appliedCoupon = coupon.code;
      if (coupon.discountType === 'fixed') {
        couponDiscount = coupon.discountAmount;
      } else {
        couponDiscount = Math.round((subtotal * coupon.discountAmount) / 100);
        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
          couponDiscount = coupon.maxDiscount;
        }
      }
    }
  }

  let deliveryFee = subtotal >= 499 ? 0 : 49;
  if (deliveryOption === 'express') {
    deliveryFee += 30; // Express hostel speed delivery
  }

  const discount = originalTotal - subtotal + couponDiscount;
  const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  res.json({
    subtotal,
    originalTotal,
    couponDiscount,
    appliedCoupon,
    deliveryFee,
    discount,
    finalTotal,
    itemCount: (items || []).reduce((acc: number, i: any) => acc + (i.quantity || 1), 0)
  });
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  const { userId, sellerId } = req.query;
  if (sellerId) {
    return res.json(db.getOrdersForSeller(sellerId as string));
  }
  res.json(db.getOrders(userId as string));
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  try {
    const newOrder = db.placeOrder(req.body);
    res.json({ success: true, order: newOrder });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/orders/:id/status', (req, res) => {
  const { status, message } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    const updated = db.updateOrderStatus(req.params.id, status as OrderStatus, message);
    res.json({ success: true, order: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const { reason } = req.body;
  try {
    const cancelled = db.cancelOrder(req.params.id, reason);
    res.json({ success: true, order: cancelled });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/orders/:id/simulate-next', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const flow: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered'];
  const currentIdx = flow.indexOf(order.orderStatus);

  if (currentIdx === -1 || currentIdx >= flow.length - 1) {
    return res.status(400).json({ error: 'Order is already delivered or cannot advance further in simulation' });
  }

  const nextStatus = flow[currentIdx + 1];
  const updated = db.updateOrderStatus(order.id, nextStatus);
  res.json({ success: true, order: updated, simulated: true });
});

// --- AI ASSISTANT ---
app.post('/api/ai/assistant', async (req, res) => {
  const { query, budget } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'Please describe what you need for college.' });
  }
  try {
    console.log(`[CampusCart AI] Incoming student assistant query: "${query}", budget: ${budget ?? 'auto'}`);
    const recommendation = await generateStudentKitRecommendation(query, budget ? Number(budget) : undefined);
    res.json(recommendation);
  } catch (e: any) {
    console.error('[CampusCart AI] Assistant API error:', e);
    res.status(500).json({ error: 'Failed to process student request', details: e?.message || 'Server error' });
  }
});

// --- RECOMMENDATIONS ---
app.get('/api/recommendations', (req, res) => {
  const userId = (req.query.userId as string) || 'student-1';
  const user = db.getUserById(userId);
  const allProducts = db.getProducts({ inStockOnly: true });

  let recommended: Product[] = [];
  const course = user?.profile?.course?.toLowerCase() || '';

  if (course.includes('computer') || course.includes('cse') || course.includes('bca')) {
    recommended = allProducts.filter(p => p.isCseEssential || p.categoryId === 'cat-electronics');
  } else if (user?.profile?.hostelStatus === 'hostel') {
    recommended = allProducts.filter(p => p.isHostelEssential);
  } else {
    recommended = allProducts.filter(p => p.rating >= 4.7);
  }

  res.json(recommended.slice(0, 8));
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req, res) => {
  const userId = (req.query.userId as string) || 'student-1';
  res.json(db.getNotifications(userId));
});

app.post('/api/notifications/:id/read', (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  db.markAllNotificationsRead(userId);
  res.json({ success: true });
});

// --- SELLER DASHBOARD STATS ---
app.get('/api/seller/stats', requireRole(['seller', 'admin']), (req, res) => {
  // If authenticated user is a seller, restrict strictly to their own store
  let sellerId = (req.query.sellerId as string) || 'seller-1';
  if (req.user!.role === 'seller') {
    sellerId = req.user!.id;
  }

  const store = db.getStoreBySellerId(sellerId);
  const products = db.getProducts({ sellerId });
  const orders = db.getOrdersForSeller(sellerId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => {
    const sellerItemTotal = o.items
      .filter(i => i.sellerId === sellerId)
      .reduce((s, i) => s + i.price * i.quantity, 0);
    return sum + sellerItemTotal;
  }, 0);

  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.orderStatus));
  const lowStockProducts = products.filter(p => p.stock <= 10);

  const totalRevenue = orders.reduce((sum, o) => {
    const sellerItemTotal = o.items
      .filter(i => i.sellerId === sellerId)
      .reduce((s, i) => s + i.price * i.quantity, 0);
    return sum + sellerItemTotal;
  }, 0);

  res.json({
    store,
    todayOrdersCount: todayOrders.length,
    todayRevenue,
    pendingOrdersCount: pendingOrders.length,
    lowStockCount: lowStockProducts.length,
    totalRevenue,
    productsCount: products.length,
    recentOrders: orders.slice(0, 6),
    lowStockProducts
  });
});

// --- ADMIN DASHBOARD & MANAGEMENT (STRICT ADMIN ROLE) ---
app.get('/api/admin/stats', requireRole('admin'), (_req, res) => {
  const users = db.getUsers();
  const students = users.filter(u => u.role === 'student');
  const sellers = users.filter(u => u.role === 'seller');
  const products = db.getProducts({});
  const orders = db.getOrders();
  const stores = db.getStores();

  const totalRevenue = orders.reduce((sum, o) => o.orderStatus !== 'cancelled' ? sum + o.total : sum, 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus));

  res.json({
    totalStudents: students.length,
    totalSellers: sellers.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    activeOrdersCount: activeOrders.length,
    pendingSellerApprovals: stores.filter(s => !s.isApproved).length,
    recentOrders: orders.slice(0, 8),
    stores,
    topCategories: db.getCategories()
  });
});

/**
 * Admin: List all platform users with role filters and metrics
 */
app.get('/api/admin/users', requireRole('admin'), (req, res) => {
  const { role } = req.query;
  let users = db.getUsers();
  if (role) {
    users = users.filter(u => u.role === role);
  }
  res.json(users.map(sanitizeUser));
});

/**
 * Admin: Approve or Suspend Campus Partner Store
 */
app.post('/api/admin/stores/:id/toggle-approval', requireRole('admin'), (req, res) => {
  const store = db.getStoreById(req.params.id);
  if (!store) return res.status(404).json({ error: 'Store not found' });
  store.isApproved = !store.isApproved;
  res.json({ success: true, store });
});

/**
 * Admin: Create Authorized Seller Account & Store
 * - Only verified administrators can approve/create seller accounts.
 */
app.post('/api/admin/create-seller', requireRole('admin'), (req, res) => {
  const { name, email, password, phone, storeName, campusLocation, buildingLocation, description } = req.body || {};

  if (!name || !email || !password || !storeName) {
    return res.status(400).json({ error: 'Seller name, email, password, and store name are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const sellerId = 'seller-' + Date.now().toString(36);
  const storeId = 'store-' + Date.now().toString(36);

  const newSeller: User = {
    id: sellerId,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: phone ? String(phone).trim() : '+91 98000 00000',
    role: 'seller', // Strictly SELLER
    sellerStoreId: storeId,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  db.createUser(newSeller);

  const newStore = db.createStore({
    id: storeId,
    name: String(storeName).trim(),
    sellerId: sellerId,
    campusLocation: campusLocation || buildingLocation || 'Campus Student Center, Ground Floor',
    buildingLocation: buildingLocation || campusLocation || 'Student Activity Center',
    rating: 4.8,
    isApproved: true,
    description: description || 'Authorized campus vendor providing authentic student essentials and fast delivery.'
  });

  res.status(201).json({
    success: true,
    message: 'Authorized seller account and campus store created successfully',
    seller: sanitizeUser(newSeller),
    store: newStore
  });
});

/**
 * Admin: Provision another administrator account
 * - SECURITY: Only an existing authorized administrator can create another admin account.
 */
app.post('/api/admin/create-admin', requireRole('admin'), (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Admin name, email, and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newAdmin: User = {
    id: 'admin-' + Date.now().toString(36),
    name: String(name).trim(),
    email: normalizedEmail,
    phone: phone ? String(phone).trim() : '+91 99999 00000',
    role: 'admin',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  db.createUser(newAdmin);

  res.status(201).json({
    success: true,
    message: 'New university administrator created successfully',
    admin: sanitizeUser(newAdmin)
  });
});

app.post('/api/seed/reset', requireRole('admin'), (_req, res) => {
  db.resetToSeeds();
  migrateUsersAndSeedAdmin();
  res.json({ success: true, message: 'Database reset to fresh student seed state' });
});
