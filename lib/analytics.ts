export type EventName =
  | 'view_product'
  | 'view_print'
  | 'add_to_quote'
  | 'remove_from_quote'
  | 'upload_art'
  | 'start_quote'
  | 'submit_quote'
  | 'click_whatsapp'
  | 'quote_completed';

export function trackEvent(eventName: EventName, data?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    console.log(`[Analytics Event: ${eventName}]`, data || {});

    // Hook for Google Analytics / Tag Manager / Meta Pixel
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
    if ((window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, data);
    }
  }
}
