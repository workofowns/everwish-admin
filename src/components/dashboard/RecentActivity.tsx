import { motion } from "framer-motion";
import { Heart, Star, Sparkles, Gift } from "lucide-react";

const activities = [
  { user: "Priya S.", action: "created a Birthday Wish", temple: "Golden Temple", time: "2 min ago", icon: Gift },
  { user: "Rahul M.", action: "generated a Wedding Blessing", temple: "Meenakshi Temple", time: "8 min ago", icon: Heart },
  { user: "Ananya K.", action: "shared a Diwali Greeting", temple: "Kashi Vishwanath", time: "15 min ago", icon: Sparkles },
  { user: "Vikram P.", action: "upgraded to Premium", temple: "", time: "22 min ago", icon: Star },
  { user: "Sneha R.", action: "created an Anniversary Wish", temple: "Tirupati Balaji", time: "35 min ago", icon: Heart },
  { user: "Amit D.", action: "generated a New Year Blessing", temple: "Somnath Temple", time: "1 hr ago", icon: Sparkles },
];

const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="section-header text-lg mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <activity.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                <span className="text-primary">{activity.user}</span> {activity.action}
              </p>
              {activity.temple && (
                <p className="text-xs text-muted-foreground">{activity.temple}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
