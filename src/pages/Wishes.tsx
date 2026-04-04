import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Sparkles, 
  Search, 
  Trash2, 
  Eye, 
  ExternalLink, 
  LayoutGrid, 
  User, 
  Calendar,
  Share2,
  TrendingUp,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Wish {
  id: string;
  user_id?: string;
  template_id: string;
  template_name: string;
  view_count: number;
  share_count: number;
  created_at: string;
  template_thumbnail?: string;
}

const Wishes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  const { data: wishesRes, isLoading } = useQuery({
    queryKey: ["adminWishes"],
    queryFn: () => fetchApi("/wishes"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/wishes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWishes"] });
      toast.success("Wish deleted successfully");
      setSelectedWish(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete wish")
  });

  const wishes = wishesRes?.data || [];
  const filtered = wishes.filter((w: Wish) => 
    w.template_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.id.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="sub-label mb-1">Content Management</p>
            <h1 className="section-header text-3xl">Wishes</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search wishes..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            <p>Loading wishes...</p>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card rounded-[2rem]">
               <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
               <h3 className="text-xl font-bold">No wishes created yet</h3>
               <p className="text-sm text-muted-foreground">User interaction will show up here.</p>
            </div>
          ) : (
            filtered.map((wish: Wish, i: number) => (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all border border-border"
              >
                <div className="h-32 bg-primary/5 flex items-center justify-center text-4xl relative">
                  🕉️
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       onClick={() => setSelectedWish(wish)}
                       className="p-2 rounded-xl bg-white/90 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                     >
                        <Eye className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div className="p-6">
                   <h3 className="font-bold text-base truncate">{wish.template_name}</h3>
                   <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5" title="Views">
                         <Eye className="w-3.5 h-3.5 text-blue-500" />
                         <span className="text-xs font-bold text-muted-foreground">{wish.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Shares">
                         <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-xs font-bold text-muted-foreground">{wish.share_count}</span>
                      </div>
                      <div className="ml-auto">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                           {format(new Date(wish.created_at), "MMM d")}
                        </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal Detail View */}
        <AnimatePresence>
          {selectedWish && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
              onClick={() => setSelectedWish(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl border border-border p-10 overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                 <button onClick={() => setSelectedWish(null)} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-muted text-muted-foreground">
                   <X className="w-5 h-5" />
                 </button>

                 <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-4xl mb-4 text-primary">
                       ✨
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedWish.template_name}</h2>
                    <p className="text-sm text-muted-foreground font-mono mt-1 opacity-60">{selectedWish.id}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatBox icon={Eye} label="Impressions" value={selectedWish.view_count} color="text-blue-500" />
                    <StatBox icon={Share2} label="Engagements" value={selectedWish.share_count} color="text-emerald-500" />
                 </div>

                 <div className="space-y-4 pt-6 border-t border-border/50">
                    <DetailItem icon={Calendar} label="Created On" value={format(new Date(selectedWish.created_at), "PPP p")} />
                    <DetailItem icon={LayoutGrid} label="Template Component" value={selectedWish.template_name} />
                    <DetailItem icon={User} label="User Identity" value={selectedWish.user_id ? "Authenticated User" : "Guest User"} />
                 </div>

                 <div className="flex items-center gap-3 mt-10">
                    <button
                      onClick={() => { if(window.confirm("Delete this wish permanently?")) deleteMutation.mutate(selectedWish.id); }}
                      className="flex-1 py-3.5 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                       <Trash2 className="w-4 h-4" /> Delete Wish
                    </button>
                    <a
                      href={`http://localhost:3000/wish/${selectedWish.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                       className="px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                       <ExternalLink className="w-4 h-4" /> Live View
                    </a>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

const StatBox = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="glass-card p-4 rounded-2xl border border-border/50 flex flex-col items-center">
    <Icon className={`w-5 h-5 mb-2 ${color}`} />
    <p className="text-xl font-black">{value}</p>
    <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mt-0.5">{label}</p>
  </div>
);

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
       <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
       <p className="text-xs font-semibold text-foreground truncate">{value}</p>
    </div>
  </div>
);

export default Wishes;
