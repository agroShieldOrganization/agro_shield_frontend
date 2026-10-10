import { motion } from "motion/react";
import { Search, Menu } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { LocationDropdown } from "./LocationDropdown";
import { UserDropdown } from "./UserDropdown";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-30 h-16 overflow-visible bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 md:px-6"
    >
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onMenuClick}
        aria-label="Open sidebar"
        className="lg:hidden p-2 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors mr-3"
      >
        <Menu className="w-5 h-5 text-slate-300" />
      </motion.button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search farms, locations..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 text-xs md:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="relative z-40 flex items-center gap-2 md:gap-4 ml-3 md:ml-6">
        {/* Location Dropdown */}
        <LocationDropdown />

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <UserDropdown />
      </div>
    </motion.div>
  );
}
