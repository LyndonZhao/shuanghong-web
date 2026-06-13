import { getSiteSetting } from '@/lib/data';
import { AnalyticsScripts } from '@/lib/analytics';

/**
 * Server component that fetches SiteSetting and injects
 * Baidu Tongji + Google Analytics 4 (gtag.js) scripts.
 * No-ops if SiteSetting has no analytics IDs configured.
 */
export async function AnalyticsInjector() {
  const site = await getSiteSetting();
  return <AnalyticsScripts baiduId={site?.analyticsBaidu} ga4Id={site?.analyticsGa} />;
}
