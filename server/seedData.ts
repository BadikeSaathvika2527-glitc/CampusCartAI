import type { Category, Product, User, Store, StudentKit, Coupon } from '../src/types.ts';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-college', name: 'College Essentials', slug: 'college-essentials', description: 'Notebooks, pens, geometry boxes, calculators & office files', iconName: 'BookOpen', itemCount: 12 },
  { id: 'cat-hostel', name: 'Hostel Essentials', slug: 'hostel-essentials', description: 'Bedding, buckets, laundry nets, locks & room organizers', iconName: 'Home', itemCount: 14 },
  { id: 'cat-electronics', name: 'Electronics & Tech', slug: 'electronics', description: 'Wireless mice, keyboards, power banks, USB drives & lamps', iconName: 'Laptop', itemCount: 12 },
  { id: 'cat-cse', name: 'CSE & Engineering', slug: 'cse-engineering', description: 'Arduino boards, breadboards, sensors, jumper wires & project kits', iconName: 'Cpu', itemCount: 10 },
  { id: 'cat-care', name: 'Personal Care & Grooming', slug: 'personal-care', description: 'Toiletries, hygiene packs, mirrors & first-aid grooming', iconName: 'Sparkles', itemCount: 8 },
  { id: 'cat-travel', name: 'Travel & Campus Bags', slug: 'travel', description: 'Water bottles, backpacks, travel pouches & compact umbrellas', iconName: 'Compass', itemCount: 7 },
  { id: 'cat-fashion', name: 'Campus Fashion & Wear', slug: 'fashion', description: 'College hoodies, comfortable slide footwear & ID lanyards', iconName: 'Shirt', itemCount: 6 },
  { id: 'cat-gifts', name: 'Gifts & Celebrations', slug: 'gifts', description: 'Farewell mementos, greeting cards, birthday mugs & custom pins', iconName: 'Gift', itemCount: 5 }
];

export const INITIAL_STORES: Store[] = [
  { id: 'store-1', sellerId: 'seller-1', name: 'Campus Tech Hub', description: 'Verified electronics & engineering lab supplies for college students', rating: 4.8, totalSales: 3420, isApproved: true, contactEmail: 'campustech@campuscart.ai', phone: '+91 98765 43210', campusLocation: 'Tech Tower Basement, Student Plaza' },
  { id: 'store-2', sellerId: 'seller-2', name: 'Student Living & Bedding', description: 'Quality hostel linens, room decor, storage & hygiene essentials', rating: 4.7, totalSales: 2180, isApproved: true, contactEmail: 'living@campuscart.ai', phone: '+91 98765 43211', campusLocation: 'Hostel Gate 2 Market' },
  { id: 'store-3', sellerId: 'seller-3', name: 'Campus Stationery & Books', description: 'Curated exam stationery, project files, highlighters and calculators', rating: 4.9, totalSales: 5120, isApproved: true, contactEmail: 'stationery@campuscart.ai', phone: '+91 98765 43212', campusLocation: 'Central Library Block A' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'student-1',
    name: 'Aarav Sharma',
    email: 'aarav.cse@campus.edu',
    phone: '+91 91234 56780',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 2500,
    profile: {
      college: 'National Institute of Technology',
      course: 'B.Tech Computer Science & Eng.',
      year: 2,
      semester: 3,
      hostelStatus: 'hostel',
      hostelRoom: 'Aryabhatta Hostel, Room 314',
      budgetPreference: 3500,
      preferredCategories: ['cat-cse', 'cat-electronics', 'cat-hostel']
    },
    addresses: [
      {
        id: 'addr-1',
        label: 'Hostel Room',
        fullName: 'Aarav Sharma',
        phone: '+91 91234 56780',
        campusName: 'NIT Campus',
        addressLine1: 'Aryabhatta Hostel, 3rd Floor, Room 314',
        addressLine2: 'Near North Mess',
        city: 'Bengaluru',
        pincode: '560064',
        isDefault: true
      }
    ]
  },
  {
    id: 'student-2',
    name: 'Priya Patel',
    email: 'priya.ece@campus.edu',
    phone: '+91 91234 56781',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 1800,
    profile: {
      college: 'Delhi Technological University',
      course: 'B.Tech Electronics & Comm.',
      year: 1,
      semester: 1,
      hostelStatus: 'hostel',
      hostelRoom: 'Kalpana Chawla Hall, Room 108',
      budgetPreference: 3000
    },
    addresses: [
      {
        id: 'addr-2',
        label: 'Girls Hostel',
        fullName: 'Priya Patel',
        phone: '+91 91234 56781',
        campusName: 'DTU Main Campus',
        addressLine1: 'Kalpana Chawla Hostel, Wing B',
        city: 'New Delhi',
        pincode: '110042',
        isDefault: true
      }
    ]
  },
  {
    id: 'student-3',
    name: 'Rohan Mehta',
    email: 'rohan.bca@campus.edu',
    phone: '+91 91234 56782',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 3200,
    profile: {
      college: 'Symbiosis College of Arts & Commerce',
      course: 'Bachelor of Computer Applications (BCA)',
      year: 3,
      semester: 5,
      hostelStatus: 'day_scholar',
      budgetPreference: 2000
    }
  },
  {
    id: 'student-4',
    name: 'Sneha Rao',
    email: 'sneha.mba@campus.edu',
    phone: '+91 91234 56783',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 4000,
    profile: {
      college: 'Indian Institute of Management',
      course: 'MBA General Management',
      year: 1,
      semester: 2,
      hostelStatus: 'hostel',
      budgetPreference: 5000
    }
  },
  {
    id: 'student-5',
    name: 'Kabir Verma',
    email: 'kabir.mech@campus.edu',
    phone: '+91 91234 56784',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    demoWalletBalance: 1200,
    profile: {
      college: 'IIT Roorkee',
      course: 'B.Tech Mechanical Eng.',
      year: 4,
      semester: 7,
      hostelStatus: 'hostel',
      budgetPreference: 2500
    }
  },
  {
    id: 'seller-1',
    name: 'Vikram Joshi',
    email: 'seller.tech@campuscart.ai',
    phone: '+91 98765 43210',
    role: 'seller',
    sellerStoreId: 'store-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'seller-2',
    name: 'Meenakshi Iyer',
    email: 'seller.living@campuscart.ai',
    phone: '+91 98765 43211',
    role: 'seller',
    sellerStoreId: 'store-2',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'seller-3',
    name: 'Sunil Aggarwal',
    email: 'seller.stationery@campuscart.ai',
    phone: '+91 98765 43212',
    role: 'seller',
    sellerStoreId: 'store-3',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-1',
    name: 'CampusCart Admin',
    email: 'campus.admin@campuscart.ai',
    phone: '+91 99999 88888',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'STUDENT50', discountType: 'fixed', discountAmount: 50, minOrder: 299, description: 'Flat ₹50 OFF for all students on orders over ₹299', isActive: true, expiryDate: '2026-12-31' },
  { code: 'WELCOME100', discountType: 'fixed', discountAmount: 100, minOrder: 599, description: 'Welcome ₹100 OFF on your first campus order above ₹599', isActive: true, expiryDate: '2026-12-31' },
  { code: 'CAMPUS10', discountType: 'percentage', discountAmount: 10, minOrder: 499, maxDiscount: 250, description: '10% OFF on all campus orders up to ₹250', isActive: true, expiryDate: '2026-12-31' },
  { code: 'EXAM50', discountType: 'fixed', discountAmount: 50, minOrder: 350, description: 'Flat ₹50 OFF on Exam Stationery & Study Supplies', isActive: true, expiryDate: '2026-12-31' },
  { code: 'HOSTEL100', discountType: 'fixed', discountAmount: 100, minOrder: 999, description: 'Flat ₹100 OFF on Hostel Starter & Living Bundles', isActive: true, expiryDate: '2026-12-31' }
];

export const INITIAL_STUDENT_KITS: StudentKit[] = [
  {
    id: 'kit-hostel',
    title: 'Hostel Starter Kit',
    slug: 'hostel-starter-kit',
    context: 'hostel_student',
    tagline: 'Everything you need to survive & thrive in college hostel',
    description: 'Bedsheet, ergonomic pillow, heavy duty lock, study lamp, extension board, laundry bag & hangers curated for college hostel rooms.',
    estimatedPrice: 3200,
    discountedPrice: 2499,
    badge: 'Best Seller for Freshers',
    iconName: 'Home',
    itemIds: [
      { productId: 'p-hostel-bedsheet', quantity: 1, isCore: true },
      { productId: 'p-hostel-pillow', quantity: 1, isCore: true },
      { productId: 'p-hostel-lock', quantity: 1, isCore: true },
      { productId: 'p-hostel-hangers', quantity: 1, isCore: true },
      { productId: 'p-elec-lamp', quantity: 1, isCore: false },
      { productId: 'p-elec-extension', quantity: 1, isCore: true },
      { productId: 'p-hostel-laundry', quantity: 1, isCore: true },
      { productId: 'p-care-toiletrykit', quantity: 1, isCore: false }
    ]
  },
  {
    id: 'kit-exam',
    title: 'Exam Essentials Kit',
    slug: 'exam-essentials-kit',
    context: 'exam_preparation',
    tagline: 'Conquer your semester exams with zero distractions',
    description: 'Classmate notebooks, Reynolds ball pens, mild highlighters, Casio scientific calculator, sticky tabs and clear exam pad.',
    estimatedPrice: 1450,
    discountedPrice: 1199,
    badge: 'Semester Exam Special',
    iconName: 'BookOpen',
    itemIds: [
      { productId: 'p-stat-notebooks', quantity: 2, isCore: true },
      { productId: 'p-stat-pens', quantity: 1, isCore: true },
      { productId: 'p-stat-highlighter', quantity: 1, isCore: true },
      { productId: 'p-stat-calculator', quantity: 1, isCore: true },
      { productId: 'p-stat-stickynotes', quantity: 1, isCore: false },
      { productId: 'p-stat-folder', quantity: 1, isCore: false }
    ]
  },
  {
    id: 'kit-cse',
    title: 'Coding & CSE Launch Kit',
    slug: 'coding-cse-kit',
    context: 'cse_lab_project',
    tagline: 'Ergonomic & reliable dev gear for long programming sessions',
    description: 'Aluminum laptop stand, Logitech wireless mouse, 64GB ultra USB drive, 4-port USB 3.0 hub and braided type-C cable.',
    estimatedPrice: 2450,
    discountedPrice: 1999,
    badge: 'Engineers Choice',
    iconName: 'Cpu',
    itemIds: [
      { productId: 'p-elec-laptopstand', quantity: 1, isCore: true },
      { productId: 'p-elec-mouse', quantity: 1, isCore: true },
      { productId: 'p-elec-pendrive', quantity: 1, isCore: true },
      { productId: 'p-elec-usbhub', quantity: 1, isCore: true },
      { productId: 'p-stat-notebooks', quantity: 1, isCore: false }
    ]
  },
  {
    id: 'kit-project',
    title: 'Hardware & IoT Project Kit',
    slug: 'engineering-project-kit',
    context: 'project_development',
    tagline: 'Lab exam & capstone project components ready in 1 box',
    description: 'Arduino Uno R3 board, solderless breadboard, 65pcs jumper wires, basic sensor module pack and mini wire cutter.',
    estimatedPrice: 1850,
    discountedPrice: 1449,
    badge: 'Hardware Verified',
    iconName: 'Wrench',
    itemIds: [
      { productId: 'p-cse-arduino', quantity: 1, isCore: true },
      { productId: 'p-cse-breadboard', quantity: 1, isCore: true },
      { productId: 'p-cse-jumpers', quantity: 1, isCore: true },
      { productId: 'p-cse-sensors', quantity: 1, isCore: true },
      { productId: 'p-stat-folder', quantity: 1, isCore: false }
    ]
  },
  {
    id: 'kit-presentation',
    title: 'College Presentation Kit',
    slug: 'college-presentation-kit',
    context: 'college_presentation',
    tagline: 'Make your seminar or defense smooth, sharp & professional',
    description: 'Wireless wireless laser presenter, executive document folder, Parker rollerball pen, and SanDisk Type-C OTG flash drive.',
    estimatedPrice: 1250,
    discountedPrice: 899,
    badge: 'Under ₹1,000',
    iconName: 'Presentation',
    itemIds: [
      { productId: 'p-elec-pendrive', quantity: 1, isCore: true },
      { productId: 'p-stat-folder', quantity: 1, isCore: true },
      { productId: 'p-stat-pens', quantity: 1, isCore: true },
      { productId: 'p-stat-stickynotes', quantity: 1, isCore: true }
    ]
  },
  {
    id: 'kit-trip',
    title: 'College 3-Day Trip Pack',
    slug: 'college-trip-pack',
    context: 'college_trip',
    tagline: 'Travel-ready lightweight gear for industrial visits & weekend trips',
    description: 'Lightweight water-resistant backpack, stainless steel thermal bottle, 10,000mAh power bank, travel toiletry pouch & compact umbrella.',
    estimatedPrice: 2800,
    discountedPrice: 2199,
    badge: 'Travel Ready',
    iconName: 'Compass',
    itemIds: [
      { productId: 'p-travel-backpack', quantity: 1, isCore: true },
      { productId: 'p-travel-bottle', quantity: 1, isCore: true },
      { productId: 'p-elec-powerbank', quantity: 1, isCore: true },
      { productId: 'p-travel-pouch', quantity: 1, isCore: true },
      { productId: 'p-travel-umbrella', quantity: 1, isCore: false }
    ]
  }
];
