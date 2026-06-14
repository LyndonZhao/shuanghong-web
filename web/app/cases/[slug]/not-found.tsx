import Link from 'next/link';

export default function CaseNotFound() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-24 text-center">
      <div className="text-xs font-medium uppercase tracking-widest text-brand mb-4">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
        案例未找到
      </h1>
      <p className="mt-4 text-muted-foreground">
        这个 URL 可能已被删除或链接有误。
      </p>
      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link href="/multimodal" className="text-brand hover:underline">
          ← 查看多模态案例
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/ai-application" className="text-brand hover:underline">
          查看 AI 案例 →
        </Link>
      </div>
    </main>
  );
}
