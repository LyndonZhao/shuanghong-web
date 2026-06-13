import { getAboutPage } from '@/lib/data';
import { InquiryForm } from '@/components/InquiryForm';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '关于双泓',
  description: '上海双泓信息科技有限公司专注于多模态交互与 AI 智能体应用,助力行业智能化升级。',
};

export default async function AboutPage() {
  const page = await getAboutPage();
  const contact = page?.contact;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {page?.pageTitle ?? '关于双泓'}
          </h1>
        </div>
      </section>

      {/* Vision */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {page?.visionTitle ?? '公司愿景和目标'}
        </h2>
        {page?.visionContent ? (
          <p className="mt-6 text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {page.visionContent}
          </p>
        ) : null}
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">联系我们</h2>
              <p className="mt-4 text-muted-foreground">
                如果您对我们的解决方案感兴趣,或有任何问题需要咨询,请通过以下方式联系我们。
              </p>
              <dl className="mt-8 space-y-4">
                <ContactRow label="电话" value={contact?.phone ?? '0XX-XXXXXXXX'} />
                <ContactRow label="邮箱" value={contact?.email ?? 'contact@shuanghongtech.com'} href={`mailto:${contact?.email ?? 'contact@shuanghongtech.com'}`} />
                <ContactRow label="地址" value={contact?.address ?? 'XX省XX市XX区XX大厦XX层'} />
                <ContactRow label="微信" value={contact?.wechatId ?? '13XXXXXXXXX(微信同号)'} />
              </dl>
            </div>
            <div>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-16 shrink-0 text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">
        {href ? (
          <a href={href} className="hover:text-brand transition">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
