export type AccessRequestSource = string;

export interface AccessRequestDetail {
  source: AccessRequestSource;
  title?: string;
  description?: string;
  /** Extra free-form metadata stored alongside the request (e.g. course name). */
  metadata?: Record<string, unknown>;
}

export const ACCESS_REQUEST_EVENT = "access-request:open";

export function openAccessRequest(detail: AccessRequestDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AccessRequestDetail>(ACCESS_REQUEST_EVENT, { detail }));
}