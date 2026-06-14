/**
 * Search index builder.
 * Combines solutions + static pages into a single searchable array.
 * Used by client-side fuse.js search (Cmd+K palette).
 */

import type { SearchIndexItem, SearchableSolution, SearchablePage, Solution } from './types';
import { getAllSolutions } from './data';

const STATIC_PAGES: SearchablePage[] = [
  { id: -1, title: '首页', href: '/', excerpt: '广州双泓科技官网首页' },
  { id: -2, title: '多模态交互', href: '/multimodal', excerpt: '多模态交互解决方案' },
  { id: -3, title: '智能AI应用', href: '/ai-application', excerpt: 'AI 智能体应用解决方案' },
  { id: -4, title: '关于双泓', href: '/about', excerpt: '关于双泓科技' },
  { id: -5, title: '联系我们', href: '/about#contact', excerpt: '联系双泓科技' },
  { id: -6, title: '登录', href: '/login', excerpt: '账号登录(占位)' },
];

export async function buildSearchIndex(): Promise<SearchIndexItem[]> {
  const solutions = await getAllSolutions();

  const solutionItems: SearchableSolution[] = solutions.map((s: Solution) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    href: `/cases/${s.slug}`,
    tags: s.tags ?? [],
  }));

  return [
    ...solutionItems.map((s) => ({ type: 'solution' as const, ...s })),
    ...STATIC_PAGES.map((p) => ({ type: 'page' as const, ...p })),
  ];
}
