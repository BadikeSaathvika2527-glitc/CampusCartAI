import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  CartItem,
  CartCalculation,
  Product,
  NotificationItem,
  Category,
  StudentKit,
  Order
} from '../types.ts';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => Promise<void>;
  activeRole: 'student' | 'seller' | 'admin';
  cart: CartItem[];
  cartSummary: CartCalculation;
  wishlist: Product[];
  categories: Category[];
  studentKits: StudentKit[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  activeTab: 'shop' | 'kits' | 'orders' | 'profile' | 'seller' | 'admin';
  setActiveTab: (tab: 'shop' | 'kits' | 'orders' | 'profile' | 'seller' | 'admin') => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAiModalOpen: boolean;
  aiInitialPrompt: string;
  aiInitialBudget?: number;
  openAiAssistant: (prompt?: string, budget?: number) => void;
  closeAiAssistant: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  trackingOrderId: string | null;
  trackOrder: (orderId: string) => void;
  closeTracking: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addKitToCart: (kitId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  appliedCoupon: string | null;
  deliveryOption: 'standard' | 'express';
  setDeliveryOption: (opt: 'standard' | 'express') => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshUserData: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'student-1',
    name: 'Aarav Sharma',
    email: 'aarav.cse@campus.edu',
    phone: '+91 91234 56780',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 2500
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [studentKits, setStudentKits] = useState<StudentKit[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'kits' | 'orders' | 'profile' | 'seller' | 'admin'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [aiInitialBudget, setAiInitialBudget] = useState<number | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Cart calculations & coupons
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [cartSummary, setCartSummary] = useState<CartCalculation>({
    subtotal: 0,
    discount: 0,
    couponDiscount: 0,
    deliveryFee: 0,
    finalTotal: 0,
    itemCount: 0
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Fetch initial static catalog info
  const fetchGlobalData = async () => {
    try {
      const [usersRes, catsRes, kitsRes] = await Promise.all([
        fetch('/api/users/all'),
        fetch('/api/categories'),
        fetch('/api/kits')
      ]);
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (kitsRes.ok) setStudentKits(await kitsRes.json());
    } catch (e) {
      console.error('Error fetching global catalog:', e);
    }
  };

  const refreshUserData = useCallback(async () => {
    try {
      const [userRes, cartRes, wishRes, notifRes] = await Promise.all([
        fetch(`/api/users/current?userId=${currentUser.id}`),
        fetch(`/api/cart?userId=${currentUser.id}`),
        fetch(`/api/wishlist?userId=${currentUser.id}`),
        fetch(`/api/notifications?userId=${currentUser.id}`)
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setCurrentUser(u);
      }
      if (cartRes.ok) {
        setCart(await cartRes.json());
      }
      if (wishRes.ok) {
        setWishlist(await wishRes.json());
      }
      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      }
    } catch (e) {
      console.error('Error refreshing user data:', e);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [currentUser.id, refreshUserData]);

  // Recalculate cart totals whenever cart or coupon or delivery changes
  useEffect(() => {
    const calc = async () => {
      try {
        const res = await fetch('/api/checkout/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
            couponCode: appliedCoupon,
            deliveryOption
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCartSummary(data);
        }
      } catch (e) {
        console.error('Failed to calculate cart totals:', e);
      }
    };
    calc();
  }, [cart, appliedCoupon, deliveryOption]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/current?userId=${userId}`);
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setAppliedCoupon(null);
        if (user.role === 'seller') {
          setActiveTab('seller');
        } else if (user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('shop');
        }
        showToast(`Switched account to ${user.name} (${user.role.toUpperCase()})`, 'info');
      }
    } catch (e) {
      showToast('Failed to switch user', 'error');
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }
      setCart(data.cart);
      showToast('Added to Campus Cart!', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quantity');
      }
      setCart(data.cart);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId })
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        showToast('Item removed from cart', 'info');
      }
    } catch (e) {
      showToast('Could not remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      setCart([]);
      setAppliedCoupon(null);
    } catch (e) {
      console.error(e);
    }
  };

  const addKitToCart = async (kitId: string) => {
    try {
      const res = await fetch(`/api/kits/${kitId}/add-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add kit to cart');
      setCart(data.cart);
      showToast('All items in the kit added to your cart!', 'success');
      setIsCartOpen(true);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId })
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist);
        showToast(data.inWishlist ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
      }
    } catch (e) {
      showToast('Could not update wishlist', 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSummary.subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Invalid coupon', 'error');
        return { success: false, message: data.error };
      }
      setAppliedCoupon(data.code);
      showToast(`Coupon "${data.code}" applied! Saved ₹${data.discount}`, 'success');
      return { success: true, message: `Coupon applied: Saved ₹${data.discount}` };
    } catch (e: any) {
      showToast('Failed to apply coupon', 'error');
      return { success: false, message: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const openAiAssistant = (prompt?: string, budget?: number) => {
    setAiInitialPrompt(prompt || '');
    setAiInitialBudget(budget);
    setIsAiModalOpen(true);
  };

  const closeAiAssistant = () => setIsAiModalOpen(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openProductModal = (product: Product) => setSelectedProduct(product);
  const closeProductModal = () => setSelectedProduct(null);
  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const trackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveTab('orders');
  };
  const closeTracking = () => setTrackingOrderId(null);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        activeRole: currentUser.role,
        cart,
        cartSummary,
        wishlist,
        categories,
        studentKits,
        notifications,
        unreadNotificationsCount,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isAiModalOpen,
        aiInitialPrompt,
        aiInitialBudget,
        openAiAssistant,
        closeAiAssistant,
        isCartOpen,
        openCart,
        closeCart,
        selectedProduct,
        openProductModal,
        closeProductModal,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        trackingOrderId,
        trackOrder,
        closeTracking,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addKitToCart,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        deliveryOption,
        setDeliveryOption,
        applyCoupon,
        removeCoupon,
        refreshUserData,
        toasts,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
