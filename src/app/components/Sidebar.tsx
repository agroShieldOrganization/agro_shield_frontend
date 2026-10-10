import { motion } from "motion/react";
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Sprout,
  Droplets,
  MapPin,
  Users,
  Bot,
  Settings,
  Plus,
  FileText
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "./ui/utils";
import { useAuth } from "../../context/AuthContext";


interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <Sprout className="w-5 h-5" />, label: "My Farms", path: "/my-farms" },
  { icon: <Plus className="w-5 h-5" />, label: "Add Farm", path: "/add-farm" },
  { icon: <Map className="w-5 h-5" />, label: "Climate Intelligence", path: "/climate-intelligence" },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Farm Analytics", path: "/farm-analytics" },
  { icon: <Droplets className="w-5 h-5" />, label: "Planting Advisor", path: "/planting-advisor" },
  { icon: <MapPin className="w-5 h-5" />, label: "Flood Risk", path: "/flood-risk" },
  { icon: <Users className="w-5 h-5" />, label: "Soil Intelligence", path: "/soil-intelligence" },
  { icon: <FileText className="w-5 h-5" />, label: "Community Reports", path: "/community-reports" },
  { icon: <Plus className="w-5 h-5" />, label: "Submit Report", path: "/submit-report" },
  { icon: <Bot className="w-5 h-5" />, label: "AI Assistant", path: "/ai-assistant" },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {

  const { logout, user} = useAuth();


  const location = useLocation();
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "w-64 h-full bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 flex flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br z-50 from-emerald-500 to-teal-600 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Grovane Climate</h1>
            <p className="text-xs text-emerald-400">Climate Informed Intelligence</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path} onClick={onNavigate}>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">Farmer</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
