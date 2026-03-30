import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  glowColor: "primary" | "accent" | "secondary";
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, glowColor, delay = 0 }: StatCardProps) => {
  const glowClass = {
    primary: "glow-orb-primary",
    accent: "glow-orb-accent",
    secondary: "glow-orb-secondary",
  }[glowColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className={`glow-orb ${glowClass} w-32 h-32 -top-10 -right-10 animate-glow-pulse`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="sub-label">{title}</span>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
