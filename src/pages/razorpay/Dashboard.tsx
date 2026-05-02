import React from "react";
import RazorpayLayout from "@/components/razorpay/RazorpayLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  TrendingUp,
  Globe,
  CheckCircle2,
  Package,
  Database,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";

const RazorpayDashboard = () => {
  const { data: prices } = useQuery<any[]>({
    queryKey: ["razorpayPrices"],
    queryFn: () => fetchApi("/razorpay/prices"),
  });

  const { data: products } = useQuery<any[]>({
    queryKey: ["razorpayProducts"],
    queryFn: () => fetchApi("/razorpay/products"),
  });

  const { data: adminStats } = useQuery<any>({
    queryKey: ["adminStats"],
    queryFn: () => fetchApi("/stats"),
  });

  const totalPrices = prices?.length ?? 0;
  const totalProducts = products?.length ?? 0;
  const recurringPrices = prices?.filter((p) => p.type === "recurring").length ?? 0;
  const oneTimePrices = prices?.filter((p) => p.type === "one_time").length ?? 0;

  const stats = [
    {
      label: "Total Price Sets",
      value: totalPrices,
      icon: DollarSign,
      trend: "DB Records",
      color: "blue",
    },
    {
      label: "Products",
      value: totalProducts,
      icon: Package,
      trend: "Containers",
      color: "indigo",
    },
    {
      label: "Recurring Plans",
      value: recurringPrices,
      icon: TrendingUp,
      trend: "Subscriptions",
      color: "emerald",
    },
    {
      label: "Currency Coverage",
      value: "20+",
      icon: Globe,
      trend: "Auto-calc",
      color: "amber",
    },
  ];

  return (
    <RazorpayLayout title="Razorpay Hub" subtitle="Indian Payments Engine">
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
                <div
                  className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {stat.value}
              </h4>
            </motion.div>
          ))}
        </div>

        {/* System Status */}
        <section className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="section-header text-2xl font-black tracking-tight text-slate-900">
                DB Engine Integrity
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Razorpay local database system status
              </p>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                DB Only
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
            {[
              {
                label: "Currency Conversion API",
                desc: "Live exchange rates fetched on price creation via exchangerate-api.com",
              },
              {
                label: "Razorpay API",
                desc: "Not connected — all data is stored locally in DB only, no sync needed",
              },
              {
                label: "razorpay_products Table",
                desc: `${totalProducts} products stored in database`,
              },
              {
                label: "razorpay_prices Table",
                desc: `${totalPrices} price sets (${recurringPrices} recurring, ${oneTimePrices} one-time)`,
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-blue-200 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {item.label}
                  </h5>
                  <p className="text-sm font-medium text-slate-500 leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info Banner */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-blue-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-100 overflow-hidden relative group">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.2rem] bg-white/20 flex items-center justify-center shrink-0">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div className="max-w-[440px]">
              <h4 className="text-xl font-black text-white leading-tight">
                Local Multi-Currency Pricing Engine
              </h4>
              <p className="text-blue-100/70 text-[11px] font-medium leading-relaxed mt-1 opacity-80">
                All Razorpay prices are computed locally using live exchange rates and stored in your
                database. No Razorpay API calls are made during creation — giving you full control
                and zero dependency on the Razorpay dashboard for pricing.
              </p>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <a
              href="/razorpay/global-prices"
              className="w-full md:px-8 py-4 rounded-2xl bg-white text-blue-600 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20 block text-center"
            >
              Manage Prices
            </a>
          </div>
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-1000" />
        </div>
      </div>
    </RazorpayLayout>
  );
};

export default RazorpayDashboard;
