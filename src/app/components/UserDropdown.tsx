import { motion, AnimatePresence } from "motion/react";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { icon: User, label: "Profile", action: "profile" },
  { icon: Settings, label: "Settings", action: "settings" },
  { icon: HelpCircle, label: "Help & Support", action: "help" },
  { icon: LogOut, label: "Logout", action: "logout", color: "text-red-400" },
];

export function UserDropdown() {

const [isOpen, setIsOpen] = useState(false);




// Use the user's data
const { logout, user} = useAuth();
// Call logout function
const handleLogout = async () => {

  try {

    await logout();

    window.location.href = "/login";

  } catch (error) {

    console.error(error);
  }
};
  return (
    <div className="relative z-50">
      {/* User Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 pr-3 md:pr-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors"
      >
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.slice(0, 1).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm text-slate-300">{user?.name}</span>
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
              className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
              {/* User Info */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{user?.name}</h3>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{user?.name} | Farmer</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}

                      
                      onClick={async () => {
                      if (item.action === "logout") {
                        await handleLogout();
                      } else {
                        console.log(item.action);
                      }
                        setIsOpen(false);
                      }}


                      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left ${
                        item.color || 'text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
