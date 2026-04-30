import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  BarChart3,
  Package,
  DollarSign,
  Layers,
  ArrowRight,
  IndianRupee,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

interface RazorpayLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const RazorpayLayout = ({ children, title, subtitle }: RazorpayLayoutProps) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/razorpay",
      description: "Overview & Analytics",
    },
    {
      icon: Package,
      label: "Products",
      path: "/razorpay/products",
      description: "Manage Razorpay Products",
    },
    {
      icon: DollarSign,
      label: "Global Prices",
      path: "/razorpay/global-prices",
      description: "Multi-currency pricing",
    },
    {
      icon: Zap,
      label: "Plans",
      path: "/razorpay/plans",
      description: "Subscription plans (live sync)",
    },
    {
      icon: Layers,
      label: "Subscriptions",
      path: "/razorpay/subscriptions",
      description: "Razorpay user plans",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-10 w-full mt-4">
        {/* Internal Sub-Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 ml-1">
                {subtitle}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 border ${
                      isActive
                        ? "bg-white border-slate-200 shadow-xl shadow-slate-100 ring-4 ring-slate-50"
                        : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm border border-slate-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-black transition-colors ${
                          isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div layoutId="rzp-active-indicator" className="ml-auto">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Info Card */}
            <div className="p-6 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 overflow-hidden relative group">
              <div className="relative z-10">
                <h4 className="text-xs font-black text-blue-600 mb-1">Razorpay Hybrid Mode</h4>
                <p className="text-[10px] font-medium text-blue-600 leading-relaxed opacity-80 italic">
                  Prices are stored locally for multi-currency support, while <b>Subscription Plans</b> are created and synced live with the Razorpay API.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default RazorpayLayout;
