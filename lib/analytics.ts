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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics Event: ${eventName}]`, data || {});
    }

    // Google Analytics 4
    if ((window as any).gtag) {
      try {
        (window as any).gtag('event', eventName, data);
        if (eventName === 'submit_quote' || eventName === 'quote_completed') {
          (window as any).gtag('event', 'generate_lead', data);
        }
      } catch (err) {}
    }

    // Meta Pixel (Facebook / Instagram)
    if ((window as any).fbq) {
      try {
        (window as any).fbq('trackCustom', eventName, data);

        // Dispara eventos padrão para otimização de campanhas no Meta Ads
        if (eventName === 'submit_quote' || eventName === 'quote_completed') {
          (window as any).fbq('track', 'Lead', {
            content_name: 'Solicitação de Orçamento',
            ...data,
          });
        } else if (eventName === 'click_whatsapp') {
          (window as any).fbq('track', 'Contact', {
            content_name: 'Clique no WhatsApp',
            ...data,
          });
        } else if (eventName === 'add_to_quote') {
          (window as any).fbq('track', 'AddToCart', data);
        } else if (eventName === 'view_product') {
          (window as any).fbq('track', 'ViewContent', data);
        }
      } catch (err) {}
    }
  }
}
