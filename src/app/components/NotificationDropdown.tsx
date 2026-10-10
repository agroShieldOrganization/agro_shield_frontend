import { motion, AnimatePresence } from "motion/react";
import { Bell, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Heavy Rainfall Alert",
    message: "Benue Basin expected to receive 80mm+ rainfall",
    time: "2h ago",
    unread: true
  },
  {
    id: 2,
    type: "success",
    title: "Optimal Planting Window",
    message: "Ideal conditions for maize planting in Kaduna",
    time: "5h ago",
    unread: true
  },
  {
    id: 3,
    type: "info",
    title: "Soil Analysis Complete",
    message: "Your soil test results are ready to view",
    time: "1d ago",
    unread: false
  },
];

const typeIcons = {
  warning: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" }
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Notification Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 md:p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-orange-500/50 transition-colors"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
        <Badge className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center p-0 bg-orange-500 text-[10px] md:text-xs">
          3
        </Badge>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 right-4 left-4 z-[60] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-96"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto">
                {notifications.map((notif, index) => {
                  const config = typeIcons[notif.type as keyof typeof typeIcons];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                            {notif.unread && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{notif.message}</p>
                          <span className="text-xs text-slate-500">{notif.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800">
                <button className="w-full text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
