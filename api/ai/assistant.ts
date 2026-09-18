import { generateStudentKitRecommendation } from '../../server/gemini.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { query, budget } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'Please describe what you need for college.' });
  }

  try {
    console.log(`[CampusCart AI Vercel] Assistant invoked: "${query}", budget: ${budget ?? 'auto'}`);
    const recommendation = await generateStudentKitRecommendation(query, budget ? Number(budget) : undefined);
    return res.status(200).json(recommendation);
  } catch (e: any) {
    console.error('[CampusCart AI Vercel] Assistant handler error:', e);
    return res.status(500).json({
      error: 'Failed to process student request',
      details: e?.message || 'Serverless execution error'
    });
  }
}
