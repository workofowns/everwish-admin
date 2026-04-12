import { useState } from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
   DollarSign,
   Globe,
   Trash2,
   Plus,
   RefreshCw,
   TrendingUp,
   ExternalLink,
   ChevronRight,
   Zap,
   IndianRupee
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StripeProduct {
   id: string;
   name: string;
   description: string;
   stripe_product_id: string;
}

interface StripePrice {
   id: string;
   product_id: string;
   product_name: string;
   nickname: string;
   amount: number;
   currency: string;
   stripe_price_id: string;
   currency_options: Array<{
      currency: string;
      code: string;
      symbol: string;
      unit_price: number;
      real_price: number;
      stripe_price_id: string;
   }>;
   is_active: boolean;
}

const GlobalPrices = () => {
   const queryClient = useQueryClient();

   const { data: productsData } = useQuery<StripeProduct[]>({
      queryKey: ["stripeProducts"],
      queryFn: () => fetchApi("/stripe/products")
   });

   const { data: pricesData, isLoading } = useQuery<StripePrice[]>({
      queryKey: ["stripePrices"],
      queryFn: () => fetchApi("/stripe/prices")
   });

   const createPriceMutation = useMutation({
      mutationFn: (data: any) => fetchApi("/stripe/prices", { method: "POST", body: JSON.stringify(data) }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["stripePrices"] });
         toast.success("Global price generation complete!");
      },
      onError: (e: any) => toast.error(e.message || "Price creation failed")
   });

   const deletePriceMutation = useMutation({
      mutationFn: (id: string) => fetchApi(`/stripe/prices/${id}`, { method: "DELETE" }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["stripePrices"] });
         toast.success("Price point removed");
      },
      onSettled(data, error, variables, context) {
         console.log(data, error, variables, context);
      },
   });

   return (
      <StripeLayout title="Global Prices" subtitle="Multi-Currency Engine">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-8 h-fit">
               <section className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-125 transition-transform duration-1000" />
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                     <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-7 h-7 text-primary" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">New Base Set</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-currency Price Logic</p>
                     </div>
                  </div>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const pId = formData.get("productId") as string;
                     console.log({
                        productId: pId === "standalone" ? undefined : pId,
                        nickname: formData.get("nickname") as string,
                        amount: Math.round(parseFloat(formData.get("amount") as string) * 100),
                        currency: formData.get("currency") as string,
                        type: formData.get("type") as string,
                        billingInterval: formData.get("billingInterval") as string,
                        lookupKey: formData.get("lookupKey") as string,
                     })
                     createPriceMutation.mutate({
                        productId: pId === "standalone" ? undefined : pId,
                        nickname: formData.get("nickname") as string,
                        amount: Math.round(parseFloat(formData.get("amount") as string) * 100),
                        currency: formData.get("currency") as string,
                        type: formData.get("type") as string,
                        billingInterval: formData.get("billingInterval") as string,
                        lookupKey: formData.get("lookupKey") as string,
                     });
                     // e.currentTarget.reset();
                  }} className="space-y-8 relative z-10">

                     <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1 leading-none mb-1">
                           <label className="text-[10px] font-black tracking-widest uppercase text-slate-500">Root Product</label>
                           <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 uppercase tracking-widest opacity-80">Default Storage</span>
                        </div>
                        <Select name="productId" defaultValue="standalone">
                           <SelectTrigger className="w-full h-16 px-6 rounded-[1.5rem] bg-slate-50/50 border-slate-100 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-primary/10 outline-none">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl shadow-2xl border-slate-100 overflow-hidden">
                              <SelectItem value="standalone" className="p-3 font-bold text-slate-500 italic">Universal Price Point</SelectItem>
                              {productsData?.map(p => (
                                 <SelectItem key={p.id} value={p.id} className="p-3 font-bold">{p.name}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Nickname</label>
                        <input name="nickname" required className="w-full h-16 px-6 rounded-[1.5rem] bg-slate-50/50 border-slate-100 text-sm font-bold outline-none border-2 border-primary/10 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300" placeholder="E.g. Early Bird" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Base Amount</label>
                           <input name="amount" type="number" step="0.01" required className="w-full h-16 px-6 rounded-[1.5rem] bg-primary/5 border-2 border-primary/10 text-sm font-black outline-none focus:ring-2 focus:ring-primary/10 transition-all" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Currency</label>
                           <Select name="currency" defaultValue="INR">
                              <SelectTrigger className="w-full h-16 px-6 rounded-[1.5rem] bg-slate-50/50 border-slate-100 text-sm font-bold shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary/10">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                 <SelectItem value="INR" className="p-3 font-bold">INR (₹)</SelectItem>
                                 <SelectItem value="USD" className="p-3 font-bold">USD ($)</SelectItem>
                                 <SelectItem value="EUR" className="p-3 font-bold">EUR (€)</SelectItem>
                                 <SelectItem value="GBP" className="p-3 font-bold">GBP (£)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Type</label>
                           <Select name="type" defaultValue="one_time">
                              <SelectTrigger className="w-full h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-xs font-bold outline-none">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                 <SelectItem value="one_time" className="text-xs font-bold">One-time</SelectItem>
                                 <SelectItem value="recurring" className="text-xs font-bold">Recurring (Sub)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Interval</label>
                           <Select name="billingInterval" defaultValue="month">
                              <SelectTrigger className="w-full h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-xs font-bold outline-none">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                 <SelectItem value="month" className="text-xs font-bold">Monthly</SelectItem>
                                 <SelectItem value="year" className="text-xs font-bold">Yearly</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Lookup Key (Match Tier ID)</label>
                        <Select name="lookupKey" defaultValue="">
                           <SelectTrigger className="w-full h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-xs font-bold outline-none">
                              <SelectValue placeholder="Select Lookup Key" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              <SelectItem value="price_pro_monthly" className="text-xs font-bold">Pro Monthly</SelectItem>
                              <SelectItem value="price_pro_yearly" className="text-xs font-bold">Pro Yearly</SelectItem>
                              <SelectItem value="price_premium_monthly" className="text-xs font-bold">Premium Monthly</SelectItem>
                              <SelectItem value="price_premium_yearly" className="text-xs font-bold">Premium Yearly</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <button
                        type="submit"
                        disabled={createPriceMutation.isPending}
                        className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                     >
                        {createPriceMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 text-white" /> Generate Global Set</>}
                     </button>
                  </form>
               </section>
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-8">
               <div className="mb-4">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 ml-1">
                     Global Price Grid
                     <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-tighter italic">
                        Synced to 20+ markets
                     </span>
                  </h2>
               </div>

               {isLoading ? <div>Loading Grid...</div> : (
                  <div className="grid gap-8">
                     {pricesData?.map(price => (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={price.id} className="glass-card overflow-hidden rounded-[3rem] border border-slate-100 bg-white group hover:shadow-2xl transition-all duration-500 shadow-xl shadow-slate-100">
                           {/* Header Card Area */}
                           <header className="p-8 pb-4 flex flex-col md:flex-row justify-between md:items-center gap-6 relative">
                              <div className="flex items-center gap-6 group/info">
                                 <div className="w-16 h-16 rounded-[1.2rem] btn-primary shadow-none hover:shadow-none flex items-center justify-center relative transition-transform">
                                    <IndianRupee className="w-8 h-8 text-white" />
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/info:opacity-100 transition-opacity" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                       <h4 className="text-xl font-black text-slate-900">{price.nickname}</h4>
                                       <span className="text-[8px] bg-slate-100 text-slate-400 font-black px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-[0.1em]">{price.product_name}</span>
                                    </div>
                                    <code className="text-[10px] font-mono text-slate-400 font-black tracking-tight leading-none uppercase">{price.stripe_price_id}</code>
                                 </div>
                              </div>

                              <div className="flex items-center gap-8 md:text-right">
                                 <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Base Value</p>
                                    <p className="text-2xl font-black text-primary leading-none">
                                       {(price.amount / 100).toFixed(2)} <span className="text-sm font-bold opacity-80">{price.currency.toUpperCase()}</span>
                                    </p>
                                 </div>
                                 <div className="flex gap-2">
                                    <a href={`https://dashboard.stripe.com/prices/${price.stripe_price_id}`} target="_blank" className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-white shadow-sm border border-slate-100 transition-all">
                                       <ExternalLink className="w-5 h-5" />
                                    </a>
                                    <button
                                       onClick={() => { if (confirm("Deregister pricing?")) deletePriceMutation.mutate(price.id); }}
                                       className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm border border-slate-100 transition-all"
                                    >
                                       <Trash2 className="w-5 h-5" />
                                    </button>
                                 </div>
                              </div>
                           </header>

                           {/* Conversion Subgrid */}
                           <div className="p-8 pt-6 mt-4 border-t border-slate-50 bg-slate-50/20 group-hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-2 mb-6">
                                 <TrendingUp className="w-4 h-4 text-emerald-500" />
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1 leading-none">
                                    Market conversion grid <Globe className="w-3 h-3 ml-1" />
                                 </p>
                              </div>
                              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                 {(price.currency_options || []).map((opt) => (
                                    <div key={opt.code} className="p-4 rounded-2xl bg-white border border-slate-100 flex flex-col items-center group/opt hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                       <span className="text-[9px] font-black text-slate-400 group-hover/opt:text-primary transition-all uppercase mb-1 tracking-tighter">{opt.code}</span>
                                       <span className="text-[11px] font-black text-slate-800">{opt.symbol}{opt.real_price.toFixed(2)}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               )}

               {pricesData?.length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/10 grayscale opacity-40">
                     <Globe className="w-12 h-12 text-slate-200 mb-4" />
                     <h3 className="section-header text-xl">Cloud Registry Empty</h3>
                     <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed mt-2 uppercase tracking-wide italic">Start by generating a base multi-currency set.</p>
                  </div>
               )}
            </div>
         </div>
      </StripeLayout>
   );
};

export default GlobalPrices;
