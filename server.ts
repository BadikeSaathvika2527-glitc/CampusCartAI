import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { generateStudentKitRecommendation } from './server/gemini.ts';
import type { Product, OrderStatus, PaymentMethod } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CampusCart AI Backend',
      tagline: 'One Student. Every Need. One Smart Campus Cart.'
    });
  });

  // --- AUTH & USERS ---
  app.get('/api/users/all', (req, res) => {
    res.json(db.getUsers());
  });

  app.get('/api/users/current', (req, res) => {
    const userId = (req.query.userId as string) || 'student-1';
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  app.post('/api/users/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found with this email. Try demo accounts below.' });
    }
    res.json({ success: true, user });
  });

  app.post('/api/users/register', (req, res) => {
    const { name, email, phone, role, college, course } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = db.createUser({
      id: 'usr-' + Date.now().toString(36),
      name,
      email,
      phone: phone || '+91 90000 00000',
      role: role || 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      demoWalletBalance: 2000,
      profile: {
        college: college || 'Campus University',
        course: course || 'General Studies',
        year: 1,
        semester: 1,
        hostelStatus: 'hostel'
      }
    });
    res.json({ success: true, user: newUser });
  });

  app.put('/api/users/profile', (req, res) => {
    const { userId, profile, addresses } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const updated = db.updateUser(userId, { profile, addresses });
    res.json(updated);
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

  app.post('/api/products', (req, res) => {
    const productData = req.body;
    if (!productData.name || !productData.price || !productData.categoryId) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }
    const newProduct: Product = {
      ...productData,
      id: 'p-' + Date.now().toString(36),
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 4.5,
      reviewCount: 0,
      isActive: true,
      tags: productData.tags || []
    };
    const created = db.createProduct(newProduct);
    res.json(created);
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const ok = db.deleteProduct(req.params.id);
    res.json({ success: ok });
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

    // Populate kit item details
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

  // Simulation: advance order to next stage
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
    const { query, budget } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Please describe what you need for college.' });
    }
    try {
      const recommendation = await generateStudentKitRecommendation(query, budget ? Number(budget) : undefined);
      res.json(recommendation);
    } catch (e: any) {
      console.error('AI assistant error:', e);
      res.status(500).json({ error: 'Failed to process student request', details: e.message });
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
  app.get('/api/seller/stats', (req, res) => {
    const sellerId = (req.query.sellerId as string) || 'seller-1';
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

  // --- ADMIN DASHBOARD STATS ---
  app.get('/api/admin/stats', (req, res) => {
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

  app.post('/api/admin/stores/:id/toggle-approval', (req, res) => {
    const store = db.getStoreById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    store.isApproved = !store.isApproved;
    res.json({ success: true, store });
  });

  app.post('/api/seed/reset', (req, res) => {
    const data = db.resetToSeeds();
    res.json({ success: true, message: 'Database reset to fresh student seed state' });
  });

  // --- VITE MIDDLEWARE / STATIC FALLBACK ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusCart AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
