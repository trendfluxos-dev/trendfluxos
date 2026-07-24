import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfileTool from "./tools/get-my-profile";
import listMyEnrollmentsTool from "./tools/list-my-enrollments";
import listStrategyBookingsTool from "./tools/list-strategy-bookings";

// Build the OAuth issuer from the project ref so it always points at the
// direct supabase.co host, never the .lovable.cloud proxy — mcp-js rejects
// any token whose configured issuer doesn't match the one published by
// discovery (RFC 8414 §3.3). Vite inlines VITE_SUPABASE_PROJECT_ID as a
// literal, so this stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "trendflux-mcp",
  title: "TrendFlux Digital",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in TrendFlux user. Use `get_my_profile` to read the user's profile, `list_my_enrollments` to list their TrendFlux Academy course enrollments, and (admins only) `list_strategy_bookings` to pull strategy calls in a date range for reporting and follow-ups.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfileTool, listMyEnrollmentsTool, listStrategyBookingsTool],
});