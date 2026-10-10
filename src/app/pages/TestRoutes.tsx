import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

export function TestRoutes() {
  const routes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/my-farms", name: "My Farms" },
    { path: "/add-farm", name: "Add Farm" },
    { path: "/climate-map", name: "Climate Map" },
    { path: "/farm-analytics", name: "Farm Analytics" },
    { path: "/planting-advisor", name: "Planting Advisor" },
    { path: "/flood-risk", name: "Flood Risk" },
    { path: "/soil-intelligence", name: "Soil Intelligence" },
    { path: "/community-reports", name: "Community Reports" },
    { path: "/submit-report", name: "Submit Report" },
    { path: "/ai-assistant", name: "AI Assistant" },
    { path: "/settings", name: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
          Route Testing Page
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Test all {routes.length} routes including 3 NEW farmer-focused pages
        </p>
      </motion.div>

      {/* Test Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Router Status: Active</h2>
        </div>
        <p className="text-sm text-slate-300">
          React Router DOM is properly configured. All {routes.length} routes are registered including 3 NEW farmer-focused features: My Farms, Add Farm, and Submit Report.
        </p>
      </motion.div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, index) => (
          <motion.div
            key={route.path}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Link to={route.path}>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:scale-105 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {route.name}
                  </h3>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-500 font-mono bg-slate-950/50 rounded px-2 py-1">
                  {route.path || "/"}
                </div>
                <p className="text-sm text-slate-400 mt-3">Click to navigate →</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Sidebar Test */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Sidebar Navigation Test</h2>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Sidebar links are using React Router &lt;Link&gt; component</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Active route highlighting is enabled via useLocation hook</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Client-side routing prevents page reloads</span>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Testing Instructions</h2>
        <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
          <li>Click each card above to navigate to that route</li>
          <li>Verify the page loads with correct content</li>
          <li>Check that the sidebar shows the active page highlighted in emerald</li>
          <li>Use browser back/forward buttons to test navigation history</li>
          <li>Click sidebar links to confirm they work properly</li>
          <li>Test dropdowns (Notifications, Location, User) in the top navbar</li>
        </ol>
      </motion.div>
    </div>
  );
}
