import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Search, ChevronDown, ShieldCheck, ShieldAlert, BadgeCheck, Trash2, UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
  id: string;
  display_name: string;
  email: string;
  plan: "free" | "premium";
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface UsersResponse {
  rows: User[];
  total: number;
}

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "premium">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["adminUsers", search],
    queryFn: () => fetchApi(`/users?search=${encodeURIComponent(search)}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => 
      fetchApi(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User updated successfully");
    },
    onError: (e: any) => toast.error(e.message || "Update failed")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User deleted permanently");
    },
    onError: (e: any) => toast.error(e.message || "Deletion failed")
  });

  const activeUsers = data?.rows || [];
  const filtered = activeUsers.filter(u => {
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    return matchPlan;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="sub-label mb-1">User Management</p>
          <h1 className="section-header text-3xl">Users</h1>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(["all", "free", "premium"] as const).map(plan => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filterPlan === plan
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
          <div className="grid grid-cols-[1fr_1.2fr_0.6fr_0.6fr_0.8fr_0.5fr] gap-4 px-6 py-4 bg-muted/30 border-b border-border/50">
            {["Name", "Email", "Plan", "Role", "Joined Date", ""].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>
          {isLoading && <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <p className="text-sm font-semibold">Fetching user database...</p>
          </div>}
          {!isLoading && filtered.length === 0 && <div className="p-12 text-center text-muted-foreground text-sm font-medium">No users match your criteria.</div>}
          {!isLoading && filtered.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <div
                className={`grid grid-cols-[1fr_1.2fr_0.6fr_0.6fr_0.8fr_0.5fr] gap-4 px-6 py-4 transition-all cursor-pointer items-center group ${expandedUser === user.id ? "bg-primary/5" : "hover:bg-muted/30"}`}
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${user.plan === "premium" ? "gradient-accent" : "btn-primary shadow-none"} flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform`}>
                    {(user.display_name || user.email).split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{user.display_name || 'Anonymous'}</p>
                    {user.is_verified && <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest mt-0.5"><BadgeCheck className="w-2 h-2" /> Verified</span>}
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground truncate">{user.email}</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter w-fit px-2 py-0.5 rounded-lg border ${user.plan === "premium" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-muted text-muted-foreground border-transparent"}`}>
                  {user.plan}
                </span>
                <span className="text-[10px] font-bold text-foreground capitalize bg-foreground/5 px-2 py-0.5 rounded-lg w-fit">{user.role}</span>
                <span className="text-xs font-semibold text-muted-foreground">{format(new Date(user.created_at), "MMM d, yyyy")}</span>
                <div className="flex justify-end">
                   <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedUser === user.id ? "rotate-180 text-primary" : ""}`} />
                </div>
              </div>

              {/* Expanded: Manage */}
              <AnimatePresence>
                {expandedUser === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 ml-14 mr-6 mb-4 rounded-[1.5rem] bg-white border border-border flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                            <UserCog className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Management Console</h4>
                         </div>
                         <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-medium text-muted-foreground">
                            <div><strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">System ID</strong> <span className="font-mono">{user.id}</span></div>
                            <div><strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">Last Login</strong> Just now</div>
                            <div><strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">Verification</strong> {user.is_verified ? "Authenticated" : "Unverified"}</div>
                            <div><strong className="text-foreground uppercase tracking-widest text-[9px] mb-0.5 block opacity-50">Role</strong> {user.role.toUpperCase()}</div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[200px]">
                         <button 
                           onClick={() => updateMutation.mutate({ id: user.id, payload: { plan: user.plan === "premium" ? "free" : "premium" } })}
                           className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-primary/5 transition-colors group"
                         >
                            <span className="text-[10px] font-bold">Toggle Plan</span>
                            {user.plan === "premium" ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                         </button>

                         <button 
                           onClick={() => updateMutation.mutate({ id: user.id, payload: { isVerified: !user.is_verified } })}
                           className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-blue-50 transition-colors group"
                         >
                            <span className="text-[10px] font-bold">Verification</span>
                            <BadgeCheck className={`w-4 h-4 ${user.is_verified ? "text-blue-500" : "text-muted-foreground/30"}`} />
                         </button>

                         <button 
                           onClick={() => { if(window.confirm("Hard delete this user? This cannot be undone.")) deleteMutation.mutate(user.id); }}
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
    </DashboardLayout>
  );
};

export default UsersPage;
