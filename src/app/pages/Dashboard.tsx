import { motion } from "motion/react";
import {
  CloudRain,
  Droplets,
  Wind,
  Flame,
  TrendingDown,
  Sprout,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ClimateCard } from "../components/ClimateCard";
import { RiskMap } from "../components/RiskMap";
import { AdvisoryPanel } from "../components/AdvisoryPanel";
import { WeatherWidget } from "../components/WeatherWidget";
import { AlertFeed } from "../components/AlertFeed";
import { FarmInsightCard } from "../components/FarmInsightCard";

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">
              My Farm Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Welcome back! Monitor your farms and get AI-powered climate insights
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/add-farm">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                <Plus className="w-5 h-5 mr-2" />
                Add Farm
              </Button>
            </Link>
            <Link to="/submit-report">
              <Button variant="outline" className="border-orange-500/50 hover:bg-orange-500/20 text-orange-400">
                <Sprout className="w-5 h-5 mr-2" />
                Report Incident
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Climate Risk Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <ClimateCard
          title="Rainfall Probability"
          value="65"
          unit="%"
          icon={CloudRain}
          trend={12}
          progress={65}
          status="good"
          delay={0}
        />
        <ClimateCard
          title="Flood Risk"
          value="High"
          icon={Droplets}
          trend={-8}
          progress={78}
          status="danger"
          delay={0.05}
        />
        <ClimateCard
          title="Soil Moisture"
          value="42"
          unit="%"
          icon={Droplets}
          trend={5}
          progress={42}
          status="warning"
          delay={0.1}
        />
        <ClimateCard
          title="Air Quality"
          value="Good"
          icon={Wind}
          progress={30}
          status="good"
          delay={0.15}
        />
        <ClimateCard
          title="Drought Stress"
          value="Low"
          icon={TrendingDown}
          trend={-15}
          progress={25}
          status="good"
          delay={0.2}
        />
        <ClimateCard
          title="Wildfire Risk"
          value="Medium"
          icon={Flame}
          trend={3}
          progress={55}
          status="warning"
          delay={0.25}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Map & Weather */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Interactive Map */}
          {/* RiskMap was refactored into a chart-driven component, so the
          dashboard now passes an explicit empty state instead of mounting it
          with the old zero-prop signature and crashing at runtime. */}
          <RiskMap
            chartData={[]}
            series={[]}
            metricLabel="farm trends"
            metricUnit=""
            emptyMessage="Open Climate Intelligence Trends to compare farm flood patterns and forecasts."
          />

          {/* Alert Feed */}
          <AlertFeed />
        </div>

        {/* Right Column - Advisory & Insights */}
        <div className="space-y-4 md:space-y-6">
          {/* AI Advisory Panel */}
          <AdvisoryPanel />

          {/* Farm Insights */}
          <FarmInsightCard />

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Active Farms</span>
                <span className="text-lg font-bold text-emerald-400">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">States Monitored</span>
                <span className="text-lg font-bold text-emerald-400">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">AI Predictions Today</span>
                <span className="text-lg font-bold text-emerald-400">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Risk Alerts</span>
                <span className="text-lg font-bold text-orange-400">8</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
