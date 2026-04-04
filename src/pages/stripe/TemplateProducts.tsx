import { useState } from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { 
  Plus, 
  RefreshCw, 
  Package, 
  ExternalLink,
  ChevronRight,
  Search,
  CheckCircle2,
  PackageCheck
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  template_name: string;
  type: "free" | "premium";
  price: number;
  currency: string;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  thumbnail_url?: string;
}

const TemplateProducts = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: templatesData, isLoading } = useQuery<{ rows: Template[] }>({
    queryKey: ["adminTemplates", "stripe-view"],
    queryFn: () => fetchApi("/templates?limit=100"),
  });

  const templates = templatesData?.rows || [];
  const premiumTemplates = templates.filter(t => t.type === "premium");
  const syncedTemplates = premiumTemplates.filter(t => t.stripe_product_id);
  const unsyncedTemplates = premiumTemplates.filter(t => !t.stripe_product_id);
  const selectedTemplate = premiumTemplates.find(t => t.id === selectedId);

  const syncMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/templates/${id}/stripe-sync`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      toast.success("Template synced with Stripe");
      setSelectedId("");
    },
    onError: (e: any) => toast.error(e.message || "Sync failed")
  });

  return (
    <StripeLayout title="Templates" subtitle="Sync Engine">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Sync Form */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                   <Plus className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Sync Asset</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Register Template on Stripe</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 ml-1">Premium Template</label>
                   <Select value={selectedId} onValueChange={setSelectedId}>
                      <SelectTrigger className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-slate-100 text-sm font-bold shadow-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100">
                         <SelectValue placeholder="Pick a template..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                         {unsyncedTemplates.map(t => (
                            <SelectItem key={t.id} value={t.id} className="p-3 font-bold rounded-xl cursor-pointer">
                               {t.name}
                            </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                <AnimatePresence mode="wait">
                   {selectedTemplate ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                               {selectedTemplate.thumbnail_url ? (
                                  <img src={selectedTemplate.thumbnail_url} className="w-full h-full object-cover" />
                               ) : <Package className="w-8 h-8 text-slate-200" />}
                            </div>
                            <div>
                               <h5 className="font-black text-slate-900">{selectedTemplate.name}</h5>
                               <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase inline-block">
                                  {(selectedTemplate.price / 100).toFixed(2)} {selectedTemplate.currency.toUpperCase()}
                               </p>
                            </div>
                         </div>

                         <button 
                            onClick={() => syncMutation.mutate(selectedTemplate.id)}
                            disabled={syncMutation.isPending}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                         >
                            {syncMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><PackageCheck className="w-5 h-5" /> Push to Stripe</>}
                         </button>
                      </motion.div>
                   ) : (
                      <div className="h-48 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/20 flex flex-col items-center justify-center text-center p-8 opacity-40">
                         <Package className="w-10 h-10 text-slate-200 mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No template selected</p>
                      </div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 ml-1">
                 Active Catalog
                 <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                   {syncedTemplates.length} Registered
                 </span>
              </h2>
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input className="pl-11 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-xs font-bold shadow-sm group-hover:border-slate-200" placeholder="Filter synced items..." />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {syncedTemplates.map(t => (
                 <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} className="glass-card p-6 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all group overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                       <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                              {t.thumbnail_url ? <img src={t.thumbnail_url} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-200" />}
                           </div>
                           <div>
                              <h4 className="font-black text-slate-800 line-clamp-1">{t.name}</h4>
                              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{t.stripe_product_id}</p>
                           </div>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-[8px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-lg shadow-sm border border-emerald-600/10 uppercase tracking-widest leading-none">Synced</span>
                          <span className="text-[9px] font-black text-slate-300 italic uppercase">#{t.template_name}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                       <div className="text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pricing Set</p>
                          <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-none">
                             {(t.price / 100).toFixed(2)} <span className="text-xs">{t.currency.toUpperCase()}</span>
                          </p>
                       </div>
                       <div className="flex items-center gap-2">
                          <a href={`https://dashboard.stripe.com/products/${t.stripe_product_id}`} target="_blank" className="p-3 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-slate-100 transition-all">
                             <ExternalLink className="w-4 h-4" />
                          </a>
                          <button className="p-3 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-slate-100 transition-all">
                             <RefreshCw className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>

           {syncedTemplates.length === 0 && (
             <div className="h-64 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/10 grayscale opacity-40">
                <Package className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="section-header text-xl">Cloud Catalog Empty</h3>
                <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed mt-2 uppercase tracking-wide">Sync premium templates above to start selling them as Stripe products.</p>
             </div>
           )}
        </div>
      </div>
    </StripeLayout>
  );
};

export default TemplateProducts;
