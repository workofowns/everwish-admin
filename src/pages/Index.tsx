import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, Sparkles, Building2, IndianRupee } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalWishes: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const Index = () => {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: () => fetchApi("/stats"),
  });

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="sub-label mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, <span className="text-gradient-primary">Admin</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with EverWish today.</p>
          </div>
          {!localStorage.getItem("adminToken") && (
             <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 shadow-sm">
               ⚠️ Missing 'adminToken' in localStorage. Please login.
             </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total Users" value={isLoading ? "..." : stats?.totalUsers.toString() || "0"} subtitle="Platform signups" icon={Users} glowColor="primary" delay={0} />
          <StatCard title="Total Wishes" value={isLoading ? "..." : stats?.totalWishes.toString() || "0"} subtitle="Created so far" icon={Sparkles} glowColor="accent" delay={0.1} />
          <StatCard title="Total Orders" value={isLoading ? "..." : stats?.totalOrders.toString() || "0"} subtitle="Paid checkouts" icon={Building2} glowColor="secondary" delay={0.2} />
          <StatCard title="Revenue" value={isLoading ? "..." : `₹${((stats?.totalRevenue || 0) / 100).toFixed(0)}`} subtitle={isLoading ? "..." : `₹${((stats?.monthlyRevenue || 0) / 100).toFixed(0)} this month`} icon={IndianRupee} glowColor="primary" delay={0.3} />
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="section-header text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: "Add New Template", desc: "Create a new wish template" },
                { label: "Manage Categories", desc: "Edit category hierarchy" },
                { label: "View Reports", desc: "Download analytics" },
                { label: "User Support", desc: "Check pending tickets" },
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
                >
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
