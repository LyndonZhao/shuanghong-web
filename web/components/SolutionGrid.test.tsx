import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SolutionGrid } from './SolutionGrid';
import type { Solution } from '@/lib/types';

// next/link is already a passthrough in jsdom; we don't need to mock it.

const baseSolution: Solution = {
  id: 1,
  documentId: 'doc-1',
  slug: 'manufacturing',
  title: '制造业 AI 落地服务',
  description: '为制造企业提供 AI 视觉质检与排产优化。',
  category: 'ai_application',
  order: 10,
};

describe('SolutionGrid', () => {
  it('renders one card per solution with title and description', () => {
    const { container } = render(
      <SolutionGrid
        solutions={[
          baseSolution,
          { ...baseSolution, id: 2, slug: 'quotation', title: '智能报价' },
        ]}
      />,
    );

    expect(screen.getByText('制造业 AI 落地服务')).toBeInTheDocument();
    expect(screen.getByText('智能报价')).toBeInTheDocument();
    expect(container.querySelectorAll('a[href^="/cases/"]')).toHaveLength(2);
    expect(screen.getAllByText(/AI 应用/)).toHaveLength(2);
  });

  it('shows the empty-state message when given an empty list', () => {
    render(<SolutionGrid solutions={[]} />);
    expect(screen.getByText('暂无解决方案数据')).toBeInTheDocument();
  });

  it('hides category badges when showCategory=false', () => {
    render(<SolutionGrid solutions={[baseSolution]} showCategory={false} />);
    expect(screen.queryByText('AI 应用')).not.toBeInTheDocument();
  });

  it('filters by category prop', () => {
    const multimodal: Solution = {
      ...baseSolution,
      id: 3,
      slug: 'drawing-review',
      title: '图纸审核',
      category: 'multimodal',
    };
    render(<SolutionGrid solutions={[baseSolution, multimodal]} category="multimodal" />);
    expect(screen.getByText('图纸审核')).toBeInTheDocument();
    expect(screen.queryByText('制造业 AI 落地服务')).not.toBeInTheDocument();
  });

  it('falls back to a neutral badge for unknown category values', () => {
    const weird: Solution = { ...baseSolution, category: 'other' as Solution['category'] };
    render(<SolutionGrid solutions={[weird]} />);
    expect(screen.getByText('other')).toBeInTheDocument();
  });
});

// Suppress unused import warning when next/link stub resolution changes
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
