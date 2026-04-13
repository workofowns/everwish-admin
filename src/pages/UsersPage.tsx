import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Search, ChevronDown, ShieldCheck, ShieldAlert, BadgeCheck,
  Trash2, UserCog, Loader2, Coins, PlusCircle, MinusCircle,
  History, X, TrendingUp, TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// ── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  display_name: string;
  email: string;
  plan: "free" | "pro" | "premium";
  role: string;
  is_verified: boolean;
  credits: number;
  created_at: string;
}

interface UsersResponse {
  rows: User[];
  total: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  reference_id: string | null;
  lookup_key: string | null;
  created_at: string;
}

interface CreditHistoryResponse {
  data: CreditTransaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<string, string> = {
  premium: "bg-amber-50 text-amber-600 border-amber-200",
  pro:     "bg-violet-50 text-violet-600 border-violet-200",
  free:    "bg-muted text-muted-foreground border-transparent",
};

const REASON_LABEL: Record<string, string> = {
  subscription_renewal: "Subscription Renewal",
  wish_creation:        "Wish Created",
  admin_adjustment:     "Admin Adjustment",
  subscription_canceled:"Subscription Canceled",
  backfill_pro_plan_credits: "Backfill (Pro Plan)",
};

// ── Credit History Modal ─────────────────────────────────────────────────────

function CreditHistoryModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery<CreditHistoryResponse>({
    queryKey: ["creditHistory", user.id],
    queryFn: () => fetchApi(`/users/${user.id}/credits/history?limit=30`),
  });

  const transactions = data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
              Credit Ledger
            </p>
            <h3 className="text-base font-bold text-foreground">
              {user.display_name || user.email}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-primary/8 text-primary px-3 py-1.5 rounded-xl">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-sm font-black">{user.credits} credits</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm">Loading history…</span>
            </div>
          )}

          {!isLoading && transactions.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No credit transactions yet.
            </div>
          )}

          {!isLoading && transactions.length > 0 && (
            <div className="divide-y divide-border/50">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.amount > 0
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {REASON_LABEL[tx.reason] ?? tx.reason}
                    </p>
                    {tx.lookup_key && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {tx.lookup_key}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(tx.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-black ${
                        tx.amount > 0 ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      bal: {tx.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground">
            Showing last {transactions.length} of {data?.meta.total ?? 0} transactions
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [filterPlan, setFilterPlan]     = useState<"all" | "free" | "pro" | "premium">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [historyUser, setHistoryUser]   = useState<User | null>(null);

  // Credit adjustment state per user
  const [creditAmount, setCreditAmount] = useState<Record<string, number>>({});
  const [creditReason, setCreditReason] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["adminUsers", search],
    queryFn: () => fetchApi(`/users?search=${encodeURIComponent(search)}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      fetchApi(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User updated successfully");
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User deleted permanently");
    },
    onError: (e: any) => toast.error(e.message || "Deletion failed"),
  });

  const creditMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      fetchApi(`/users/${id}/credits`, {
        method: "PATCH",
        body: JSON.stringify({ amount, reason }),
      }),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["creditHistory", vars.id] });
      setCreditAmount((prev) => ({ ...prev, [vars.id]: 0 }));
      setCreditReason((prev) => ({ ...prev, [vars.id]: "" }));
      toast.success(`Credits adjusted. New balance: ${data.newBalance}`);
    },
    onError: (e: any) => toast.error(e.message || "Credit adjustment failed"),
  });

  const handleCreditAdjust = (user: User, sign: 1 | -1) => {
    const amount = (creditAmount[user.id] || 0) * sign;
    const reason = (creditReason[user.id] || "").trim();

    if (!amount || amount === 0) return toast.error("Enter a non-zero credit amount");
    if (!reason) return toast.error("Enter a reason for this adjustment");

    creditMutation.mutate({ id: user.id, amount, reason });
  };

  const activeUsers = data?.rows || [];
  const filtered = activeUsers.filter(
    (u) => filterPlan === "all" || u.plan === filterPlan
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="sub-label mb-1">User Management</p>
          <h1 className="section-header text-3xl">Users</h1>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(["all", "free", "pro", "premium"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                filterPlan === plan
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1.2fr_0.55fr_0.55fr_0.55fr_0.7fr_0.4fr] gap-4 px-6 py-4 bg-muted/30 border-b border-border/50">
            {["Name", "Email", "Plan", "Role", "Credits", "Joined", ""].map((h) => (
              <span
                key={h}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                {h}
              </span>
            ))}
          </div>

          {isLoading && (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold">Fetching user database...</p>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm font-medium">
              No users match your criteria.
            </div>
          )}

          {!isLoading &&
            filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Row */}
                <div
                  className={`grid grid-cols-[1fr_1.2fr_0.55fr_0.55fr_0.55fr_0.7fr_0.4fr] gap-4 px-6 py-4 transition-all cursor-pointer items-center group border-b border-border/30 ${
                    expandedUser === user.id
                      ? "bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() =>
                    setExpandedUser(expandedUser === user.id ? null : user.id)
                  }
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex-shrink-0 ${
                        user.plan === "premium"
                          ? "gradient-accent"
                          : user.plan === "pro"
                          ? "bg-violet-500"
                          : "btn-primary shadow-none"
                      } flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform`}
                    >
                      {(user.display_name || user.email)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[120px]">
                        {user.display_name || "Anonymous"}
                      </p>
                      {user.is_verified && (
                        <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                          <BadgeCheck className="w-2 h-2" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {user.email}
                  </span>

                  {/* Plan */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-tighter w-fit px-2 py-0.5 rounded-lg border ${
                      PLAN_BADGE[user.plan] ?? PLAN_BADGE.free
                    }`}
                  >
                    {user.plan}
                  </span>

                  {/* Role */}
                  <span className="text-[10px] font-bold text-foreground capitalize bg-foreground/5 px-2 py-0.5 rounded-lg w-fit">
                    {user.role}
                  </span>

                  {/* Credits */}
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-black text-foreground">
                      {user.credits ?? 0}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="text-xs font-semibold text-muted-foreground">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </span>

                  {/* Chevron */}
                  <div className="flex justify-end">
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        expandedUser === user.id ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Panel */}
                <AnimatePresence>
                  {expandedUser === user.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 ml-6 mr-6 mb-4 mt-1 rounded-[1.5rem] bg-white border border-border flex flex-col lg:flex-row gap-6">
                        
                        {/* ── Left: User Info ── */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCog className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                              Management Console
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-medium text-muted-foreground">
                            <div>
                              <strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">
                                System ID
                              </strong>
                              <span className="font-mono text-[10px]">{user.id}</span>
                            </div>
                            <div>
                              <strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">
                                Verification
                              </strong>
                              {user.is_verified ? "Authenticated" : "Unverified"}
                            </div>
                            <div>
                              <strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">
                                Plan
                              </strong>
                              {user.plan.toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">
                                Role
                              </strong>
                              {user.role.toUpperCase()}
                            </div>
                          </div>

                          {/* ── Credit Adjustment Panel ── */}
                          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200/60">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                                  Credit Adjustment
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white border border-amber-200 px-2.5 py-1 rounded-lg">
                                <Coins className="w-3 h-3 text-amber-500" />
                                <span className="text-xs font-black text-amber-700">
                                  {user.credits ?? 0} balance
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* Amount input */}
                              <input
                                type="number"
                                min="1"
                                placeholder="Amount"
                                value={creditAmount[user.id] || ""}
                                onChange={(e) =>
                                  setCreditAmount((prev) => ({
                                    ...prev,
                                    [user.id]: Math.abs(parseInt(e.target.value) || 0),
                                  }))
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-24 px-3 py-2 text-sm font-bold rounded-xl bg-white border border-amber-200 outline-none focus:ring-2 focus:ring-amber-300 text-center"
                              />

                              {/* Reason input */}
                              <input
                                type="text"
                                placeholder="Reason (required)"
                                value={creditReason[user.id] || ""}
                                onChange={(e) =>
                                  setCreditReason((prev) => ({
                                    ...prev,
                                    [user.id]: e.target.value,
                                  }))
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-3 py-2 text-sm rounded-xl bg-white border border-amber-200 outline-none focus:ring-2 focus:ring-amber-300"
                              />
                            </div>

                            <div className="flex gap-2 mt-2">
                              {/* Add button */}
                              <button
                                disabled={creditMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreditAdjust(user, 1);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black transition-colors disabled:opacity-50"
                              >
                                {creditMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <PlusCircle className="w-3.5 h-3.5" />
                                )}
                                Add Credits
                              </button>

                              {/* Deduct button */}
                              <button
                                disabled={creditMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreditAdjust(user, -1);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black transition-colors disabled:opacity-50"
                              >
                                {creditMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <MinusCircle className="w-3.5 h-3.5" />
                                )}
                                Deduct Credits
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Right: Action Buttons ── */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMutation.mutate({
                                id: user.id,
                                payload: {
                                  plan: user.plan === "premium" ? "free" : "premium",
                                },
                              });
                            }}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-primary/5 transition-colors group"
                          >
                            <span className="text-[10px] font-bold">Toggle Plan</span>
                            {user.plan === "premium" ? (
                              <ShieldAlert className="w-4 h-4 text-amber-500" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMutation.mutate({
                                id: user.id,
                                payload: { isVerified: !user.is_verified },
                              });
                            }}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-blue-50 transition-colors group"
                          >
                            <span className="text-[10px] font-bold">Verification</span>
                            <BadgeCheck
                              className={`w-4 h-4 ${
                                user.is_verified
                                  ? "text-blue-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>

                          {/* Credit History button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryUser(user);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors group"
                          >
                            <span className="text-[10px] font-bold">Credit History</span>
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Hard delete this user? This cannot be undone."
                                )
                              )
                                deleteMutation.mutate(user.id);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group mt-2"
                          >
                            <span className="text-[10px] font-bold">Delete Account</span>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Credit History Modal */}
      <AnimatePresence>
        {historyUser && (
          <CreditHistoryModal
            user={historyUser}
            onClose={() => setHistoryUser(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default UsersPage;
