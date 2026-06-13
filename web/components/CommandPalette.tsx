'use client';

import Fuse from 'fuse.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';

interface CommandPaletteProps {
  items: SearchIndexItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['title', 'description', 'excerpt', 'tags'],
        threshold: 0.3,
        includeScore: true,
      }),
    [items],
  );

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    return fuse.search(query).map((r) => r.item).slice(0, 8);
  }, [query, fuse, items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索方案、页面... (按 Esc 关闭)"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              没有匹配的结果
            </li>
          ) : (
            results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-brand-tint transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.type === 'solution' ? '方案' : '页面'}
                    </span>
                  </div>
                  {(item.type === 'solution' && item.description) || (item.type === 'page' && item.excerpt) ? (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {item.type === 'solution' ? item.description : item.excerpt}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-muted-foreground flex items-center gap-3">
          <span>↑↓ 选择</span>
          <span>↵ 打开</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
