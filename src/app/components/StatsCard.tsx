import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  gradient: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, trend, gradient, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 border border-white/10 backdrop-blur-sm cursor-pointer group`}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="text-right">
              <div className={`text-sm font-semibold ${trend.value > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </div>
              <div className="text-xs text-white/60">{trend.label}</div>
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-white/80">{title}</div>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20 blur-xl" />
      </div>
    </motion.div>
  );
}
