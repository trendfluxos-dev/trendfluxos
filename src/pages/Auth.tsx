import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";
import trendfluxLogo from "@/assets/trendflux-arrow-icon.jpeg.asset.json";

/**
 * Map raw auth errors to friendly, bilingual messages so we never leak
 * provider-specific strings (e.g. "AuthApiError: Invalid login credentials").
 */
function friendlyAuthError(message: string, mode: "signin" | "signup"): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "ভুল email বা password। আবার চেষ্টা করুন।";
  }
  if (m.includes("email not confirmed")) {
    return "প্রথমে আপনার email confirm করুন, তারপর sign in করুন।";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "এই email দিয়ে আগে account তৈরি হয়েছে। Sign in করুন।";
  }
  if (m.includes("password") && m.includes("6")) {
    return "Password কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network সমস্যা। Internet connection check করে আবার চেষ্টা করুন।";
  }
  return mode === "signin" ? "Sign in করা যায়নি। আবার চেষ্টা করুন।" : "Account তৈরি করা যায়নি। আবার চেষ্টা করুন।";
}

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const roleParam = params.get("role");
  const role: "student" | "teacher" | null =
    roleParam === "student" || roleParam === "teacher" ? roleParam : null;
  useSeo({
    title: "Sign In — TrendFlux Ecosystem",
    description: "Sign in to access TrendFlux Ecosystem admin tools.",
    noindex: true,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">(role ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.scrollTo({ top: 0, behavior: "auto" });
        navigate(redirect, { replace: true });
      }
    });
  }, [navigate, redirect]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    // Light client-side guardrails before hitting the network.
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("একটি valid email address দিন।");
      return;
    }
    if (password.length < 6) {
      toast.error("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (mode === "signup" && fullName.trim().length < 2) {
      toast.error("আপনার পুরো নাম লিখুন।");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirect}`,
            data: {
              full_name: fullName.trim(),
              ...(role ? { role, intended_role: role } : {}),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account তৈরি হয়েছে। এখন sign in করুন।");
          setMode("signin");
          return;
        }
        toast.success("স্বাগতম!");
      }
      window.scrollTo({ top: 0, behavior: "auto" });
      navigate(redirect, { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      console.error("Auth submit failed", err);
      toast.error(friendlyAuthError(raw, mode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        return;
      }
      if (result.redirected) return;
      window.scrollTo({ top: 0, behavior: "auto" });
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("Google sign-in failed", err);
      toast.error("Google sign-in ব্যর্থ হয়েছে।");
    } finally {
      setGoogleLoading(false);
    }
  };

  const isSignup = mode === "signup";
  const roleBadge =
    role === "teacher"
      ? { label: "Teacher signup", sub: "Live studio · publish courses · earn" }
      : role === "student"
        ? { label: "Student signup", sub: "Live class · 3-month recording access" }
        : null;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5">
            <img
              src={trendfluxLogo.url}
              alt="TrendFlux Digital"
              className="h-8 w-8 rounded-md bg-white object-contain p-0.5"
            />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              TrendFlux <span className="text-foreground/55 font-normal">Digital</span>
            </span>
          </div>
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground/45">
            AI Systems · Digital Growth
          </p>
        </div>

        <form
          onSubmit={handle}
          className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 sm:p-8 space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.25)]"
        >
          {roleBadge && isSignup && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{roleBadge.label}</div>
              <div className="text-[12px] text-foreground/70">{roleBadge.sub}</div>
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="font-display text-[22px] font-semibold tracking-tight">
              {isSignup
                ? role === "teacher"
                  ? "Create Teacher Account"
                  : role === "student"
                    ? "Create Student Account"
                    : "Create Account"
                : "Sign In"}
            </h1>
            <p className="text-[13px] leading-relaxed text-foreground/60">
              {isSignup
                ? "TrendFlux Academy, AI Systems ও Professional Toolkit Access।"
                : "TrendFlux Ecosystem-এ ফিরে স্বাগতম।"}
            </p>
          </div>

          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-[12px] font-medium text-foreground/75">Full name</Label>
              <Input
                id="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-medium text-foreground/75">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[12px] font-medium text-foreground/75">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-[14px] font-semibold text-white tracking-tight transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_-10px_rgba(177,18,38,0.55)]"
            style={{ background: "linear-gradient(135deg,#B11226 0%,#7A0C19 100%)" }}
          >
            {loading ? "..." : isSignup ? "Create Account" : "Sign In"}
          </button>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full h-11 rounded-xl border border-border/70 bg-background hover:bg-accent/40 transition-colors flex items-center justify-center gap-2.5 text-[14px] font-medium text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            {googleLoading ? "..." : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="block w-full text-center text-[12.5px] text-foreground/55 hover:text-foreground transition-colors"
          >
            {isSignup ? (
              <>Already have access? <span className="text-foreground/85 font-medium">Sign in</span></>
            ) : (
              <>Need access? <span className="text-foreground/85 font-medium">Create account</span></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-foreground/45">
          Built for creators, operators & ambitious digital professionals.
        </p>
      </div>
    </div>
  );
}
