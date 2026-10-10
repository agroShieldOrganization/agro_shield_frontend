import { motion } from "motion/react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "./ui/progress";

interface ClimateCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  progress?: number;
  status: "good" | "warning" | "danger";
  delay?: number;
}

const statusColors = {
  good: {
    bg: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-500/30",
    icon: "text-emerald-400",
    text: "text-emerald-400",
    progress: "bg-emerald-500"
  },
  warning: {
    bg: "from-orange-500/10 to-amber-500/10",
    border: "border-orange-500/30",
    icon: "text-orange-400",
    text: "text-orange-400",
    progress: "bg-orange-500"
  },
  danger: {
    bg: "from-red-500/10 to-rose-500/10",
    border: "border-red-500/30",
    icon: "text-red-400",
    text: "text-red-400",
    progress: "bg-red-500"
  }
};

export function ClimateCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  progress,
  status,
  delay = 0
}: ClimateCardProps) {
  const colors = statusColors[status];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} p-4 md:p-6 group cursor-pointer`}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-900/50 ${colors.icon}`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
              <span className="text-[10px] md:text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1 md:gap-2">
            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs md:text-sm text-slate-400">{unit}</span>}
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{title}</p>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress
              value={progress}
              className="h-2 bg-slate-800/50"
            />
            <p className="text-xs text-slate-500">{progress}% of threshold</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
