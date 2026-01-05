// pages/api/news/solana.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSolanaNews, NewsArticle } from '../../../lib/news';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const articles: NewsArticle[] = await getSolanaNews();
    res.status(200).json({ articles });
  } catch (err) {
    console.error('News API error', err);
    res.status(500).json({ error: 'Failed to fetch Solana news' });
  }
}
