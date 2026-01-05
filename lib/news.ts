// lib/news.ts
export type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  summary?: string;
  rewritten?: string;
  solanaRelated?: boolean;
};

type Source = {
  name: string;
  feed: string;
};

const sources: Source[] = [
  { name: 'Decrypt', feed: 'https://decrypt.co/feed' },
  { name: 'Crypto News', feed: 'https://crypto.news/tag/solana/feed' },
  { name: 'Solana News', feed: 'https://solana.com/news/feed' },
];

let cachedArticles: NewsArticle[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTextFromHtml(html: string): string {
  // Try to grab content inside <article> if present
  const articleMatch = html.match(/<article[^>]*>[\s\S]*?<\/article>/i);
  const content = articleMatch ? articleMatch[0] : html;
  // Remove script/style tags crudely
  const withoutScripts = content.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                              .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  return stripHtml(withoutScripts);
}

async function fetchArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const html = await res.text();
    return extractTextFromHtml(html);
  } catch {
    return '';
  }
}

async function summarizeWithAI(text: string): Promise<string> {
  const apiKey = process.env.AI_SDK_API_KEY;
  if (!apiKey) {
    // Fallback: return a short excerpt if AI key is not configured
    const t = text || '';
    return t.length > 500 ? t.substring(0, 500) + '...' : t;
  }
  try {
    const res = await fetch('https://ai-sdk.dev/api/v1/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, style: 'concise' }),
    });
    if (!res.ok) {
      const t = text || '';
      return t.length > 500 ? t.substring(0, 500) + '...' : t;
    }
    const data = await res.json();
    return data.summary ?? text;
  } catch {
    const t = text || '';
    return t.length > 500 ? t.substring(0, 500) + '...' : t;
  }
}

async function parseRss(xml: string): Promise<Array<{ title: string; url: string; publishedAt?: string }>> {
  const items: Array<{ title: string; url: string; publishedAt?: string }> = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const t = (block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] ?? '';
    const l = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] ?? '';
    const p = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1];
    if (t && l) {
      items.push({ title: t, url: l, publishedAt: p });
    }
  }
  return items;
}

export async function getSolanaNews(): Promise<NewsArticle[]> {
  const now = Date.now();
  if (cachedArticles && (now - cacheTime) < CACHE_TTL) {
    return cachedArticles;
  }
  const all: NewsArticle[] = [];
  for (const s of sources) {
    try {
      const resp = await fetch(s.feed);
      if (!resp.ok) continue;
      const text = await resp.text();
      // Try RSS parse first
      let items = await parseRss(text);
      if (!items.length) {
        // Fallback: naive extraction from HTML pages (best-effort)
        // Try a few known Solana pages for a simple list (not comprehensive)
        const fallbackUrls = [
          'https://decrypt.co/search?q=solana',
          'https://crypto.news/tag/solana/',
          'https://solana.com/news',
        ];
        for (const url of fallbackUrls) {
          try {
            const page = await fetch(url);
            if (!page.ok) continue;
            const html = await page.text();
            // Simple heuristics: find anchors with Solana in title text
            const anchorMatches = [...html.matchAll(/<a[^>]+href=['"]([^'" ]+)['"][^>]*>([^<]+)<\/a>/gi)];
            for (const m of anchorMatches) {
              const href = m[1]; const anchorText = m[2] ?? '';
              if (!href || !anchorText) continue;
              if (!anchorText.toLowerCase().includes('solana')) continue;
              const article: NewsArticle = {
                id: href,
                title: anchorText,
                url: href.startsWith('http') ? href : url + href,
                source: s.name,
                publishedAt: new Date().toISOString(),
                summary: undefined,
                rewritten: undefined,
                solanaRelated: true,
              };
              if (!all.find(a => a.url === article.url)) {
                all.push(article);
              }
              if (all.length >= 20) break;
            }
            if (all.length >= 20) break;
          } catch {
            // ignore
          }
        }
      } else {
        for (const it of items) {
          if (!it.title || !it.url) continue;
          const title = it.title;
          if (!title.toLowerCase().includes('solana')) continue; // filter Solana mentions
          const textContent = await fetchArticleText(it.url);
          if (!textContent) continue;
          const summary = await summarizeWithAI(textContent);
          const article: NewsArticle = {
            id: it.url,
            title,
            url: it.url,
            source: s.name,
            publishedAt: it.publishedAt ?? new Date().toISOString(),
            summary,
            rewritten: undefined,
            solanaRelated: true,
          };
          if (!all.find(a => a.url === article.url)) {
            all.push(article);
          }
          if (all.length >= 20) break;
        }
      }
    } catch {
      // ignore errors from individual sources
    }
    if (all.length >= 20) break;
  }

  // Deduplicate preserving order
  const seen = new Set<string>();
  const dedup: NewsArticle[] = [];
  for (const a of all) {
    if (!seen.has(a.url)) { seen.add(a.url); dedup.push(a); }
  }

  cachedArticles = dedup;
  cacheTime = Date.now();
  return dedup;
}
