import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, Sparkles, Building2, IndianRupee } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="sub-label mb-1">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-gradient-primary">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with EverWish today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total Users" value="12,847" subtitle="+324 this week" icon={Users} glowColor="primary" delay={0} />
          <StatCard title="Daily Wishes" value="1,429" subtitle="+18% from yesterday" icon={Sparkles} glowColor="accent" delay={0.1} />
          <StatCard title="Top Temple" value="Tirupati" subtitle="2,341 wishes" icon={Building2} glowColor="secondary" delay={0.2} />
          <StatCard title="Revenue" value="₹4.2L" subtitle="+12% this month" icon={IndianRupee} glowColor="primary" delay={0.3} />
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
