import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('renders headings, paragraphs, and emphasis', () => {
    // Markdown component customizes h3/h4; use those to exercise the heading branches.
    const { container } = render(
      <Markdown source={'### 三级标题\n\n这是 **加粗** 文字与 *斜体*。'} />,
    );
    expect(container.querySelector('h3')?.textContent).toBe('三级标题');
    expect(container.querySelector('strong')?.textContent).toBe('加粗');
    expect(container.querySelector('em')?.textContent).toBe('斜体');
  });

  it('renders unordered and ordered lists', () => {
    const { container } = render(<Markdown source={'- a\n- b\n\n1. x\n2. y'} />);
    expect(container.querySelectorAll('ul > li')).toHaveLength(2);
    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
  });

  it('renders a GFM table with custom cell styling', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const { container } = render(<Markdown source={md} />);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelectorAll('th')).toHaveLength(2);
    expect(container.querySelectorAll('td')).toHaveLength(2);
  });

  it('renders inline code with custom background class', () => {
    const { container } = render(<Markdown source={'使用 `npm install` 安装。'} />);
    const code = container.querySelector('code');
    expect(code?.textContent).toBe('npm install');
    expect(code?.className).toContain('bg-gray-100');
  });

  it('renders a blockquote with brand-tinted background', () => {
    const { container } = render(<Markdown source={'> 提示：这是一段引用'} />);
    const bq = container.querySelector('blockquote');
    expect(bq?.textContent).toContain('提示：这是一段引用');
    expect(bq?.className).toContain('border-brand');
  });

  it('renders links with target=_blank and rel=noopener', () => {
    const { container } = render(<Markdown source={'[官网](https://shuanghongtech.com)'} />);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://shuanghongtech.com');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders a thematic break (hr)', () => {
    const { container } = render(<Markdown source={'a\n\n---\n\nb'} />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});
