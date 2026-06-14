import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';

interface MarkdownProps {
  /** markdown 源文本 */
  source: string;
}

/**
 * 服务端组件可用的 markdown 渲染器。
 * 用 react-markdown + remark-gfm 支持 GFM 表格、列表、删除线。
 * 元素样式全部内联（Tailwind 4 不兼容 @tailwindcss/typography v0.5）。
 */
export function Markdown({ source }: MarkdownProps): ReactNode {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
        th: ({ children }) => (
          <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-gray-100 px-3 py-2 align-top text-foreground/90">
            {children}
          </td>
        ),
        pre: ({ children }) => (
          <pre className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100 font-mono">
            {children}
          </pre>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = className?.startsWith('language-');
          if (isBlock) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-brand-dark"
              {...props}
            >
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-brand bg-brand-tint/40 px-4 py-3 text-foreground italic">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="my-4 ml-6 list-disc space-y-1.5 text-foreground/90">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-4 ml-6 list-decimal space-y-1.5 text-foreground/90">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        p: ({ children }) => <p className="my-3 leading-relaxed text-foreground/90">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
        h3: ({ children }) => (
          <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-6 mb-2 text-base font-semibold text-foreground">{children}</h4>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-brand underline underline-offset-2 hover:text-brand-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-8 border-gray-200" />,
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
