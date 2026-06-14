export default {
  async afterCreate(event: {
    result: {
      id: number;
      name: string;
      company: string;
      email: string;
      interest: string;
      message: string;
      sourcePage?: string;
    };
  }) {
    const { result } = event;
    try {
      await strapi.plugins['email'].services.email.send({
        to: process.env.SMTP_TO || 'tangsy@sunhorizontech.com',
        from: process.env.SMTP_FROM,
        subject: `🔔 新询盘 - ${result.company} - ${result.interest}`,
        html: `
          <h3>有一条新的客户询盘需要跟进 👇</h3>
          <table style="border-collapse:collapse;font-family:sans-serif;">
            <tr><td style="padding:4px 12px 4px 0;color:#666;">姓名</td><td>${escape(result.name)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">公司</td><td>${escape(result.company)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">邮箱</td><td><a href="mailto:${escape(result.email)}">${escape(result.email)}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">感兴趣</td><td>${escape(result.interest)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">来源页</td><td>${escape(result.sourcePage || 'N/A')}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">留言</td><td>${escape(result.message)}</td></tr>
          </table>
          <p style="margin-top:16px;">
            <a href="${process.env.STRAPI_ADMIN_URL || 'http://localhost:1337'}/admin/content-manager/collection-types/api::inquiry.inquiry/${result.id}"
               style="background:#1E5BA0;color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;">
              → 在后台查看详情
            </a>
          </p>
        `,
      });
    } catch (err) {
      strapi.log.error('邮件发送失败', err);
    }
  },
};

function escape(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
}
