import { motion } from "motion/react";
import { MapPin, Thermometer, Droplets, Activity, Leaf, FlaskConical } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

const soilData = [
  {
    location: "Kaduna Valley - Section A",
    soilType: "Loamy",
    ph: 6.8,
    nitrogen: 85,
    phosphorus: 72,
    potassium: 68,
    organicMatter: 4.2,
    moisture: 65,
    temperature: 24,
    health: "excellent"
  },
  {
    location: "Abuja Farm - North Field",
    soilType: "Sandy Loam",
    ph: 6.2,
    nitrogen: 68,
    phosphorus: 55,
    potassium: 62,
    organicMatter: 3.5,
    moisture: 58,
    temperature: 26,
    health: "good"
  },
  {
    location: "Benue Basin - East Block",
    soilType: "Clay",
    ph: 7.2,
    nitrogen: 45,
    phosphorus: 38,
    potassium: 42,
    organicMatter: 2.8,
    moisture: 42,
    temperature: 22,
    health: "fair"
  },
  {
    location: "Kano Plains - West Sector",
    soilType: "Sandy",
    ph: 5.8,
    nitrogen: 52,
    phosphorus: 48,
    potassium: 55,
    organicMatter: 2.2,
    moisture: 35,
    temperature: 28,
    health: "fair"
  }
];

const healthConfig = {
  excellent: { color: "emerald", label: "Excellent" },
  good: { color: "blue", label: "Good" },
  fair: { color: "orange", label: "Fair" },
  poor: { color: "red", label: "Poor" }
};

export function SoilIntelligence() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
          Soil Intelligence
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Advanced soil analysis and nutrient monitoring
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Soil Health", value: "78%", icon: Activity, color: "emerald" },
          { label: "Locations Monitored", value: "24", icon: MapPin, color: "blue" },
          { label: "Avg pH Level", value: "6.5", icon: FlaskConical, color: "purple" },
          { label: "Avg Moisture", value: "55%", icon: Droplets, color: "cyan" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 backdrop-blur-sm border border-${item.color}-500/30 rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm text-slate-400">{item.label}</div>
              </div>
              <div className={`p-3 rounded-xl bg-${item.color}-500/10`}>
                <item.icon className={`w-6 h-6 text-${item.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Soil Analysis Cards */}
     {/* Soil Analysis Cards */}

<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">

  {soilData.map((soil, index) => {

    const config =
      healthConfig[
        soil.health as keyof typeof healthConfig
      ];

    return (

      <motion.div
        key={index}
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay:
            0.2 + index * 0.05,
        }}
        className="
          bg-slate-900/50
          backdrop-blur-sm
          border
          border-slate-800
          rounded-2xl
          p-5
          hover:border-emerald-500/50
          transition-colors
          h-full
          flex
          flex-col
        "
      >

        {/* HEADER */}

        <div className="flex items-start justify-between mb-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">

              <MapPin className="w-5 h-5 text-white" />

            </div>

            <div>

              <h3 className="text-base font-bold text-white">

                {soil.location}

              </h3>

              <p className="text-xs text-slate-400">

                {soil.soilType} Soil

              </p>

            </div>

          </div>

          <Badge
            className={`
              bg-${config.color}-500/20
              text-${config.color}-400
              border-${config.color}-500/30
            `}
          >

            {config.label}

          </Badge>

        </div>

        {/* METRICS */}

        <div className="grid grid-cols-2 gap-3 mb-5">

          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700">

            <div className="flex items-center gap-2 mb-2">

              <FlaskConical className="w-4 h-4 text-purple-400" />

              <span className="text-xs text-slate-400">

                pH Level

              </span>

            </div>

            <div className="text-xl font-bold text-white">

              {soil.ph}

            </div>

          </div>

          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700">

            <div className="flex items-center gap-2 mb-2">

              <Droplets className="w-4 h-4 text-blue-400" />

              <span className="text-xs text-slate-400">

                Moisture

              </span>

            </div>

            <div className="text-xl font-bold text-white">

              {soil.moisture}%

            </div>

          </div>

          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700">

            <div className="flex items-center gap-2 mb-2">

              <Thermometer className="w-4 h-4 text-orange-400" />

              <span className="text-xs text-slate-400">

                Temperature

              </span>

            </div>

            <div className="text-xl font-bold text-white">

              {soil.temperature}°C

            </div>

          </div>

          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700">

            <div className="flex items-center gap-2 mb-2">

              <Leaf className="w-4 h-4 text-emerald-400" />

              <span className="text-xs text-slate-400">

                Organic Matter

              </span>

            </div>

            <div className="text-xl font-bold text-white">

              {soil.organicMatter}%

            </div>

          </div>

        </div>

        {/* NPK */}

        <div className="space-y-3 mt-auto">

          <div>

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm text-slate-400">

                Nitrogen (N)

              </span>

              <span className="text-sm font-semibold text-white">

                {soil.nitrogen}%

              </span>

            </div>

            <Progress
              value={soil.nitrogen}
              className="h-2 bg-slate-800/50"
            />

          </div>

          <div>

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm text-slate-400">

                Phosphorus (P)

              </span>

              <span className="text-sm font-semibold text-white">

                {soil.phosphorus}%

              </span>

            </div>

            <Progress
              value={soil.phosphorus}
              className="h-2 bg-slate-800/50"
            />

          </div>

          <div>

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm text-slate-400">

                Potassium (K)

              </span>

              <span className="text-sm font-semibold text-white">

                {soil.potassium}%

              </span>

            </div>

            <Progress
              value={soil.potassium}
              className="h-2 bg-slate-800/50"
            />

          </div>

        </div>

      </motion.div>
    );
  })}

</div>    </div>
  );
}
