'use client';

import { useState } from 'react';

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: 'multimodal' | 'ai' | 'other';
  message: string;
}

const INITIAL: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  interest: 'other',
  message: '',
};

const INTEREST_LABEL: Record<FormState['interest'], string> = {
  multimodal: '多模态交互',
  ai: '智能 AI 应用',
  other: '其他',
};

export function InquiryForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      }
      setStatus('success');
      setForm(INITIAL);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '提交失败');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-3xl">✅</div>
        <h3 className="mt-3 text-lg font-semibold text-green-900">提交成功</h3>
        <p className="mt-2 text-sm text-green-700">
          我们已收到您的询盘,会尽快与您联系。
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-green-800 underline hover:text-green-900"
        >
          再提交一条
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-foreground">在线咨询</h3>

      <Field label="姓名 *" id="name" required>
        <input
          id="name"
          type="text"
          required
          maxLength={50}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </Field>

      <Field label="公司 *" id="company" required>
        <input
          id="company"
          type="text"
          required
          maxLength={100}
          value={form.company}
          onChange={(e) => update('company', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="邮箱 *" id="email" required>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </Field>
        <Field label="电话" id="phone">
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </Field>
      </div>

      <Field label="感兴趣方向" id="interest">
        <select
          id="interest"
          value={form.interest}
          onChange={(e) => update('interest', e.target.value as FormState['interest'])}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {(Object.keys(INTEREST_LABEL) as Array<FormState['interest']>).map((k) => (
            <option key={k} value={k}>
              {INTEREST_LABEL[k]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="留言 *" id="message" required>
        <textarea
          id="message"
          required
          maxLength={1000}
          rows={4}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </Field>

      {status === 'error' ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          提交失败: {errorMsg}。请稍后重试或直接发送邮件至 tangsy@sunhorizontech.com
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? '提交中...' : '提交询盘'}
      </button>
    </form>
  );
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
