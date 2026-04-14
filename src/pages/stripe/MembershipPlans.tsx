import React, { useState } from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Package,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
  Crown,
  Lock,
  IndianRupee,
  ExternalLink,
  Plus,
  Settings2,
  Trash2,
  Save,
  Globe,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CURRENCY_DETAILS } from "@/lib/constant";

const MembershipPlans = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [creatingPriceFor, setCreatingPriceFor] = useState<string | null>(null);

  // 1. Fetch Plans and Prices
  const { data: plans = [], isLoading: plansLoading } = useQuery<any[]>({
    queryKey: ["adminMembershipPlans"],
    queryFn: () => fetchApi("/membership-plans")
  });

  const { data: globalPrices = [] } = useQuery<any[]>({
    queryKey: ["stripePrices", "all"],
    queryFn: () => fetchApi("/stripe/prices")
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => fetchApi("/membership-plans", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminMembershipPlans"] });
      setIsAdding(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => fetchApi(`/membership-plans/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Plan updated");
      queryClient.invalidateQueries({ queryKey: ["adminMembershipPlans"] });
      setEditingPlan(null);
    },
    onError: (err: any) => toast.error(err.message || "Update failed")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/membership-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["adminMembershipPlans"] });
    },
    onError: (err: any) => toast.error(err.message || "Delete failed")
  });

  const linkPriceMutation = useMutation({
    mutationFn: ({ priceId, lookupKey }: any) =>
      fetchApi(`/stripe/prices/${priceId}`, {
        method: "PATCH",
        body: JSON.stringify({ lookupKey })
      }),
    onSuccess: () => {
      toast.success("Price successfully linked to tier");
      queryClient.invalidateQueries({ queryKey: ["adminMembershipPlans"] });
      queryClient.invalidateQueries({ queryKey: ["stripePrices"] });
      setCreatingPriceFor(null);
    },
    onError: (err: any) => toast.error(err.message || "Linking failed")
  });

  const unlinkPriceMutation = useMutation({
    mutationFn: (priceId: string) =>
      fetchApi(`/stripe/prices/${priceId}`, {
        method: "PATCH",
        body: JSON.stringify({ lookupKey: `unlinked_${Date.now()}` })
      }),
    onSuccess: () => {
      toast.success("Price unlinked");
      queryClient.invalidateQueries({ queryKey: ["adminMembershipPlans"] });
      queryClient.invalidateQueries({ queryKey: ["stripePrices"] });
    },
    onError: (err: any) => toast.error(err.message || "Unlink failed")
  });

  const deletePriceMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/stripe/prices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Price point permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["publicPlans"] });
      queryClient.invalidateQueries({ queryKey: ["stripePrices"] });
    },
    onError: (err: any) => toast.error(err.message || "Price removal failed")
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      display_name: formData.get("display_name") as string,
      description: formData.get("description") as string,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <StripeLayout title="Tier Management" subtitle="Elastic Tiers">
      <div className="space-y-10">
        {/* Header Action */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">Subscription Tiers</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Define and map to Global Prices</p>
          </div>
          <button
            onClick={() => { setEditingPlan(null); setIsAdding(true); }}
            className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" /> Create New Tier
          </button>
        </div>

        {/* Dynamic Plans Table/Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {plansLoading ? (
            <div className="col-span-full h-48 bg-slate-50 rounded-[3rem] animate-pulse" />
          ) : plans.map((plan: any) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={plan.id}
              className="glass-card rounded-[3rem] bg-white border border-slate-100 p-8 shadow-2xl shadow-slate-100 relative group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                    {plan.name === 'free' ? <Package className="w-6 h-6 text-slate-400" /> : plan.name === 'pro' ? <Zap className="w-6 h-6 text-amber-500" /> : plan.name === 'premium' ? <Crown className="w-6 h-6 text-indigo-600" /> : <Gift className="w-6 h-6 text-rose-500" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 leading-none mb-2">{plan.display_name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 lowercase">{plan.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingPlan(plan)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-slate-100 transition-all"><Settings2 className="w-4 h-4" /></button>
                  <button
                    onClick={() => { if (confirm("Delete this tier?")) deleteMutation.mutate(plan.id); }}
                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm border border-slate-100 transition-all font-black"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-500 mb-8 line-clamp-2">{plan.description || "No description provided."}</p>



              {/* Active Prices Mapping & Logic */}
              <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Price Points & Market Linkages</p>
                  </div>
                  {/* Inline Link Existing Toggle */}
                  <button
                    onClick={() => setCreatingPriceFor(creatingPriceFor === plan.id ? null : plan.id)}
                    className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                  >
                    {creatingPriceFor === plan.id ? "Close Selection" : "+ Link Existing Price"}
                  </button>
                </div>

                <AnimatePresence>
                  {creatingPriceFor === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                        <label className="text-[10px] font-black uppercase opacity-50 ml-1">Select Global Price to Attach</label>
                        <div className="grid grid-cols-1 gap-2">
                          {globalPrices
                            .filter((gp: any) => !plan.prices.find(({ lookup_key }) => lookup_key === gp.lookup_key))
                            .map((gp: any) => (
                              <button
                                key={gp.id}
                                onClick={() => linkPriceMutation.mutate({
                                  priceId: gp.id,
                                  lookupKey: gp.lookup_key // Unique enough to match contains logic
                                })}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left transition-all"
                              >
                                <div>
                                  <p className="text-xs font-black">{gp.nickname}</p>
                                  <p className="text-[10px] font-bold opacity-50">{gp.currency.toUpperCase()} {(gp.amount / 100).toFixed(2)}</p>
                                </div>
                                <Plus className="w-4 h-4 opacity-50" />
                              </button>
                            ))}
                          {globalPrices.filter((gp: any) => !gp.lookup_key || !gp.lookup_key.includes(plan.name)).length === 0 && (
                            <p className="text-[10px] opacity-50 italic py-4 text-center">No available unlinked prices. Create one in Global Prices page.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    {plan.prices?.map((price: any) => (
                      <Tooltip key={price.id}>
                        <TooltipTrigger asChild>
                          <div className="group/price flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors cursor-help">
                            <div>
                              <p className="text-[9px] font-black text-slate-800 leading-none mb-1">{price.nickname}</p>
                              <p className={`text-[11px] font-black ${price.is_active ? 'text-emerald-600' : 'text-slate-400'} flex items-center gap-0.5 leading-none`}>
                                {CURRENCY_DETAILS[price.currency]?.symbol}
                                {(price.amount / 100).toLocaleString()}
                                <span className="text-[8px] font-bold text-slate-400 italic">/{price.interval}</span>
                                {!price.is_active && <span className="text-[7px] ml-1 uppercase">(Inactive)</span>}
                                {price.currencyOptions?.length > 1 && (
                                  <span className="ml-1 text-[8px] text-indigo-500">+{price.currencyOptions.length - 1} more</span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Unlink this price from tier? (It will remain in Global Prices)")) unlinkPriceMutation.mutate(price.id);
                              }}
                              className="opacity-0 group-hover/price:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 bg-slate-900 border-none rounded-2xl shadow-2xl">
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Dynamic Conversion Grid</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {price.currencyOptions?.map((opt: any) => (
                                <div key={opt.code} className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-black text-white/40">{opt.code}</span>
                                  <span className="text-[10px] font-black text-white">{opt.symbol}{opt.real_price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )) || (
                        <div className="w-full text-[10px] font-black text-amber-500 bg-amber-50 px-4 py-4 rounded-[1.5rem] border border-amber-100 flex flex-col items-center gap-2 italic">
                          <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> No active pricing detected.</div>
                          <p className="text-[8px] opacity-60 normal-case leading-none">Create a price set above to enable this tier for users.</p>
                        </div>
                      )}
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal for Add/Edit */}
        <Dialog open={isAdding || !!editingPlan} onOpenChange={(open) => { if (!open) { setIsAdding(false); setEditingPlan(null); } }}>
          <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none overflow-hidden bg-white shadow-2xl">
            <DialogHeader className="p-10 pb-0">
              <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                  <Settings2 className="w-6 h-6 text-indigo-600" />
                </div>
                {editingPlan ? "Edit Tier Logic" : "Create New Tier"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="p-10 pt-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Identifier (Must match Price lookup_key)</label>
                  <input name="name" defaultValue={editingPlan?.name} disabled={!!editingPlan} required className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-sm disabled:opacity-50" placeholder="e.g. pro" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Public Display Name</label>
                  <input name="display_name" defaultValue={editingPlan?.display_name} required className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-sm" placeholder="e.g. Pro Membership" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                <textarea name="description" defaultValue={editingPlan?.description} className="w-full h-24 p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-sm resize-none" placeholder="Explain the value proposition..." />
              </div>



              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsAdding(false); setEditingPlan(null); }} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-[2] h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Tier Changes</>}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </StripeLayout>
  );
};

export default MembershipPlans;
