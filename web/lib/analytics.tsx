/**
 * Analytics helpers.
 * Baidu Tongji + GA4 (gtag) scripts are injected via SiteSetting config.
 * Pageviews are reported by the script itself, so we just need to
 * provide the script tag snippet and a no-op on the client.
 */

export interface AnalyticsConfig {
  baiduId?: string;
  ga4Id?: string;
}

/**
 * Inject Baidu Tongji + Google Analytics 4 (gtag.js) scripts.
 * Use inside `<head>` of root layout.
 */
export function AnalyticsScripts({ baiduId, ga4Id }: AnalyticsConfig) {
  return (
    <>
      {baiduId ? (
        <script
          async
          src={`https://hm.baidu.com/hm.js?${baiduId}`}
        />
      ) : null}
      {ga4Id ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}', { anonymize_ip: true });`,
            }}
          />
        </>
      ) : null}
    </>
  );
}
