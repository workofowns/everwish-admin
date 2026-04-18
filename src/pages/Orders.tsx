import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  ShoppingBag, 
  Search, 
  ArrowRight, 
  User, 
  Sparkles, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCcw,
  Eye,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Order {
  id: string;
  user_id: string;
  template_id: string;
  amount: number;
  currency: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  stripe_payment_intent_id?: string;
  created_at: string;
  user_email: string;
  user_name: string;
  template_name: string;
  payment_method?: string;
  razorpay_payment_id?: string;
}

const Orders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => fetchApi("/orders"),
  });

  const { data: activeOrder } = useQuery({
    queryKey: ["adminOrder", selectedOrderId],
    queryFn: () => fetchApi(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/orders/${id}/refund`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrder"] });
      toast.success("Refund processed successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to process refund")
  });

  const orders = ordersRes?.data || [];
  const filtered = orders.filter((o: Order) => 
    o.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    o.template_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search)
  );

  const getStatusConfig = (status: Order["payment_status"]) => {
    switch (status) {
      case "paid": return { icon: CheckCircle, className: "bg-emerald-50 text-emerald-600 border-emerald-200" };
      case "failed": return { icon: XCircle, className: "bg-red-50 text-red-600 border-red-200" };
      case "refunded": return { icon: RefreshCcw, className: "bg-amber-50 text-amber-600 border-amber-200" };
      default: return { icon: Clock, className: "bg-blue-50 text-blue-600 border-blue-200" };
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="sub-label mb-1">Financial Management</p>
            <h1 className="section-header text-3xl">Orders</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : filtered.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-20 text-center flex flex-col items-center">
                 <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <h3 className="text-xl font-bold">No orders found</h3>
                 <p className="text-muted-foreground text-sm">Try adjusting your search criteria.</p>
              </div>
            ) : (
              filtered.map((order: Order) => {
                const StatusIcon = getStatusConfig(order.payment_status).icon;
                return (
                  <motion.div
                    key={order.id}
                    layoutId={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${selectedOrderId === order.id ? "border-primary ring-4 ring-primary/10" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusConfig(order.payment_status).className} border transition-transform group-hover:scale-110`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{order.template_name}</p>
                          <div className="flex items-center gap-2">
                             <p className="text-xs text-muted-foreground">{order.user_email}</p>
                             <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${order.razorpay_payment_id ? 'text-blue-500 bg-blue-50 border-blue-100' : 'text-indigo-500 bg-indigo-50 border-indigo-100'}`}>
                                {order.razorpay_payment_id ? 'Razorpay' : 'Stripe'}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black tracking-tight text-foreground">₹{(order.amount / 100).toFixed(0)}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {format(new Date(order.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Order Details / Sidebar */}
          <div className="lg:col-span-1">
             <AnimatePresence mode="wait">
                {selectedOrderId ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card rounded-[2rem] p-8 border border-border sticky top-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-xl font-black tracking-tight">Order Details</h2>
                       <button onClick={() => setSelectedOrderId(null)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                         <ArrowLeft className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-4">
                           <DetailItem label="Order ID" value={selectedOrderId} mono />
                           <DetailItem 
                             label="Gateway" 
                             value={
                               <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${activeOrder?.razorpay_payment_id ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200'}`}>
                                 {activeOrder?.razorpay_payment_id ? 'Razorpay' : 'Stripe'}
                               </span>
                             } 
                           />
                           {activeOrder?.razorpay_payment_id ? (
                             <DetailItem label="Rzp Payment ID" value={activeOrder.razorpay_payment_id} mono />
                           ) : activeOrder?.stripe_payment_intent_id ? (
                             <DetailItem label="Stripe PI ID" value={activeOrder.stripe_payment_intent_id} mono />
                           ) : null}
                           <DetailItem 
                             label="Status" 
                             value={
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusConfig(activeOrder?.payment_status || "pending").className}`}>
                                {activeOrder?.payment_status || "..."}
                              </span>
                            } 
                          />
                          <DetailItem label="Date" value={activeOrder ? format(new Date(activeOrder.created_at), "PPP p") : "..."} />
                       </div>

                       <div className="pt-6 border-t border-border/50">
                          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3 block">Customer</label>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">{activeOrder?.user_name || "Guest"}</p>
                                <p className="text-xs text-muted-foreground">{activeOrder?.user_email}</p>
                             </div>
                          </div>
                       </div>

                       <div className="pt-6 border-t border-border/50">
                          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3 block">Product</label>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                <Sparkles className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">{activeOrder?.template_name}</p>
                                <p className="text-xs text-muted-foreground">Currency: {activeOrder?.currency?.toUpperCase()}</p>
                             </div>
                          </div>
                       </div>

                       <div className="bg-muted/50 rounded-2xl p-4 mt-6">
                           <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-muted-foreground">Total Paid</p>
                              <p className="text-2xl font-black text-foreground">₹{((activeOrder?.amount || 0) / 100).toFixed(2)}</p>
                           </div>
                       </div>

                       {activeOrder?.payment_status === "paid" && (
                         <button
                           onClick={() => { if(window.confirm("Refund this order?")) refundMutation.mutate(selectedOrderId); }}
                           disabled={refundMutation.isPending}
                           className="w-full mt-4 py-3 rounded-xl border border-amber-200 text-amber-600 font-bold text-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                         >
                           <RefreshCcw className={`w-4 h-4 ${refundMutation.isPending ? "animate-spin" : ""}`} />
                           Process Refund
                         </button>
                       )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="glass-card rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-border h-[400px]">
                     <Eye className="w-12 h-12 text-muted-foreground/30 mb-4" />
                     <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Select an order to view details</p>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const DetailItem = ({ label, value, mono = false }: { label: string, value: React.ReactNode, mono?: boolean }) => (
  <div className="flex items-center justify-between">
    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
    <div className={`text-xs font-semibold ${mono ? "font-mono" : ""}`}>
      {value}
    </div>
  </div>
);

export default Orders;
