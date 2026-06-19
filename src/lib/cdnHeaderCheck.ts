import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Result of a real-time CDN header probe for a media URL.
 * - `status`  HTTP status code returned by the CDN (0 if the request failed)
 * - `ok`      Boolean shorthand: status in [200, 206, 304]
 * - `contentType`  Value of the `Content-Type` response header
 * - `acceptRanges` Value of the `Accept-Ranges` header (useful for media)
 * - `contentLength` Bytes reported by the CDN, when present
 * - `cacheControl` Cache headers, for debugging stale assets
 * - `error`   Network-level error message when the probe couldn't reach the CDN
 * - `checking` True while a probe is in flight
 * - `checkedAt` Wall-clock timestamp of the last completed probe
 */
export type CdnHeaderResult = {
  status: number;
  ok: boolean;
  contentType: string | null;
  acceptRanges: string | null;
  contentLength: string | null;
  cacheControl: string | null;
  error: string | null;
  checking: boolean;
  checkedAt: number | null;
};

const INITIAL: CdnHeaderResult = {
  status: 0,
  ok: false,
  contentType: null,
  acceptRanges: null,
  contentLength: null,
  cacheControl: null,
  error: null,
  checking: false,
  checkedAt: null,
};

/**
 * Probe a media URL with a HEAD request and expose status + headers.
 *
 * Some CDNs reject `HEAD`; in that case we transparently fall back to a
 * `GET` with `Range: bytes=0-0` so we still get headers without downloading
 * the file. The hook re-runs whenever `url` changes, and exposes `recheck`
 * for manual refresh from a diagnostics panel.
 */
export function useCdnHeaderCheck(url: string | null | undefined): CdnHeaderResult & { recheck: () => void } {
  const [state, setState] = useState<CdnHeaderResult>(INITIAL);
  const tokenRef = useRef(0);

  const run = useCallback(async (target: string) => {
    const token = ++tokenRef.current;
    setState((s) => ({ ...s, checking: true, error: null }));
    const apply = (res: Response | null, error: string | null) => {
      if (token !== tokenRef.current) return;
      if (!res) {
        setState({ ...INITIAL, error, checking: false, checkedAt: Date.now() });
        return;
      }
      const status = res.status;
      setState({
        status,
        ok: status === 200 || status === 206 || status === 304,
        contentType: res.headers.get("content-type"),
        acceptRanges: res.headers.get("accept-ranges"),
        contentLength: res.headers.get("content-length"),
        cacheControl: res.headers.get("cache-control"),
        error: null,
        checking: false,
        checkedAt: Date.now(),
      });
    };
    try {
      const head = await fetch(target, { method: "HEAD", cache: "no-store" });
      if (head.status === 405 || head.status === 501) {
        // Some CDNs disallow HEAD — retry with a single-byte ranged GET.
        const ranged = await fetch(target, {
          method: "GET",
          cache: "no-store",
          headers: { Range: "bytes=0-0" },
        });
        apply(ranged, null);
      } else {
        apply(head, null);
      }
    } catch (e) {
      apply(null, e instanceof Error ? e.message : "Network error");
    }
  }, []);

  useEffect(() => {
    if (!url) {
      tokenRef.current++;
      setState(INITIAL);
      return;
    }
    void run(url);
  }, [url, run]);

  const recheck = useCallback(() => {
    if (url) void run(url);
  }, [url, run]);

  return { ...state, recheck };
}