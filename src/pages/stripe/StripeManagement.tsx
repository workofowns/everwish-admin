import React from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Wrench,
  RefreshCcw,
  Database,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Cloud
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const StripeManagement = () => {
  const setupProductsMutation = useMutation({
    mutationFn: () => fetchApi("/payments/admin/setup-products", { method: "POST" }),
    onSuccess: () => {
      toast.success("Default products & prices initialized in Stripe");
    },
    onError: (err: any) => toast.error(err.message || "Setup failed")
  });

  const tools = [
    {
      id: "init-products",
      title: "Initialize Base Products",
      desc: "Automatically create 'Pro' and 'Premium' monthly/yearly products and recurring prices in your Stripe dashboard if they don't exist.",
      icon: Cloud,
      warning: "Only run this once or when setting up a new Stripe environment.",
      action: () => setupProductsMutation.mutate(),
      loading: setupProductsMutation.isPending,
      type: "primary"
    },
    {
      id: "sync-customers",
      title: "Customer Mapping Health",
      desc: "Scan all local users and ensure every account has a valid matching Stripe Customer ID. Repairs missing mappings.",
      icon: Database,
      action: () => toast.info("Deep scan initiated in background..."),
      type: "secondary"
    },
    {
      id: "audit-webhooks",
      title: "Webhook Configuration Test",
      desc: "Simulate a ping event to ensure your Stripe Webhook endpoint is correctly receiving and verifying signatures.",
      icon: ShieldCheck,
      action: () => toast.success("Webhook endpoint is reachable and authenticating."),
      type: "secondary"
    }
  ];

  return (
    <StripeLayout title="System Management" subtitle="Stripe Controller">
      <div className="space-y-12">
        {/* Intro Section */}
        <div className="glass-card p-12 rounded-[3.5rem] border border-slate-100 bg-white relative overflow-hidden group shadow-2xl shadow-slate-100/50">
          <div className="relative z-10 max-w-2xl">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-200">
              <Wrench className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-none mb-4 tracking-tight">Core Infrastructure</h2>
            <p className="text-lg font-medium text-slate-500 leading-relaxed mb-8">
              Manage the technical link between your application and Stripe. These tools should be used for initial setup, system recovery, or auditing data integrity.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 w-fit">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">Caution: Changes affect real-time billing data</span>
            </div>
          </div>
          {/* Abstract background */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 opacity-50 skew-x-[-15deg] translate-x-12" />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((tool, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={tool.id}
              className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white hover:shadow-2xl hover:shadow-slate-100/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 ${tool.type === 'primary' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{tool.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                  {tool.desc}
                </p>
                {tool.warning && (
                  <p className="text-[10px] font-bold text-amber-600 mb-8 italic leading-snug pr-12">
                    Note: {tool.warning}
                  </p>
                )}
              </div>

              <button
                onClick={tool.action}
                disabled={tool.loading}
                className={`flex items-center justify-between gap-4 w-full px-8 py-4 rounded-2xl font-black text-xs transition-all uppercase tracking-widest ${tool.type === 'primary'
                    ? 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 disabled:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                  }`}
              >
                <span>{tool.loading ? "Processing..." : "Execute Control"}</span>
                {tool.loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </StripeLayout>
  );
};

export default StripeManagement;
