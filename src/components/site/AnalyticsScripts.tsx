import Script from "next/script";

/**
 * Optional analytics scripts — enabled only when env vars are set.
 * GA4: NEXT_PUBLIC_GA_ID
 * Shopify custom pixel placeholder: NEXT_PUBLIC_SHOPIFY_WEB_PIXEL_ID (reserved for Admin pixel wiring)
 */
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const webPixelId = process.env.NEXT_PUBLIC_SHOPIFY_WEB_PIXEL_ID?.trim();

  if (!gaId && !webPixelId) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:true});`}
          </Script>
        </>
      )}
      {webPixelId && (
        <Script id="shopify-web-pixel-placeholder" strategy="afterInteractive">
          {`window.__SHOPIFY_WEB_PIXEL_ID__='${webPixelId}';`}
        </Script>
      )}
    </>
  );
}
