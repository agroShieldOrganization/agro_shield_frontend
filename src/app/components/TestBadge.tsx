import { motion } from "motion/react";
import { TestTube } from "lucide-react";
import { Link } from "react-router-dom";

export function TestBadge() {
  return (
    <Link to="/test-routes">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-2xl border-2 border-white/20 cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <TestTube className="w-6 h-6" />
          <span className="text-sm font-bold hidden group-hover:inline-block whitespace-nowrap">
            Test Routes
          </span>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          9
        </div>
      </motion.div>
    </Link>
  );
}
