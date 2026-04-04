import { motion } from "framer-motion";
import { Heart, Sparkles, Gift, UserPlus, CreditCard, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: () => fetchApi("/recent-activity"),
    // refetchInterval: 30000, // refresh every 30 seconds
  });

  const activities = data?.data || [];

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'user_signup':
        return { action: "joined EverWish", icon: UserPlus, color: "btn-primary" };
      case 'wish_created':
        return { action: "created a wish", icon: Sparkles, color: "gradient-accent" };
      case 'order_paid':
        return { action: "purchased a template", icon: CreditCard, color: "gradient-secondary" };
      default:
        return { action: "interacted with EverWish", icon: Gift, color: "btn-primary" };
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground text-sm font-medium">Loading latest events...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-header text-lg">Recent Activity</h3>
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">No recent activity detected.</p>
        ) : (
          activities.map((activity: any, i: number) => {
            const config = getActivityConfig(activity.type);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-4 p-2 rounded-xl hover:bg-muted/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <config.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    <span className="font-bold text-primary">{activity.user_name}</span>{" "}
                    <span className="text-muted-foreground">{config.action}</span>
                  </p>
                  {activity.details && (
                    <p className="text-xs font-semibold text-foreground/80 mt-0.5">{activity.details}</p>
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
