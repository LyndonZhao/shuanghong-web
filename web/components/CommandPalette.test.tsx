import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';
import type { SearchIndexItem } from '@/lib/types';

const items: SearchIndexItem[] = [
  {
    type: 'solution',
    id: 1,
    title: '制造业 AI 落地',
    category: 'ai_application',
    description: '为制造业提供 AI 质检与排产',
    href: '/cases/manufacturing',
    tags: ['AI', '制造业'],
  },
  {
    type: 'solution',
    id: 2,
    title: '智能报价',
    category: 'ai_application',
    description: 'AI 辅助生成报价单',
    href: '/cases/quotation',
    tags: ['AI'],
  },
  {
    type: 'page',
    id: 3,
    title: '关于双泓',
    excerpt: '公司简介',
    href: '/about',
  },
];

describe('CommandPalette', () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing until Cmd+K (or Ctrl+K) toggles it open', () => {
    render(<CommandPalette items={items} />);
    expect(screen.queryByPlaceholderText(/搜索方案/)).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText(/搜索方案/)).toBeInTheDocument();
  });

  it('also toggles on Ctrl+K for non-mac keyboards', () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText(/搜索方案/)).toBeInTheDocument();
  });

  it('Escape closes the palette', () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText(/搜索方案/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByPlaceholderText(/搜索方案/)).not.toBeInTheDocument();
  });

  it('shows up to 8 items by default', () => {
    const many: SearchIndexItem[] = Array.from({ length: 12 }, (_, i) => ({
      type: 'solution',
      id: i,
      title: `方案 ${i}`,
      category: 'multimodal',
      description: '',
      href: `/cases/${i}`,
      tags: [],
    }));
    render(<CommandPalette items={many} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    // We list one anchor per result; ensure 8 of the 12 are visible.
    expect(screen.getAllByRole('link')).toHaveLength(8);
  });

  it('filters results by query using fuse.js', () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const input = screen.getByPlaceholderText(/搜索方案/);
    fireEvent.change(input, { target: { value: '报价' } });

    expect(screen.getByText('智能报价')).toBeInTheDocument();
    expect(screen.queryByText('制造业 AI 落地')).not.toBeInTheDocument();
  });

  it('shows the empty-state when nothing matches', () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    fireEvent.change(screen.getByPlaceholderText(/搜索方案/), {
      target: { value: 'zzzz-no-match' },
    });
    expect(screen.getByText('没有匹配的结果')).toBeInTheDocument();
  });

  it('clicking the backdrop closes the palette', () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const backdrop = document.querySelector('.absolute.inset-0.bg-black\\/40');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(screen.queryByPlaceholderText(/搜索方案/)).not.toBeInTheDocument();
  });
});
