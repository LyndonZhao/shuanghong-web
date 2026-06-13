import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalyticsScripts } from './analytics';

describe('AnalyticsScripts', () => {
  it('renders nothing when no ids provided', () => {
    const html = renderToStaticMarkup(<AnalyticsScripts />);
    expect(html).toBe('');
  });

  it('renders Baidu Tongji script when baiduId provided', () => {
    const html = renderToStaticMarkup(<AnalyticsScripts baiduId="abc123def" />);
    expect(html).toContain('hm.baidu.com/hm.js?abc123def');
    expect(html).toContain('<script');
    expect(html).toContain('async');
  });

  it('renders GA4 script + config when ga4Id provided', () => {
    const html = renderToStaticMarkup(<AnalyticsScripts ga4Id="G-XXXX" />);
    expect(html).toContain('gtag/js?id=G-XXXX');
    expect(html).toContain('gtag(\'config\', \'G-XXXX\'');
    expect(html).toContain('anonymize_ip: true');
  });

  it('renders both when both ids provided', () => {
    const html = renderToStaticMarkup(
      <AnalyticsScripts baiduId="b1" ga4Id="G-1" />,
    );
    expect(html).toContain('hm.baidu.com/hm.js?b1');
    expect(html).toContain('gtag/js?id=G-1');
  });
});
