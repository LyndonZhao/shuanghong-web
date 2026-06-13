import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InquiryForm } from './InquiryForm';

describe('InquiryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required fields', () => {
    render(<InquiryForm />);
    expect(screen.getByLabelText('姓名 *')).toBeInTheDocument();
    expect(screen.getByLabelText('公司 *')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱 *')).toBeInTheDocument();
    expect(screen.getByLabelText('电话')).toBeInTheDocument();
    expect(screen.getByLabelText('感兴趣方向')).toBeInTheDocument();
    expect(screen.getByLabelText('留言 *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /提交询盘/ })).toBeInTheDocument();
  });

  it('shows success state after successful submission', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }),
    );

    render(<InquiryForm />);

    fireEvent.change(screen.getByLabelText('姓名 *'), { target: { value: '张三' } });
    fireEvent.change(screen.getByLabelText('公司 *'), { target: { value: '双泓' } });
    fireEvent.change(screen.getByLabelText('邮箱 *'), { target: { value: 'z@s.com' } });
    fireEvent.change(screen.getByLabelText('留言 *'), { target: { value: '请联系我' } });

    fireEvent.click(screen.getByRole('button', { name: /提交询盘/ }));

    await waitFor(() => {
      expect(screen.getByText('提交成功')).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/inquiry', expect.any(Object));
  });

  it('shows error state on failed submission', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'bad email' } }), { status: 400 }),
    );

    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('姓名 *'), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText('公司 *'), { target: { value: 'Y' } });
    fireEvent.change(screen.getByLabelText('邮箱 *'), { target: { value: 'x@y.com' } });
    fireEvent.change(screen.getByLabelText('留言 *'), { target: { value: 'msg' } });

    fireEvent.click(screen.getByRole('button', { name: /提交询盘/ }));

    await waitFor(() => {
      expect(screen.getByText(/提交失败/)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    let resolveFetch: (v: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('姓名 *'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('公司 *'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('邮箱 *'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('留言 *'), { target: { value: 'm' } });

    const btn = screen.getByRole('button', { name: /提交询盘/ });
    fireEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn.textContent).toMatch(/提交中/);

    resolveFetch!(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }));
  });
});
