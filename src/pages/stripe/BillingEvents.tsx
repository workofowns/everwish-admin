import React from "react";
import StripeLayout from "@/components/stripe/StripeLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Activity,
  Clock,
  Terminal,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const BillingEvents = () => {
  const [page, setPage] = React.useState(1);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["adminBillingEvents", page],
    queryFn: () => fetchApi(`/billing-events?page=${page}`)
  });
  console.log("data", data)
  return (
    <StripeLayout title="Billing Events" subtitle="Process Audit">
      <div className="flex flex-col xl:flex-row gap-10">
        <div className="flex-1 space-y-8 min-w-0">
          {/* Timeline View */}
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/50 animate-pulse rounded-[2rem]" />
              ))
            ) : data?.rows?.map((event: any, i: number) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`flex gap-6 p-6 rounded-[2.5rem] border transition-all cursor-pointer group ${selectedEvent?.id === event.id
                  ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 text-white"
                  : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100"
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${selectedEvent?.id === event.id
                  ? "bg-white/10 border-white/10 text-white"
                  : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                  }`}>
                  <Activity className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className={`text-sm font-black tracking-widest ${selectedEvent?.id === event.id ? "text-indigo-400" : "text-indigo-600"
                      }`}>
                      {event.event_type}
                    </h4>
                    <span className={`text-[10px] font-bold flex items-center gap-1 opacity-70`}>
                      <Clock className="w-3 h-3" />
                      {format(new Date(event.created_at), "HH:mm:ss · MMM d")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold truncate opacity-80">
                      User: {event.user_email || "System/Webhook"}
                    </p>
                    <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                      ID: {event.stripe_event_id.slice(0, 16)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center w-10 shrink-0">
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${selectedEvent?.id === event.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                    }`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center pt-6">
            <div className="flex gap-2 p-2 rounded-2xl bg-white border border-slate-100">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-6 py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={!data?.pagination?.hasNext}
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Event Detail Sidebar / Overlay */}
        <div className="w-full xl:w-96 shrink-0">
          <div className="xl:sticky xl:top-8 bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {selectedEvent ? (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500"
                    >
                      Close
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">Event Inspector</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
                    Payload Metadata
                  </p>

                  <div className="space-y-6 flex-1">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Event Origin</label>
                      <div className="p-3 rounded-xl bg-slate-50 text-[11px] font-black text-slate-600 border border-slate-100">
                        {selectedEvent.stripe_event_id}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subscription Context</label>
                      <div className="p-3 rounded-xl bg-slate-50 text-[11px] font-black text-slate-600 border border-slate-100">
                        {selectedEvent.stripe_subscription_id || "None / Manual"}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Payload (JSON)</label>
                      <pre className="p-4 rounded-2xl bg-slate-900 text-indigo-300 text-[10px] font-medium overflow-auto max-h-[400px] leading-relaxed custom-scrollbar border border-white/5">
                        {JSON.stringify(selectedEvent.payload_json, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-6">
                    <Terminal className="w-10 h-10" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Inspector Idle</h4>
                  <p className="text-xs font-medium text-slate-400 max-w-[200px] leading-relaxed">
                    Select any event from the timeline to inspect the raw Stripe payload.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StripeLayout>
  );
};

export default BillingEvents;
