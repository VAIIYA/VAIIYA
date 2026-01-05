// pages/news.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { NewsArticle } from '../lib/news';

type Article = NewsArticle & { key?: string };

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/news/solana')
      .then((r) => r.json())
      .then((data) => {
        const items: Article[] = (data?.articles ?? []) as Article[];
        // assign stable keys
        items.forEach((a, idx) => (a.key = a.url || String(idx)));
        setArticles(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = articles.filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (a.title ?? '').toLowerCase().includes(q) ||
      (a.source ?? '').toLowerCase().includes(q) ||
      (a.summary ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      <Head>
        <title>Solana News — VAIIYA</title>
      </Head>
      <h1>Solana News</h1>
      <p>Aggregated Solana articles from Decrypt, Crypto News, and Solana News. AI-generated summaries are included when available.</p>
      <div style={{ margin: '1rem 0' }}>
        <input
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', maxWidth: 600 }}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No articles found for this query.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map((a) => (
            <li key={a.url} style={{ marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <a href={a.url} target="_blank" rel="noopener" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {a.title}
              </a>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {a.source} • {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}
              </div>
              {a.summary && (
                <p style={{ marginTop: 6 }}>{a.summary}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
