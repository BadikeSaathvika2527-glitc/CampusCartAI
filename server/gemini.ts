import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';
import type { AIContextResponse, AIProductRecommendation, Product } from '../src/types.ts';

let aiClient: GoogleGenAI | null = null;

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  );
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.info('[CampusCart AI] No Gemini API key detected in environment. Checked: GEMINI_API_KEY, GOOGLE_API_KEY, GOOGLE_GENAI_API_KEY. Using verified campus student kit engine.');
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey
      });
      console.info(`[CampusCart AI] GoogleGenAI client initialized successfully (key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}).`);
    } catch (e: any) {
      console.error('[CampusCart AI] Failed to initialize GoogleGenAI client:', e.message);
      aiClient = null;
    }
  }
  return aiClient;
}

// Student Context Detection Rule Engine (Fallback & Augmenter)
export function parseStudentContext(query: string, userBudget?: number): {
  context: string;
  contextTitle: string;
  contextDescription: string;
  targetCategoryIds: string[];
  suggestedTags: string[];
  detectedBudget?: number;
} {
  const q = query.toLowerCase();

  // Extract budget from text if present (e.g., "under 3000", "under ₹500", "for 1500", "budget 2000")
  let budget = userBudget;
  if (!budget) {
    const budgetMatch = q.match(/(?:under|below|budget|within|approx|around|for)?\s*(?:₹|rs\.?|inr)?\s*(\d{3,5})/i);
    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseInt(budgetMatch[1], 10);
      if (parsed >= 100 && parsed <= 50000) {
        budget = parsed;
      }
    }
  }

  // Detect student scenarios
  if (q.includes('hostel') || q.includes('room') || q.includes('dorm') || q.includes('fresher') || q.includes('living')) {
    return {
      context: 'hostel_student',
      contextTitle: 'Hostel Starter & Dorm Setup',
      contextDescription: 'Essential room living, bedding, safety locks, power access, and hygiene gear for campus hostel life.',
      targetCategoryIds: ['cat-hostel', 'cat-electronics', 'cat-care'],
      suggestedTags: ['bedsheet', 'pillow', 'lock', 'hangers', 'study lamp', 'extension board', 'laundry', 'toiletry'],
      detectedBudget: budget
    };
  }

  if (q.includes('exam') || q.includes('semester') || q.includes('midterm') || q.includes('study') || q.includes('test') || q.includes('revision')) {
    return {
      context: 'exam_preparation',
      contextTitle: 'Semester Exam Essentials',
      contextDescription: 'High-yield exam stationery, scientific calculators, notebooks, pastel markers, and exam pads.',
      targetCategoryIds: ['cat-college', 'cat-electronics'],
      suggestedTags: ['notebook', 'pen', 'calculator', 'highlighter', 'sticky notes', 'exampad', 'lamp'],
      detectedBudget: budget
    };
  }

  if (q.includes('cse') || q.includes('coding') || q.includes('laptop') || q.includes('software') || q.includes('programming') || q.includes('dev')) {
    return {
      context: 'cse_lab_project',
      contextTitle: 'Coding & CSE Lab Gear',
      contextDescription: 'Ergonomic laptop stands, wireless mice, fast USB drives, USB hubs, and essential cables for engineering coders.',
      targetCategoryIds: ['cat-electronics', 'cat-college', 'cat-travel'],
      suggestedTags: ['laptop stand', 'mouse', 'pendrive', 'usb hub', 'notebook', 'powerbank'],
      detectedBudget: budget
    };
  }

  if (q.includes('project') || q.includes('hardware') || q.includes('arduino') || q.includes('iot') || q.includes('sensor') || q.includes('circuit') || q.includes('robot')) {
    return {
      context: 'project_development',
      contextTitle: 'Hardware & IoT Engineering Kit',
      contextDescription: 'Microcontroller boards, solderless breadboards, jumper wires, sensor arrays, and circuit test probes.',
      targetCategoryIds: ['cat-cse', 'cat-electronics'],
      suggestedTags: ['arduino', 'breadboard', 'jumper wires', 'sensors', 'esp32', 'multimeter'],
      detectedBudget: budget
    };
  }

  if (q.includes('presentation') || q.includes('seminar') || q.includes('viva') || q.includes('defense') || q.includes('interview')) {
    return {
      context: 'college_presentation',
      contextTitle: 'College Presentation & Defense Kit',
      contextDescription: 'Professional document folders, USB presentation drives, smooth pens, and note tags for campus presentations.',
      targetCategoryIds: ['cat-college', 'cat-electronics'],
      suggestedTags: ['folder', 'pendrive', 'pen', 'sticky notes'],
      detectedBudget: budget
    };
  }

  if (q.includes('trip') || q.includes('travel') || q.includes('tour') || q.includes('industrial visit') || q.includes('trek') || q.includes('vacation')) {
    return {
      context: 'college_trip',
      contextTitle: 'Campus 3-Day Travel & Trip Pack',
      contextDescription: 'Water-resistant college backpacks, thermal bottles, 10,000mAh power banks, umbrellas, and toiletry bags.',
      targetCategoryIds: ['cat-travel', 'cat-electronics', 'cat-care'],
      suggestedTags: ['backpack', 'bottle', 'powerbank', 'umbrella', 'pouch', 'toiletry'],
      detectedBudget: budget
    };
  }

  // Default campus essentials
  return {
    context: 'daily_essentials',
    contextTitle: 'Smart Student Essentials',
    contextDescription: 'Tailored study, tech, and dorm utilities optimized for student budget and campus convenience.',
    targetCategoryIds: ['cat-college', 'cat-electronics', 'cat-hostel'],
    suggestedTags: ['notebook', 'pen', 'pendrive', 'water bottle', 'extension board'],
    detectedBudget: budget
  };
}

export async function generateStudentKitRecommendation(
  query: string,
  userBudget?: number
): Promise<AIContextResponse> {
  const contextInfo = parseStudentContext(query, userBudget);
  const targetBudget = contextInfo.detectedBudget || userBudget || 3000;
  const allAvailableProducts = db.getProducts({ inStockOnly: false });

  try {
    // Try Gemini AI if available
    const client = getGeminiClient();
    let aiMatchedProductIds: { productId: string; quantity: number; why: string; isCore: boolean }[] = [];
    let usedFallback = !client;

    if (client) {
      try {
        // Pre-filter catalog to the most relevant candidate products for this context to keep the prompt concise & fast
        const relevantProducts = allAvailableProducts.filter(p => {
          if (contextInfo.targetCategoryIds.includes(p.categoryId)) return true;
          if (p.tags && p.tags.some(t => contextInfo.suggestedTags.includes(t))) return true;
          if (p.isHostelEssential && contextInfo.context === 'hostel_student') return true;
          if (p.isExamEssential && contextInfo.context === 'exam_preparation') return true;
          if (p.isCseEssential && (contextInfo.context === 'cse_lab_project' || contextInfo.context === 'project_development')) return true;
          if (p.isTripEssential && contextInfo.context === 'college_trip') return true;
          return false;
        });

        const catalogToSend = (relevantProducts.length >= 6 ? relevantProducts : allAvailableProducts).slice(0, 18);

        const prompt = `You are CampusCart AI's Student Context Engine for college students.
A student requested: "${query}".
Budget: ₹${targetBudget}.
Context detected: ${contextInfo.contextTitle} (${contextInfo.contextDescription}).

Available catalog of products currently in the database:
${JSON.stringify(
  catalogToSend.map(p => ({
    id: p.id,
    name: p.name,
    category: p.categoryName,
    price: p.price,
    stock: p.stock
  }))
)}

Select the most practical and suitable items from the catalog above to build a complete student kit for this situation.
IMPORTANT:
1. Only choose product IDs that exist in the catalog above. Do NOT invent IDs or products.
2. Prioritize items essential for this specific student context.
3. Aim to stay within or close to the budget of ₹${targetBudget}.
4. Return a JSON response with array of selections.

Return JSON in this format:
{
  "contextSummary": "One sentence explaining how this kit serves the student's need",
  "items": [
    {
      "productId": "id from catalog",
      "quantity": 1,
      "why": "Specific reason why a college student needs this",
      "isCore": true
    }
  ]
}`;

        // Attempt generation with 10s timeout
        const callModel = async (modelName: string) => {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('AI request timeout')), 10000);
          });

          const generatePromise = client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
              maxOutputTokens: 1200
            }
          });

          return Promise.race([generatePromise, timeoutPromise]);
        };

        let response: any = null;
        try {
          response = await callModel('gemini-3.6-flash');
        } catch (firstErr: any) {
          const errInfo = firstErr?.status || firstErr?.message || 'timeout/busy';
          console.warn('[CampusCart AI] gemini-3.6-flash note (' + errInfo + '), trying gemini-3.8-flash...');
          try {
            response = await callModel('gemini-3.8-flash');
          } catch (secondErr: any) {
            const err2Info = secondErr?.status || secondErr?.message || 'timeout/busy';
            console.warn('[CampusCart AI] gemini-3.8-flash note (' + err2Info + '). Safe student kit fallback engine activated.');
            response = null;
          }
        }

        if (response && response.text) {
          let responseText = response.text.trim();
          if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          }
          const parsed = JSON.parse(responseText);
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            aiMatchedProductIds = parsed.items.filter((item: any) =>
              allAvailableProducts.some(p => p.id === item.productId)
            );
          }
        }
      } catch (_err) {
        // AI service temporarily busy or unavailable; fallback is safely activated below
        usedFallback = true;
      }
    }

    // Fallback / Deterministic assembly if AI was unavailable, timed out, or produced empty
    if (aiMatchedProductIds.length === 0) {
      usedFallback = true;
      aiMatchedProductIds = buildDeterministicKit(contextInfo.context, allAvailableProducts);
    }

  // Build recommendation list with actual products from database
  let recommendations: AIProductRecommendation[] = [];
  const selectedProductIds = new Set<string>();

  for (const item of aiMatchedProductIds) {
    const product = allAvailableProducts.find(p => p.id === item.productId);
    if (!product) continue;

    selectedProductIds.add(product.id);

    // Find smart alternatives if product is out of stock or high priced
    const alternatives = allAvailableProducts.filter(
      p => p.id !== product.id && p.categoryId === product.categoryId && (p.stock ?? 0) > 0
    ).slice(0, 2);

    recommendations.push({
      product,
      quantity: item.quantity || 1,
      whyRecommended: item.why || `Essential item for ${contextInfo.contextTitle}`,
      isCore: item.isCore !== false,
      alternativeOptions: alternatives.length > 0 ? alternatives : undefined
    });
  }

  // Double check recommendations are not empty
  if (recommendations.length === 0) {
    const fallbackIds = buildDeterministicKit(contextInfo.context, allAvailableProducts);
    for (const item of fallbackIds) {
      const product = allAvailableProducts.find(p => p.id === item.productId);
      if (!product) continue;
      recommendations.push({
        product,
        quantity: item.quantity || 1,
        whyRecommended: item.why,
        isCore: item.isCore
      });
    }
  }

  // Budget Optimization
  let originalTotal = 0;
  let discountTotal = 0;
  let subtotal = 0;

  for (const rec of recommendations) {
    const origPrice = rec.product.originalPrice && rec.product.originalPrice >= rec.product.price
      ? rec.product.originalPrice
      : Math.round(rec.product.price * 1.25);
    originalTotal += origPrice * rec.quantity;
    discountTotal += (origPrice - rec.product.price) * rec.quantity;
    subtotal += rec.product.price * rec.quantity;
  }

  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const finalTotal = subtotal + deliveryFee;
  const isWithinBudget = finalTotal <= targetBudget;

  const suggestedAdjustments: string[] = [];
  let budgetMessage = '';

  if (isWithinBudget) {
    const savings = originalTotal - finalTotal;
    budgetMessage = `Great news! This smart kit fits perfectly within your ₹${targetBudget.toLocaleString('en-IN')} budget with ₹${savings.toLocaleString('en-IN')} in total savings.`;
  } else {
    const excess = finalTotal - targetBudget;
    budgetMessage = `This complete kit comes to ₹${finalTotal.toLocaleString('en-IN')} (₹${excess.toLocaleString('en-IN')} over your ₹${targetBudget.toLocaleString('en-IN')} budget). You can customize or deselect optional items below to fit your exact budget.`;

    // Find non-core or high priced items to suggest removing or swapping
    const nonCore = recommendations.filter(r => !r.isCore);
    if (nonCore.length > 0) {
      suggestedAdjustments.push(`Remove optional item: "${nonCore[0].product.name}" to save ₹${(nonCore[0].product.price * nonCore[0].quantity).toLocaleString('en-IN')}`);
    }
    // Check for lower priced alternative
    const expensive = recommendations.find(r => r.product.price > 600 && r.alternativeOptions && r.alternativeOptions.length > 0);
    if (expensive && expensive.alternativeOptions) {
      const cheaper = expensive.alternativeOptions.find(a => a.price < expensive.product.price);
      if (cheaper) {
        const diff = expensive.product.price - cheaper.price;
        suggestedAdjustments.push(`Switch to "${cheaper.name}" to save ₹${diff.toLocaleString('en-IN')}`);
      }
    }
  }

    return {
      context: contextInfo.context,
      contextTitle: contextInfo.contextTitle,
      contextDescription: contextInfo.contextDescription,
      detectedBudget: targetBudget,
      recommendations,
      originalTotal,
      discountTotal,
      deliveryFee,
      finalTotal,
      isWithinBudget,
      budgetMessage,
      suggestedAdjustments: suggestedAdjustments.length > 0 ? suggestedAdjustments : undefined,
      isFallback: usedFallback
    };
  } catch (error) {
    console.info('Safe fallback engine activated for student context:', contextInfo.contextTitle);
    const fallbackIds = buildDeterministicKit(contextInfo.context, allAvailableProducts);
    const recs: AIProductRecommendation[] = [];
    let sub = 0;
    let orig = 0;

    for (const item of fallbackIds) {
      const p = allAvailableProducts.find(prod => prod.id === item.productId);
      if (!p) continue;
      const o = (p.originalPrice && p.originalPrice >= p.price) ? p.originalPrice : Math.round(p.price * 1.25);
      sub += p.price * (item.quantity || 1);
      orig += o * (item.quantity || 1);
      recs.push({
        product: p,
        quantity: item.quantity || 1,
        whyRecommended: item.why,
        isCore: item.isCore
      });
    }

    const fee = sub >= 499 ? 0 : 49;
    return {
      context: contextInfo.context,
      contextTitle: contextInfo.contextTitle,
      contextDescription: contextInfo.contextDescription,
      detectedBudget: targetBudget,
      recommendations: recs,
      originalTotal: orig,
      discountTotal: orig - sub,
      deliveryFee: fee,
      finalTotal: sub + fee,
      isWithinBudget: (sub + fee) <= targetBudget,
      budgetMessage: `Campus verified essential kit prepared for ${contextInfo.contextTitle}.`,
      isFallback: true
    };
  }
}

function buildDeterministicKit(context: string, allProducts: Product[]): { productId: string; quantity: number; why: string; isCore: boolean }[] {
  const get = (id: string, qty: number, why: string, isCore = true) => ({
    productId: id,
    quantity: qty,
    why,
    isCore
  });

  switch (context) {
    case 'hostel_student':
      return [
        get('p-hostel-bedsheet', 1, 'Standard single cot cotton bedsheet fitted for hostel beds', true),
        get('p-hostel-pillow', 1, 'Ergonomic neck support pillow for restful sleep in dorms', true),
        get('p-hostel-lock', 1, '7-lever brass lock for your hostel room door and almirah locker', true),
        get('p-hostel-hangers', 1, 'Pack of 12 anti-slip hangers to keep formal clothes wrinkle-free', true),
        get('p-elec-extension', 1, 'Surge-protected 4-socket board for laptop, phone, and lamp charging', true),
        get('p-hostel-laundry', 1, 'Pop-up ventilated mesh laundry bag for hostel laundry collection', true),
        get('p-elec-lamp', 1, 'Rechargeable LED study lamp for late night studying without disturbing roomie', false),
        get('p-care-toiletrykit', 1, 'Hanging toiletry kit with hooks for hostel common washrooms', false)
      ];

    case 'exam_preparation':
      return [
        get('p-stat-notebooks', 2, '300-page 6-subject spiral notebooks for formula sheets and lecture revision', true),
        get('p-stat-pens', 1, 'Smooth 0.7mm blue pens for rapid exam answer writing', true),
        get('p-stat-highlighter', 1, 'Pastel highlighters for marking syllabus priorities and key diagrams', true),
        get('p-stat-calculator', 1, 'University exam-approved scientific calculator with natural textbook display', true),
        get('p-stat-stickynotes', 1, 'Self-adhesive sticky notes & page flags for revision bookmarks', false),
        get('p-stat-exampad', 1, 'Transparent exam clipboard compliant with hall ticket rules', false)
      ];

    case 'cse_lab_project':
      return [
        get('p-elec-laptopstand', 1, 'Ergonomic aluminum stand to prevent neck fatigue during long coding marathons', true),
        get('p-elec-mouse', 1, 'Wireless optical mouse for fast navigation, code reviews, and IDE usage', true),
        get('p-elec-pendrive', 1, '64GB Dual Type-C & Type-A USB 3.2 drive for rapid code backups and OS boot drives', true),
        get('p-elec-usbhub', 1, '4-port USB 3.0 hub to connect dev peripherals and boards simultaneously', true),
        get('p-stat-notebooks', 1, 'Grid/ruled notebook for algorithm diagrams and pseudocode planning', false)
      ];

    case 'project_development':
      return [
        get('p-cse-arduino', 1, 'ATmega328P Arduino board for microcontroller lab experiments and capstones', true),
        get('p-cse-breadboard', 1, '830-point solderless breadboard with power rails for rapid prototyping', true),
        get('p-cse-jumpers', 1, '120-piece multi-color jumper wire bundle (M-M, M-F, F-F)', true),
        get('p-cse-sensors', 1, '37-in-1 sensor pack covering ultrasonic, motion, temperature & sound', true),
        get('p-cse-multimeter', 1, 'Digital LCD multimeter for testing circuit continuity and voltage levels', false)
      ];

    case 'college_presentation':
      return [
        get('p-stat-folder', 1, 'Expanding 13-pocket folder for resume, project reports, and evaluation sheets', true),
        get('p-elec-pendrive', 1, 'Dual USB drive with PPT slides and demo video backups ready for seminar projector', true),
        get('p-stat-pens', 1, 'Quality ball pen set for formal submission signatures and committee remarks', true),
        get('p-stat-stickynotes', 1, 'Cue note tabs for talking points and speech transitions', false)
      ];

    case 'college_trip':
      return [
        get('p-travel-backpack', 1, '30L water-resistant backpack with laptop sleeve and rain cover', true),
        get('p-travel-bottle', 1, 'Vacuum insulated flask keeping drinking water cold for 24 hours on bus rides', true),
        get('p-elec-powerbank', 1, '10,000mAh 22.5W fast-charging power bank for full battery during long travels', true),
        get('p-travel-pouch', 1, 'Double-layer cable organizer for adapters, cables, and earphones', true),
        get('p-travel-umbrella', 1, 'Auto-open windproof 3-fold compact umbrella', false)
      ];

    default:
      return [
        get('p-stat-notebooks', 1, 'Multipurpose college notebook for lecture notes', true),
        get('p-stat-pens', 1, 'Smooth writing ball pen pack', true),
        get('p-travel-bottle', 1, 'Durable insulated water bottle', true),
        get('p-elec-pendrive', 1, 'Essential storage for study materials and assignments', false)
      ];
  }
}
