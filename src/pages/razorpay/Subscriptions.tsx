import React from "react";
import RazorpayLayout from "@/components/razorpay/RazorpayLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  User,
  Calendar,
  AlertCircle,
  Undo2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const RazorpaySubscriptions = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);

  // Reuse the same subscriptions endpoint — it returns both stripe and razorpay subs
  const { data, isLoading } = useQuery<any>({
    queryKey: ["adminSubscriptions", page],
    queryFn: () => fetchApi(`/subscriptions?page=${page}`),
  });

  const refundMutation = useMutation({
    mutationFn: (subId: string) =>
      fetchApi(`/subscriptions/${subId}/refund`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Refund initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to refund"),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "emerald";
      case "past_due": return "amber";
      case "canceled": return "rose";
      case "incomplete": return "blue";
      default: return "slate";
    }
  };

  // Filter only Razorpay subscriptions (those with razorpay_subscription_id)
  const allSubs: any[] = data?.rows || [];
  const razorpaySubs = allSubs.filter((s) => s.razorpay_subscription_id);

  return (
    <RazorpayLayout title="Subscriptions" subtitle="Razorpay Plans">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user email or subscription ID..."
              className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 uppercase tracking-widest">
              {razorpaySubs.length} Razorpay Active
            </span>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] })}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Razorpay Sub ID</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-24 bg-slate-50/50" />
                    </tr>
                  ))
                ) : razorpaySubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        No Razorpay subscriptions found
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        Subscriptions created via Razorpay will appear here
                      </p>
                    </td>
                  </tr>
                ) : razorpaySubs.map((sub: any) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={sub.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none mb-1">
                            {sub.user_name || "EverWish User"}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400">{sub.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${getStatusColor(sub.status)}-500/10 text-${getStatusColor(sub.status)}-600 border border-${getStatusColor(sub.status)}-500/20`}
                          >
                            {sub.status}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            {sub.plan_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Ends {format(new Date(sub.current_period_end), "MMM d, yyyy")}</span>
                        </div>
                        {sub.cancel_at_period_end && (
                          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-rose-50 border border-rose-100 w-fit">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-tight">
                              Pending Cancellation
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[9px] font-mono text-blue-500 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-bold block truncate max-w-[160px]">
                        {sub.razorpay_subscription_id}
                      </code>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Refund this subscription? This will also cancel access."
                              )
                            ) {
                              refundMutation.mutate(sub.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-200 text-white hover:bg-rose-600 hover:border-rose-400 hover:text-white transition-all shadow-sm"
                          title="Issue Refund"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-2 rounded-2xl bg-white border border-slate-100">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">
              {page}
            </div>
            <button
              disabled={!data?.pagination?.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </RazorpayLayout>
  );
};

export default RazorpaySubscriptions;
