import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openLuxeVeilGate } from "@/lib/luxeVeilGate";
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  GraduationCap,
  Crown,
  Briefcase,
  LogOut,
  CheckCircle2,
  Clock,
  Lock,
  Users,
  Activity,
  AlertTriangle,
  BarChart3,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";
import trendfluxLogo from "@/assets/trendflux-arrow-icon.jpeg.asset.json";

type Role = "admin" | "editor" | null;

type Enrollment = {
  id: string;
  module_index: number;
  status: string;
  amount_bdt: number;
  created_at: string;
};

type LuxeRequest = {
  id: string;
  status: string;
  created_at: string;
};

type AdminCounts = {
  luxe_pending: number;
  enroll_pending: number;
  access_pending: number;
  demo_new: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  useSeo({
    title: "Dashboard — TrendFlux Ecosystem",
    description: "Your TrendFlux account hub — courses, premium access, and admin tools.",
    noindex: true,
  });

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<Role>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [luxeRequest, setLuxeRequest] = useState<LuxeRequest | null>(null);
  const [adminCounts, setAdminCounts] = useState<AdminCounts>({
    luxe_pending: 0,
    enroll_pending: 0,
    access_pending: 0,
    demo_new: 0,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/auth?redirect=/dashboard", { replace: true });
        return;
      }
      const userId = sessionData.session.user.id;
      const userEmail = sessionData.session.user.email ?? "";

      const [profileRes, rolesRes, enrollRes, luxeRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase
          .from("module_enrollments")
          .select("id, module_index, status, amount_bdt, created_at")
          .eq("user_id", userId)
          .order("module_index", { ascending: true }),
        supabase
          .from("luxe_veil_requests")
          .select("id, status, created_at")
          .eq("email", userEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!mounted) return;

      setEmail(userEmail);
      setFullName(profileRes.data?.full_name ?? "");
      const detectedRole: Role =
        rolesRes.data?.some((r: any) => r.role === "admin")
          ? "admin"
          : rolesRes.data?.some((r: any) => r.role === "editor")
          ? "editor"
          : null;
      setRole(detectedRole);
      setEnrollments((enrollRes.data as Enrollment[]) ?? []);
      setLuxeRequest((luxeRes.data as LuxeRequest) ?? null);

      if (detectedRole === "admin") {
        const [luxeP, enrollP, accessP, demoP] = await Promise.all([
          supabase.from("luxe_veil_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("module_enrollments").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("enterprise_demo_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        ]);
        if (mounted) {
          setAdminCounts({
            luxe_pending: luxeP.count ?? 0,
            enroll_pending: enrollP.count ?? 0,
            access_pending: accessP.count ?? 0,
            demo_new: demoP.count ?? 0,
          });
        }
      }

      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth?redirect=/dashboard", { replace: true });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const displayName = fullName || email.split("@")[0] || "there";
  const hasEnrollments = enrollments.length > 0;
  const approvedEnrollments = enrollments.filter((e) => e.status === "approved");
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending");

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#B11226] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF9] text-[#111111] font-[Inter,system-ui,sans-serif]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={trendfluxLogo.url} alt="TrendFlux" className="h-7 w-7 rounded-md bg-white object-contain p-0.5" />
            <span className="font-semibold tracking-tight text-[14px]">
              TrendFlux <span className="text-foreground/50 font-normal">Dashboard</span>
            </span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#4B5563] hover:text-[#111] transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14 space-y-10">
        {/* GREETING */}
        <section>
          <div className="flex flex-wrap items-center gap-2">
            {role === "admin" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
            {role === "editor" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4B5563] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                Editor
              </span>
            )}
            {!role && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] text-[#B11226] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 ring-1 ring-[#FECACA]">
                Member
              </span>
            )}
            <span className="text-[12px] text-[#6B7280]">{email}</span>
          </div>
          <h1 className="mt-3 font-display text-[28px] md:text-[34px] font-semibold tracking-tight">
            স্বাগতম, {displayName}।
          </h1>
          <p className="mt-1.5 text-[14px] text-[#4B5563] max-w-xl">
            {role === "admin"
              ? "Ecosystem-এর সব pending request, enrollment ও system health এক জায়গায়।"
              : "TrendFlux Ecosystem-এ তোমার access, courses ও premium membership এক জায়গায়।"}
          </p>
        </section>

        {/* ADMIN PANEL */}
        {role === "admin" && (
          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-[#E5E7EB] pb-2">
              <h2 className="font-display text-[18px] font-semibold tracking-tight">Admin Operations</h2>
              <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">Live</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminCard to="/admin/luxe-veil" icon={Crown} label="Luxe Veil Requests" count={adminCounts.luxe_pending} />
              <AdminCard to="/admin/course-enrollments" icon={GraduationCap} label="Course Enrollments" count={adminCounts.enroll_pending} />
              <AdminCard to="/admin" icon={Inbox} label="Access Requests" count={adminCounts.access_pending} />
              <AdminCard to="/admin/enterprise-demos" icon={Briefcase} label="Enterprise Demos" count={adminCounts.demo_new} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminCard to="/admin/conversions" icon={BarChart3} label="Conversions" muted />
              <AdminCard to="/admin/talent" icon={Users} label="Talent Applications" muted />
              <AdminCard to="/admin/uptime" icon={Activity} label="Uptime Monitor" muted />
              <AdminCard to="/admin/errors" icon={AlertTriangle} label="Error Logs" muted />
              <AdminCard to="/admin/web-vitals" icon={BarChart3} label="Web Vitals" muted />
            </div>
          </section>
        )}

        {/* COURSE / ACADEMY */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-[#E5E7EB] pb-2">
            <h2 className="font-display text-[18px] font-semibold tracking-tight">TrendFlux Academy</h2>
            <Link to="/course/trendflux" className="text-[12px] text-[#B11226] hover:underline">
              Browse modules →
            </Link>
          </div>
          {hasEnrollments ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <Stat label="Approved" value={approvedEnrollments.length} accent="#16A34A" />
                <Stat label="Pending" value={pendingEnrollments.length} accent="#F59E0B" />
                <Stat label="Total" value={enrollments.length} accent="#111" />
              </div>
              <div className="space-y-2">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl border border-[#F1F1EF] px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-8 w-8 rounded-lg bg-[#111] text-white grid place-items-center text-[12px] font-bold shrink-0">
                        M{e.module_index}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">Module {e.module_index}</div>
                        <div className="text-[11px] text-[#6B7280]">৳{e.amount_bdt} · {new Date(e.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <StatusPill status={e.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyCta
              icon={GraduationCap}
              title="এখনো কোনো module enroll করো নি"
              desc="TrendFlux Academy-তে AI-powered growth course শুরু করো — প্রতিটা module আলাদা ভাবে unlock করা যায়।"
              cta={{ to: "/course/trendflux", label: "Explore courses" }}
            />
          )}
        </section>

        {/* LUXE VEIL */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-[#E5E7EB] pb-2">
            <h2 className="font-display text-[18px] font-semibold tracking-tight">Luxe Veil — Premium Access</h2>
            <button
              type="button"
              onClick={() => openLuxeVeilGate({ source: "dashboard_visit" })}
              className="text-[12px] text-[#B11226] hover:underline"
            >
              Visit →
            </button>
          </div>
          {luxeRequest ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">Your access request</div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  Submitted {new Date(luxeRequest.created_at).toLocaleDateString()}
                </div>
              </div>
              <StatusPill status={luxeRequest.status} />
            </div>
          ) : (
            <EmptyCta
              icon={Crown}
              title="Luxe Veil — invite-only premium ecosystem"
              desc="Wellness, lifestyle ও premium content-এর জন্য private space। Access request submit করো — admin approve করলে unlock হবে।"
              cta={{
                label: "Request access",
                onClick: () => openLuxeVeilGate({ source: "dashboard_empty" }),
              }}
            />
          )}
        </section>

        {/* QUICK LINKS */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-[#E5E7EB] pb-2">
            <h2 className="font-display text-[18px] font-semibold tracking-tight">Explore TrendFlux</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink to="/toolkit" icon={Briefcase} title="Toolkit Hub" desc="Premium templates & growth systems" />
            <QuickLink to="/enterprise" icon={Users} title="Enterprise" desc="Strategy sessions & demos" />
            <QuickLink to="/portfolio" icon={CheckCircle2} title="Portfolio" desc="Proof, systems & case studies" />
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminCard({
  to,
  icon: Icon,
  label,
  count,
  muted,
}: {
  to: string;
  icon: any;
  label: string;
  count?: number;
  muted?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 hover:border-[#111] transition flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${muted ? "bg-[#F8FAFC] text-[#4B5563]" : "bg-[#FEF2F2] text-[#B11226]"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="mt-3 text-[13px] font-medium tracking-tight truncate">{label}</div>
        {typeof count === "number" && (
          <div className="mt-1 text-[22px] font-bold tabular-nums leading-none">
            {count}
            <span className="ml-1.5 text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">pending</span>
          </div>
        )}
      </div>
      <ArrowUpRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#111] transition shrink-0 mt-1" />
    </Link>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <div className="text-[24px] font-bold tabular-nums leading-none" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-[#6B7280]">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; icon: any; label: string }> = {
    approved: { bg: "#ECFDF5", fg: "#047857", icon: CheckCircle2, label: "Approved" },
    pending: { bg: "#FFFBEB", fg: "#B45309", icon: Clock, label: "Pending" },
    rejected: { bg: "#FEF2F2", fg: "#B91C1C", icon: Lock, label: "Rejected" },
  };
  const s = map[status] ?? { bg: "#F3F4F6", fg: "#4B5563", icon: Clock, label: status };
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full text-[10px] font-semibold uppercase tracking-wider px-2 py-1"
      style={{ background: s.bg, color: s.fg }}
    >
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

function EmptyCta({
  icon: Icon,
  title,
  desc,
  cta,
}: {
  icon: any;
  title: string;
  desc: string;
  cta: { label: string; to?: string; onClick?: () => void };
}) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full bg-[#111] text-white text-[12.5px] font-medium px-4 py-2 hover:bg-[#B11226] transition shrink-0";
  return (
    <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#B11226] shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold tracking-tight">{title}</div>
        <p className="mt-1 text-[12.5px] text-[#4B5563] leading-relaxed">{desc}</p>
      </div>
      {cta.onClick ? (
        <button type="button" onClick={cta.onClick} className={className}>
          {cta.label} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link to={cta.to!} className={className}>
          {cta.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 hover:border-[#111] transition">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#4B5563] group-hover:bg-[#FEF2F2] group-hover:text-[#B11226] transition">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-3 text-[14px] font-semibold tracking-tight">{title}</div>
      <p className="mt-1 text-[12px] text-[#6B7280]">{desc}</p>
    </Link>
  );
}
