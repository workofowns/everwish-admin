import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Coins, TrendingUp, TrendingDown, Loader2, ChevronLeft,
  ChevronRight, Filter, Users, Sparkles, RefreshCw, ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";

// ── Types ────────────────────────────────────────────────────────────────────

interface CreditStats {
  total_credits_outstanding: string;
  users_with_credits: string;
  total_credits_granted: string;
  total_credits_spent: string;
  renewal_grants: string;
  admin_adjustments: string;
  credits_granted_30d: string;
  credits_spent_30d: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  reference_id: string | null;
  lookup_key: string | null;
  created_at: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  user_plan: string;
  user_current_credits: number;
}

interface CreditLedgerResponse {
  rows: CreditTransaction[];
  total: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, { label: string; icon: typeof TrendingUp; color: string }> = {
  subscription_renewal:       { label: "Subscription Renewal",  icon: RefreshCw,    color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  wish_creation:              { label: "Wish Created",          icon: Sparkles,     color: "text-rose-600 bg-rose-50 border-rose-200" },
  admin_adjustment:           { label: "Admin Adjustment",      icon: ShieldCheck,  color: "text-violet-600 bg-violet-50 border-violet-200" },
  subscription_canceled:      { label: "Sub. Canceled",         icon: TrendingDown, color: "text-orange-600 bg-orange-50 border-orange-200" },
  backfill_pro_plan_credits:  { label: "Backfill (Pro)",        icon: Coins,        color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const PLAN_COLOR: Record<string, string> = {
  premium: "bg-amber-50 text-amber-700 border-amber-200",
  pro:     "bg-violet-50 text-violet-700 border-violet-200",
  free:    "bg-muted text-muted-foreground border-transparent",
};

const REASON_OPTIONS = [
  { value: "", label: "All reasons" },
  { value: "subscription_renewal",      label: "Subscription Renewal" },
  { value: "wish_creation",             label: "Wish Created" },
  { value: "admin_adjustment",          label: "Admin Adjustment" },
  { value: "subscription_canceled",     label: "Sub. Canceled" },
  { value: "backfill_pro_plan_credits", label: "Backfill" },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
        <p className="text-2xl font-black text-foreground leading-none">{Number(value).toLocaleString()}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CreditsPage = () => {
  const [page, setPage]         = useState(1);
  const [reason, setReason]     = useState("");
  const [userFilter, setUserFilter] = useState("");
  const limit = 25;

  const { data: stats, isLoading: statsLoading } = useQuery<CreditStats>({
    queryKey: ["creditStats"],
    queryFn: () => fetchApi("/credits/stats"),
  });

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(reason     ? { reason }     : {}),
    ...(userFilter ? { userId: userFilter } : {}),
  });

  const { data, isLoading } = useQuery<CreditLedgerResponse>({
    queryKey: ["creditLedger", page, reason, userFilter],
    queryFn: () => fetchApi(`/credits?${params}`),
  });

  const rows        = data?.rows ?? [];
  const totalPages  = Math.ceil((data?.total ?? 0) / limit);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="sub-label mb-1">Billing & Engagement</p>
          <h1 className="section-header text-3xl">Credits Ledger</h1>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading stats…</span>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Outstanding Credits"
              value={stats.total_credits_outstanding}
              sub="held by active users"
              icon={Coins}
              color="bg-amber-50 text-amber-500"
            />
            <StatCard
              label="Users with Credits"
              value={stats.users_with_credits}
              sub="at least 1 credit"
              icon={Users}
              color="bg-emerald-50 text-emerald-500"
            />
            <StatCard
              label="Granted (30d)"
              value={stats.credits_granted_30d}
              sub={`${stats.total_credits_granted} total all-time`}
              icon={TrendingUp}
              color="bg-violet-50 text-violet-500"
            />
            <StatCard
              label="Spent on Wishes (30d)"
              value={stats.credits_spent_30d}
              sub={`${stats.total_credits_spent} total all-time`}
              icon={Sparkles}
              color="bg-rose-50 text-rose-500"
            />
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <select
              value={reason}
              onChange={(e) => { setReason(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm font-medium cursor-pointer"
            >
              {REASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-muted-foreground ml-auto">
            {data?.total ?? 0} transactions total
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1.4fr_0.9fr_1fr_0.8fr_0.7fr] gap-4 px-6 py-4 bg-muted/30 border-b border-border/50">
            {["User", "Reason", "Amount", "Plan / Balance", "Ref / Key", "Date"].map((h) => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          {isLoading && (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold">Loading ledger…</p>
            </div>
          )}

          {!isLoading && rows.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm font-medium">
              No credit transactions found.
            </div>
          )}

          {!isLoading &&
            rows.map((tx, i) => {
              const meta = REASON_LABELS[tx.reason] ?? {
                label: tx.reason,
                icon: Coins,
                color: "text-muted-foreground bg-muted border-transparent",
              };
              const ReasonIcon = meta.icon;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[2fr_1.4fr_0.9fr_1fr_0.8fr_0.7fr] gap-4 px-6 py-3.5 items-center border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {/* User */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {tx.user_name || "Anonymous"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{tx.user_email}</p>
                  </div>

                  {/* Reason badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-lg border ${meta.color}`}>
                      <ReasonIcon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    {tx.lookup_key && (
                      <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">
                        {tx.lookup_key}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1">
                    {tx.amount > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-black ${tx.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>

                  {/* Plan + balance */}
                  <div className="flex flex-col gap-1">
                    <span className={`text-[9px] font-black uppercase tracking-tighter w-fit px-1.5 py-0.5 rounded-md border ${PLAN_COLOR[tx.user_plan] ?? PLAN_COLOR.free}`}>
                      {tx.user_plan}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      bal after: <strong className="text-foreground">{tx.balance_after}</strong>
                    </span>
                  </div>

                  {/* Reference */}
                  <div className="min-w-0">
                    {tx.reference_id ? (
                      <p className="text-[9px] font-mono text-muted-foreground truncate" title={tx.reference_id}>
                        {tx.reference_id.length > 14 ? `${tx.reference_id.substring(0, 14)}…` : tx.reference_id}
                      </p>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {format(new Date(tx.created_at), "MMM d, yyyy")}
                    <span className="block text-[9px] opacity-60">
                      {format(new Date(tx.created_at), "h:mm a")}
                    </span>
                  </span>
                </motion.div>
              );
            })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreditsPage;
