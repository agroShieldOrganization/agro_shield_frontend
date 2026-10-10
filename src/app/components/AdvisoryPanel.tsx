import { motion } from "motion/react";
import { AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface Advisory {
  id: string;
  type: "warning" | "success" | "info" | "urgent";
  title: string;
  description: string;
  location?: string;
  time: string;
}

const advisories: Advisory[] = [
  {
    id: "1",
    type: "urgent",
    title: "Heavy Rainfall Alert",
    description: "Benue Basin expected to receive 80mm+ rainfall in next 48 hours. Delay planting activities.",
    location: "Benue State",
    time: "2 hours ago"
  },
  {
    id: "2",
    type: "success",
    title: "Optimal Planting Window",
    description: "Ideal conditions for maize planting detected in Kaduna region. Soil moisture at 65%.",
    location: "Kaduna State",
    time: "5 hours ago"
  },
  {
    id: "3",
    type: "warning",
    title: "Fungal Disease Risk",
    description: "High humidity and temperature conditions favor cassava mosaic disease spread.",
    location: "Lagos Agricultural Zone",
    time: "8 hours ago"
  },
  {
    id: "4",
    type: "info",
    title: "Irrigation Recommendation",
    description: "Reduce irrigation by 30% for rice farms in Kano. Current soil moisture sufficient.",
    location: "Kano State",
    time: "12 hours ago"
  },
  {
    id: "5",
    type: "warning",
    title: "Pest Outbreak Detected",
    description: "Fall armyworm activity increasing in northern regions. Consider preventive measures.",
    location: "Northern Nigeria",
    time: "1 day ago"
  }
];

const typeConfig = {
  urgent: {
    icon: Zap,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    badge: "destructive"
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "secondary"
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "default"
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    badge: "outline"
  }
};

export function AdvisoryPanel() {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">AI Advisory Center</h2>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Live
          </Badge>
        </div>
        <p className="text-sm text-slate-400">Real-time climate recommendations</p>
      </div>

      {/* Advisories List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {advisories.map((advisory, index) => {
            const config = typeConfig[advisory.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={advisory.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: -4 }}
                className={`p-4 rounded-xl border ${config.border} ${config.bg} cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-slate-900/50 ${config.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{advisory.title}</h4>
                      <Badge variant={config.badge as any} className="text-xs shrink-0">
                        {advisory.type}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                      {advisory.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      {advisory.location && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-500" />
                          {advisory.location}
                        </span>
                      )}
                      <span>{advisory.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* AI Status Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400">AI monitoring 247 farms across 5 states</span>
        </div>
      </div>
    </motion.div>
  );
}
