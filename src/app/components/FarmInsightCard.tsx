import { motion } from "motion/react";
import { Sprout, TrendingUp, Calendar, Thermometer } from "lucide-react";
import { Progress } from "./ui/progress";

interface FarmData {
  crop: string;
  location: string;
  health: number;
  plantingWindow: string;
  soilTemp: string;
  forecast: string;
}

const farmData: FarmData[] = [
  {
    crop: "Maize",
    location: "Kaduna Valley",
    health: 85,
    plantingWindow: "May 20 - Jun 10",
    soilTemp: "24°C",
    forecast: "Excellent conditions"
  },
  {
    crop: "Rice",
    location: "Kano Plains",
    health: 72,
    plantingWindow: "Jun 1 - Jun 20",
    soilTemp: "26°C",
    forecast: "Good with irrigation"
  },
  {
    crop: "Cassava",
    location: "Benue Basin",
    health: 45,
    plantingWindow: "Delay recommended",
    soilTemp: "22°C",
    forecast: "Wait for flood risk to pass"
  }
];

export function FarmInsightCard() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">Farm Insights</h3>
        <p className="text-sm text-slate-400">Crop health & planting recommendations</p>
      </div>

      {/* Farm Cards */}
      <div className="space-y-4">
        {farmData.map((farm, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer group"
          >
            {/* Crop Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{farm.crop}</h4>
                  <p className="text-xs text-slate-400">{farm.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Health</p>
                <p className={`text-sm font-bold ${
                  farm.health >= 70 ? 'text-emerald-400' :
                  farm.health >= 50 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {farm.health}%
                </p>
              </div>
            </div>

            {/* Health Progress */}
            <div className="mb-4">
              <Progress
                value={farm.health}
                className="h-2 bg-slate-700"
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-slate-500">Planting</p>
                  <p className="text-slate-300 font-medium">{farm.plantingWindow}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-slate-500">Soil Temp</p>
                  <p className="text-slate-300 font-medium">{farm.soilTemp}</p>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${
                  farm.health >= 70 ? 'text-emerald-400' :
                  farm.health >= 50 ? 'text-orange-400' :
                  'text-red-400'
                }`} />
                <p className="text-xs text-slate-400">{farm.forecast}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
