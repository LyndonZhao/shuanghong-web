import type { Solution } from '@/lib/types';

interface SolutionGridProps {
  solutions: Solution[];
  /** Show category badge */
  showCategory?: boolean;
  /** Optional category to highlight (filters shown) */
  category?: 'multimodal' | 'ai_application';
}

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  multimodal: { label: '多模态', color: 'bg-category-multimodal/10 text-category-multimodal' },
  ai_application: { label: 'AI 应用', color: 'bg-category-ai/10 text-category-ai' },
};

export function SolutionGrid({ solutions, showCategory = true, category }: SolutionGridProps) {
  const filtered = category ? solutions.filter((s) => s.category === category) : solutions;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无解决方案数据
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((s) => {
        const cat = CATEGORY_LABEL[s.category] ?? { label: s.category, color: 'bg-gray-100 text-gray-700' };
        return (
          <article
            key={s.id}
            id={s.slug}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand transition"
          >
            <div className="flex items-center justify-between">
              {showCategory ? (
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
                  {cat.label}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">#{s.order}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-brand transition">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
              {s.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
