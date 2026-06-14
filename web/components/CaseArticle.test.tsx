import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaseArticle } from './CaseArticle';
import type { Solution } from '@/lib/types';

const baseSolution: Solution = {
  id: 10,
  documentId: 'doc-1',
  title: '制造业 AI 落地服务',
  slug: 'manufacturing-ai-landing',
  category: 'ai_application',
  order: 10,
  description: '面向制造业的 AI 落地服务',
  sections: [
    { id: 1, heading: '我们做什么', body: '我们是小型制造业的 AI 落地团队。' },
    { id: 2, heading: '合作流程', body: 'P0–P3 阶段\n\n- P0 痛点诊断\n- P1 PoC' },
  ],
};

describe('CaseArticle', () => {
  it('renders h1 with solution title and eyebrow with order', () => {
    render(<CaseArticle solution={baseSolution} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('制造业 AI 落地服务');
    expect(screen.getByText(/已交付用例 · #10/)).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<CaseArticle solution={baseSolution} />);
    expect(screen.getByText('面向制造业的 AI 落地服务')).toBeInTheDocument();
  });

  it('renders one section per item, with heading as h2', () => {
    render(<CaseArticle solution={baseSolution} />);
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(2);
    expect(h2s[0].textContent).toBe('我们做什么');
    expect(h2s[1].textContent).toBe('合作流程');
  });

  it('renders the mailto CTA with subject containing the title', () => {
    render(<CaseArticle solution={baseSolution} />);
    const cta = screen.getByRole('link', { name: /聊聊这个方案/ });
    expect(cta.getAttribute('href')).toContain('mailto:');
    expect(cta.getAttribute('href')).toContain(encodeURIComponent('案例咨询：制造业 AI 落地服务'));
  });

  it('returns to the matching list page based on category', () => {
    const { rerender } = render(<CaseArticle solution={baseSolution} />);
    const aiBackLink = screen.getByRole('link', { name: /返回智能 AI 应用/ });
    expect(aiBackLink.getAttribute('href')).toBe('/ai-application');

    const multimodalSolution = { ...baseSolution, category: 'multimodal' as const };
    rerender(<CaseArticle solution={multimodalSolution} />);
    const mmBackLink = screen.getByRole('link', { name: /返回多模态交互/ });
    expect(mmBackLink.getAttribute('href')).toBe('/multimodal');
  });

  it('handles solutions with no sections gracefully', () => {
    const empty = { ...baseSolution, sections: [] };
    render(<CaseArticle solution={empty} />);
    const h2s = screen.queryAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(0);
  });
});
