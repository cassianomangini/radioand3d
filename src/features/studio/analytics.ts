export type StudioProjectType = "impressao" | "placa" | "caixa" | "outro";

export type StudioAnalyticsEvent =
  | {
      name: "quote_start";
      projectType?: StudioProjectType;
    }
  | {
      name: "quote_type_selected";
      projectType: StudioProjectType;
    }
  | {
      name: "quote_step_completed";
      projectType?: StudioProjectType;
      step: number;
    }
  | {
      name: "quote_file_added";
      projectType?: StudioProjectType;
      count: number;
    }
  | {
      name: "product_shopee_click";
      productSlug: string;
    };

declare global {
  interface WindowEventMap {
    "cm:studio-analytics": CustomEvent<StudioAnalyticsEvent>;
  }
}

/**
 * Local analytics boundary.
 *
 * This intentionally does not send network requests. A future analytics provider
 * may subscribe to this event after privacy/consent decisions are made.
 *
 * Never add names, phone numbers, e-mails, free-text project descriptions,
 * file names, raw query strings or attachment contents to this payload.
 */
export function emitStudioAnalytics(event: StudioAnalyticsEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<StudioAnalyticsEvent>("cm:studio-analytics", {
      detail: event
    })
  );
}
