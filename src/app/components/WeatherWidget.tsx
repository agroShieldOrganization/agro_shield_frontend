import { motion } from "motion/react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from "lucide-react";

export function WeatherWidget() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/30 p-6"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

      <div className="relative">
        {/* Location & Date */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Abuja, Nigeria</h3>
          <p className="text-sm text-slate-400">Thursday, May 15, 2026</p>
        </div>

        {/* Main Weather */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sun className="w-16 h-16 text-orange-400 animate-pulse" />
              <Cloud className="w-8 h-8 text-slate-300 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <div className="text-5xl font-bold text-white">28°C</div>
              <p className="text-sm text-slate-400">Partly Cloudy</p>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Rainfall</p>
              <p className="text-sm font-semibold text-white">65%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-slate-400">Wind</p>
              <p className="text-sm font-semibold text-white">12 km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Humidity</p>
              <p className="text-sm font-semibold text-white">78%</p>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            {[
              { day: "Fri", temp: "30°", icon: Sun, color: "text-orange-400" },
              { day: "Sat", temp: "26°", icon: CloudRain, color: "text-blue-400" },
              { day: "Sun", temp: "27°", icon: Cloud, color: "text-slate-400" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">{item.day}</span>
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-semibold text-white">{item.temp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
