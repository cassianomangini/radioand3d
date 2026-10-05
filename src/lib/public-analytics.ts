export type PublicAnalyticsEvent =
  | "quote_start"
  | "quote_type_selected"
  | "quote_step_completed"
  | "quote_file_added"
  | "product_shopee_exit";

export type PublicAnalyticsPayload = {
  projectType?: "impressao" | "placa" | "caixa" | "outro";
  step?: number;
  origin?: string;
  reference?: string;
  productSlug?: string;
};

export type PublicAnalyticsDetail = {
  event: PublicAnalyticsEvent;
  payload: PublicAnalyticsPayload;
};

/**
 * Browser-only analytics contract.
 *
 * This intentionally does not send data anywhere by itself. A launch-time adapter may
 * subscribe to "cm:analytics" and forward only these typed, non-PII dimensions to the
 * approved analytics provider.
 */
export function trackPublicEvent(
  event: PublicAnalyticsEvent,
  payload: PublicAnalyticsPayload = {}
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<PublicAnalyticsDetail>("cm:analytics", {
      detail: { event, payload }
    })
  );
}
