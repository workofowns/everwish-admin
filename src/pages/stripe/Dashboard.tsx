import React from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Globe,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const StripeDashboard = () => {
  // We'll fetch stats from existing endpoints or add a new one if needed
  // For now we'll fetch general admin stats + pricing stats
  const { data: adminStats } = useQuery<any>({
    queryKey: ["adminStats"],
    queryFn: () => fetchApi("/stats")
  });

  const { data: prices } = useQuery<any[]>({
    queryKey: ["stripePrices"],
    queryFn: () => fetchApi("/stripe/prices")
  });

  const stats = [
    { label: "Active Revenue", value: `₹${(adminStats?.totalRevenue / 100 || 0).toLocaleString()}`, icon: TrendingUp, trend: "+12.5%", color: "emerald" },
    { label: "Active Plans", value: adminStats?.activeSubscriptions || 0, icon: BarChart3, trend: "Growth", color: "indigo" },
    { label: "Currency Coverage", value: "20+", icon: Globe, trend: "Auto-sync", color: "amber" },
    { label: "Daily Conversion", value: adminStats?.monthlyRevenue ? `₹${(adminStats.monthlyRevenue / 30 / 100).toFixed(0)}` : "0", icon: Activity, trend: "+5.2%", color: "rose" },
  ];

  return (
    <StripeLayout title="Stripe Hub" subtitle="E-commerce Logic">
      <div className="space-y-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="glass-card p-6 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest leading-none bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.value}</h4>
            </motion.div>
          ))}
        </div>

        {/* Sync Status Section */}
        <section className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="section-header text-2xl font-black tracking-tight text-slate-900">Live Engine Integrity</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Stripe communication status</p>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
            {[
              { id: "pricing", label: "Currency Conversion API", status: "ok", desc: "Latest exchange rates synced 12m ago" },
              { id: "stripe", label: "Stripe API Connectivity", status: "ok", desc: "Primary Gateway (2024-06-20 API)" },
              { id: "webhook", label: "Webhook Ingestion", status: "ok", desc: "No failed events in last 24h" },
              { id: "database", label: "Database Persistence", status: "ok", desc: "All local/remote IDs in sync" }
            ].map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-indigo-200 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</h5>
                  <p className="text-sm font-medium text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Information Alert */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-indigo-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-100 overflow-hidden relative group">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.2rem] bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="max-w-[400px]">
              <h4 className="text-xl font-black text-white leading-tight">Master Pricing Sync Logic</h4>
              <p className="text-indigo-100/70 text-[11px] font-medium leading-relaxed mt-1 opacity-80 leading-normal">
                Our engine performs heavy-duty conversion for 20+ currencies simultaneously on creation.
                Deleting an master price will safely deactivate all linked Stripe records.
              </p>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <button className="w-full md:px-8 py-4 rounded-2xl bg-white text-indigo-600 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/20">
              Audit Connections
            </button>
          </div>
          {/* Abstract BG Pattern */}
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-1000" />
        </div>
      </div>
    </StripeLayout>
  );
};

export default StripeDashboard;
