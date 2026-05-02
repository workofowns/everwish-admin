import { useState } from "react";
import RazorpayLayout from "@/components/razorpay/RazorpayLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Crown,
  IndianRupee,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Link2,
  Calendar,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RazorpayPlan {
  id: string;
  name: string;
  description?: string;
  plan_name: "free" | "pay_per_moment" | "pro" | "premium";
  billing_interval: "month" | "year" | "one_time";
  lookup_key: string;
  currency: string;
  amount: number;
  razorpay_plan_id: string | null;
  is_active?: boolean;
  credits_per_cycle: number;
  price_nickname?: string;
  razorpay_price_id?: string;
}

interface RazorpayPrice {
  id: string;
  nickname: string;
  lookup_key?: string;
  billing_interval?: string;
  type?: string;
}

const LOOKUP_KEYS = [
  { value: "free",                  label: "Free Plan",       planName: "free",           interval: "one_time", credits: 0 },
  { value: "pay_per_moment",        label: "Pay Per Moment",  planName: "pay_per_moment", interval: "one_time", credits: 1 },
  { value: "price_pro_monthly",     label: "Pro Monthly",     planName: "pro",            interval: "month",    credits: 10 },
  { value: "price_pro_yearly",      label: "Pro Yearly",      planName: "pro",            interval: "year",     credits: 120 },
  { value: "price_premium_monthly", label: "Premium Monthly", planName: "premium",        interval: "month",    credits: 25 },
  { value: "price_premium_yearly",  label: "Premium Yearly",  planName: "premium",        interval: "year",     credits: 300 },
];

const PLAN_COLORS = {
  free:           { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  icon: "bg-slate-500" },
  pay_per_moment: { bg: "bg-rose-50",   border: "border-rose-100",   text: "text-rose-600",   icon: "bg-rose-500" },
  pro:            { bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600",   icon: "bg-blue-600" },
  premium:        { bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-600",  icon: "bg-amber-500" },
};

const RazorpayPlans = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLookup, setSelectedLookup] = useState("");

  const { data: plans = [], isLoading } = useQuery<RazorpayPlan[]>({
    queryKey: ["razorpayPlans"],
    queryFn: () => fetchApi("/razorpay/plans"),
  });

  const { data: prices = [] } = useQuery<RazorpayPrice[]>({
    queryKey: ["razorpayPrices"],
    queryFn: () => fetchApi("/razorpay/prices"),
  });

  const recurringPrices = prices.filter((p) => p.type === "recurring");

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetchApi("/razorpay/plans", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Plan created in Razorpay & saved to DB ✓");
      queryClient.invalidateQueries({ queryKey: ["razorpayPlans"] });
      setIsCreating(false);
    },
    onError: (e: any) => toast.error(e.message || "Plan creation failed"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      fetchApi(`/razorpay/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["razorpayPlans"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/razorpay/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Plan removed from DB");
      queryClient.invalidateQueries({ queryKey: ["razorpayPlans"] });
    },
  });

  const selectedKeyMeta = LOOKUP_KEYS.find((k) => k.value === selectedLookup);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawAmount = parseFloat(fd.get("amount") as string);

    createMutation.mutate({
      name: fd.get("name") as string,
      description: fd.get("description") as string || undefined,
      planName: selectedKeyMeta?.planName ?? (fd.get("planName") as string),
      billingInterval: selectedKeyMeta?.interval ?? (fd.get("billingInterval") as string),
      lookupKey: selectedLookup,
      currency: (fd.get("currency") as string).toUpperCase(),
      amount: (selectedKeyMeta?.planName === "free") ? 0 : Math.round(rawAmount * 100),
      creditsPerCycle: selectedKeyMeta?.credits ?? parseInt(fd.get("creditsPerCycle") as string, 10),
      razorpayPriceId: (() => { const v = fd.get("razorpayPriceId") as string; return v && v !== "none" ? v : null; })(),
    });
  };

  const freePlans = plans.filter((p) => p.plan_name === "free");
  const ppmPlans = plans.filter((p) => p.plan_name === "pay_per_moment");
  const proPlans = plans.filter((p) => p.plan_name === "pro");
  const premiumPlans = plans.filter((p) => p.plan_name === "premium");

  return (
    <RazorpayLayout title="Subscription Plans" subtitle="Live Razorpay Sync">
      <div className="space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">Subscription Plans</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Creates real plans in Razorpay dashboard • {plans.length} configured
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live API Sync</span>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-100"
            >
              <Plus className="w-4 h-4" /> Create Plan
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-black text-white text-sm leading-none mb-1">How Plans Work</h4>
            <p className="text-[11px] font-medium text-white/60 leading-relaxed max-w-2xl">
              Creating a plan here calls the <code className="text-blue-400 font-bold">Razorpay Plans API</code> to generate a real Plan ID (e.g. <code className="text-blue-400">plan_xxx</code>).
              The frontend uses this Plan ID to call <code className="text-blue-400">/payments/razorpay/subscription</code> and subscribe users. Credits per cycle are granted on every successful renewal webhook.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-600/10" />
        </div>

        {/* Plans Grid — grouped by tier */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-[3rem] bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-blue-100 rounded-[3.5rem] bg-blue-50/10 opacity-40">
            <Layers className="w-14 h-14 text-blue-200 mb-4" />
            <h3 className="text-xl font-black text-slate-400">No Plans Yet</h3>
            <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed mt-2 uppercase tracking-wide italic">
              Click "Create Plan" to sync a subscription plan to Razorpay.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { label: "Free Tier",    plans: freePlans,    color: PLAN_COLORS.free,           icon: CheckCircle2 },
              { label: "One-Time Pay", plans: ppmPlans,     color: PLAN_COLORS.pay_per_moment, icon: Zap },
              { label: "Pro Tier",     plans: proPlans,     color: PLAN_COLORS.pro,            icon: Crown },
              { label: "Premium Tier", plans: premiumPlans, color: PLAN_COLORS.premium,        icon: Zap },
            ].map(({ label, plans: tierPlans, color, icon: Icon }) =>
              tierPlans.length > 0 ? (
                <div key={label}>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">
                    {label}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tierPlans.map((plan) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={plan.id}
                        className={`rounded-[3rem] border bg-white p-8 shadow-xl shadow-slate-100 relative group overflow-hidden transition-all hover:shadow-2xl ${color.border}`}
                      >
                        {/* Background decoration */}
                        <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${color.bg} opacity-60 group-hover:scale-150 transition-transform duration-700`} />

                        {/* Header */}
                        <div className="relative z-10 flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${color.icon} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 leading-none mb-1">{plan.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${color.bg} ${color.text} ${color.border}`}>
                                  {plan.plan_name}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
                                  {plan.billing_interval === "one_time" ? "One-Time" : `${plan.billing_interval}ly`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleMutation.mutate({ id: plan.id, is_active: !plan.is_active })}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-slate-500"
                              title={plan.is_active ? "Deactivate" : "Activate"}
                            >
                              {plan.is_active !== false ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Remove this plan from DB? Razorpay plan will remain archived."))
                                  deleteMutation.mutate(plan.id);
                              }}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all text-slate-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 leading-none">Amount</p>
                            <p className="text-sm font-black text-slate-900 flex items-center gap-0.5">
                              {plan.amount > 0 ? (
                                <>
                                  <IndianRupee className="w-3 h-3" />
                                  {(plan.amount / 100).toLocaleString()}
                                </>
                              ) : (
                                "Free"
                              )}
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 leading-none">Credits</p>
                            <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                              <Coins className="w-3 h-3 text-amber-500" />
                              {plan.credits_per_cycle}
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 leading-none">Currency</p>
                            <p className="text-sm font-black text-slate-900">{plan.currency.toUpperCase()}</p>
                          </div>
                        </div>

                        {/* Plan ID + Links */}
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                            <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1">Razorpay Plan ID</p>
                              {plan.razorpay_plan_id ? (
                                <code className="text-[11px] font-mono text-blue-400 font-bold">{plan.razorpay_plan_id}</code>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 italic">No Sync Needed</span>
                              )}
                            </div>
                            {plan.razorpay_plan_id && (
                              <a
                                href={`https://dashboard.razorpay.com/app/subscriptions/plans/${plan.razorpay_plan_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                title="View in Razorpay"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Lookup Key</p>
                              <code className="text-[10px] font-mono text-blue-600 font-bold">{plan.lookup_key}</code>
                            </div>
                            <span className={`ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${plan.is_active !== false ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"}`}>
                              {plan.is_active !== false ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {plan.price_nickname && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                              <p className="text-[9px] font-bold text-blue-600 italic">
                                Linked price: <span className="font-black">{plan.price_nickname}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      <Dialog open={isCreating} onOpenChange={(o) => !o && setIsCreating(false)}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 border-none overflow-hidden bg-white shadow-2xl">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              Create Razorpay Plan
            </DialogTitle>
            <p className="text-[11px] font-medium text-slate-400 mt-2 ml-[64px]">
              This will call the Razorpay API and create a real plan. The plan ID will be stored and used for subscriptions.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="p-10 pt-6 space-y-5">
            {/* Lookup Key (master selector — auto-fills planName + interval + credits) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lookup Key (Tier)</label>
              <Select
                value={selectedLookup}
                onValueChange={(val) => setSelectedLookup(val)}
              >
                <SelectTrigger className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 text-sm font-bold outline-none">
                  <SelectValue placeholder="Select plan tier..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {LOOKUP_KEYS.map((k) => (
                    <SelectItem key={k.value} value={k.value} className="font-bold text-sm p-3">
                      {k.label}
                      <span className="text-slate-400 text-xs ml-2">({k.credits} credits)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedKeyMeta && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-[10px] font-bold text-blue-700">
                  Auto-fill: Plan = <b>{selectedKeyMeta.planName}</b> · Interval = <b>{selectedKeyMeta.interval}</b> · Credits/cycle = <b>{selectedKeyMeta.credits}</b>
                </p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Display Name</label>
              <input
                name="name"
                required
                defaultValue={selectedKeyMeta ? `EverWish ${selectedKeyMeta.label}` : ""}
                key={selectedLookup} // re-render on key change
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm transition-all"
                placeholder="e.g. EverWish Pro Monthly"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description (optional)</label>
              <input
                name="description"
                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 outline-none font-medium text-sm transition-all"
                placeholder="Short description shown to subscribers"
              />
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 outline-none font-black text-base transition-all"
                  placeholder="e.g. 499"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Currency</label>
                <Select name="currency" defaultValue="INR">
                  <SelectTrigger className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent text-sm font-bold outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="INR" className="font-bold p-3">INR — Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD" className="font-bold p-3">USD — US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link to Razorpay Price (optional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Link to Razorpay Price Set (optional)
              </label>
              {recurringPrices.length > 0 && <Select name="razorpayPriceId" defaultValue="none">
                <SelectTrigger className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent text-xs font-bold outline-none">
                  <SelectValue placeholder="No linked price" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="none" className="font-bold text-slate-400 p-3 italic">None</SelectItem>
                  {recurringPrices.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="font-bold p-3 text-xs">
                      {p.nickname} {p.lookup_key ? `· ${p.lookup_key}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !selectedLookup}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Sync to Razorpay
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </RazorpayLayout>
  );
};

export default RazorpayPlans;
