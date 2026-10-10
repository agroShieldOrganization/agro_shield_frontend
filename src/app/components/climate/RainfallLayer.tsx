import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  CloudRain,
  CalendarDays,
  MapPinned,
  Droplets,
  AlertTriangle,
  CloudLightning,
  Loader2,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

import { getFarmMapData } from "../../../services/GisService/GisService";
import {
  getRainfallAnalytics,
  getAIPredictionForDate,
  getDateSnapshot,
  type RainfallAnalyticsResponse,
  type AIPredictionResponse,
  type DateSnapshotResponse,
} from "../../../services/RainfallService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface InterpretationGuide {
  label: string;
  explanation: string;
  badgeClassName: string;
  textClassName: string;
  rangeLabel: string;
}

// Keep the rainfall interpretation bands in the frontend because they are
// presentation guidance for farmers rather than backend source-of-truth data.
const RAINFALL_GUIDE: Array<InterpretationGuide & { min: number; max?: number }> = [
  {
    min: 0,
    max: 0,
    label: "No Rain",
    rangeLabel: "0.0 mm",
    explanation: "No rain at all.",
    badgeClassName: "border-slate-500/20 bg-slate-500/10 text-slate-200",
    textClassName: "text-slate-200",
  },
  {
    min: 0.01,
    max: 0.99,
    label: "Trace Rain",
    rangeLabel: "0.1 mm",
    explanation: "Barely measurable drizzle.",
    badgeClassName: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
    textClassName: "text-cyan-200",
  },
  {
    min: 1,
    max: 4.99,
    label: "Light Rain",
    rangeLabel: "1-5 mm",
    explanation: "Noticeable rain that usually passes quickly.",
    badgeClassName: "border-sky-500/20 bg-sky-500/10 text-sky-200",
    textClassName: "text-sky-200",
  },
  {
    min: 5,
    max: 14.99,
    label: "Moderate Rain",
    rangeLabel: "5-15 mm",
    explanation: "A proper rainy day with steady wet conditions.",
    badgeClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    textClassName: "text-emerald-200",
  },
  {
    min: 15,
    max: 29.99,
    label: "Heavy Rain",
    rangeLabel: "15-30 mm",
    explanation: "Sustained downpour that can disrupt field work.",
    badgeClassName: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    textClassName: "text-amber-200",
  },
  {
    min: 30,
    max: 49.99,
    label: "Very Heavy Rain",
    rangeLabel: "30+ mm",
    explanation: "Flood-risk territory for a single day.",
    badgeClassName: "border-orange-500/20 bg-orange-500/10 text-orange-200",
    textClassName: "text-orange-200",
  },
  {
    min: 50,
    label: "Extreme Rain",
    rangeLabel: "50+ mm",
    explanation: "Serious agricultural and flood concern.",
    badgeClassName: "border-red-500/20 bg-red-500/10 text-red-200",
    textClassName: "text-red-200",
  },
];

// Mirror the probability guide in one place so every rainfall panel speaks the
// same language when it explains the chance of rain.
const PROBABILITY_GUIDE: Array<InterpretationGuide & { min: number; max: number }> = [
  {
    min: 0,
    max: 20,
    label: "Very Unlikely",
    rangeLabel: "0-20%",
    explanation: "Clear day expected.",
    badgeClassName: "border-slate-500/20 bg-slate-500/10 text-slate-200",
    textClassName: "text-slate-200",
  },
  {
    min: 20.01,
    max: 40,
    label: "Slight Chance",
    rangeLabel: "20-40%",
    explanation: "Possible but not expected.",
    badgeClassName: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
    textClassName: "text-cyan-200",
  },
  {
    min: 40.01,
    max: 60,
    label: "Uncertain",
    rangeLabel: "40-60%",
    explanation: "Could go either way.",
    badgeClassName: "border-indigo-500/20 bg-indigo-500/10 text-indigo-200",
    textClassName: "text-indigo-200",
  },
  {
    min: 60.01,
    max: 80,
    label: "Likely",
    rangeLabel: "60-80%",
    explanation: "Plan for rain.",
    badgeClassName: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    textClassName: "text-amber-200",
  },
  {
    min: 80.01,
    max: 100,
    label: "Almost Certain",
    rangeLabel: "80-100%",
    explanation: "Rain is expected.",
    badgeClassName: "border-red-500/20 bg-red-500/10 text-red-200",
    textClassName: "text-red-200",
  },
];

function getRainfallGuide(rainMm: number): InterpretationGuide {
  return (
    RAINFALL_GUIDE.find((entry) => rainMm >= entry.min && (entry.max === undefined || rainMm <= entry.max)) ??
    RAINFALL_GUIDE[0]
  );
}

function getProbabilityGuide(probability: number): InterpretationGuide {
  const boundedProbability = Math.max(0, Math.min(100, probability));

  return (
    PROBABILITY_GUIDE.find(
      (entry) => boundedProbability >= entry.min && boundedProbability <= entry.max,
    ) ?? PROBABILITY_GUIDE[0]
  );
}

export function RainfallLayer() {
  /*
  |--------------------------------------------------------------------------
  | STATE CONTROLLERS
  |--------------------------------------------------------------------------
  */
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [forecastDate, setForecastDate] = useState<string>("");


  // Single Forecast State
  const [lookupDate, setLookupDate] = useState<string>("");
  const [dateSnapshot, setDateSnapshot] = useState<DateSnapshotResponse | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState<boolean>(false);


  // Trigger Action Hooks for the Singel Forecast
  const handleLookupDateChange = async (dateVal: string) => {
  setLookupDate(dateVal);
  if (!selectedFarm || !dateVal) return;

  try {
    setIsLoadingSnapshot(true);
    const data = await getDateSnapshot(selectedFarm, dateVal);
    setDateSnapshot(data);
  } catch {
    toast.error("Could not fetch weather metrics for this date.");
  } finally {
    setIsLoadingSnapshot(false);
  }
};

  // Dashboard Core (Open-Meteo)
  const [rainfallStats, setRainfallStats] = useState<RainfallAnalyticsResponse | null>(null);
  const [isLoadingRainfall, setIsLoadingRainfall] = useState(false);

  // AI Predictor Core (AI Agent Controller)
  const [aiPrediction, setAiPrediction] = useState<AIPredictionResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const isInitialRainfallLoad = isLoadingRainfall && !rainfallStats;

  /*
  |--------------------------------------------------------------------------
  | WEATHER DATA REFRESH FUNCTION
  |--------------------------------------------------------------------------
  */
  const fetchFarms = async () => {
    try {
      setIsLoadingFarms(true);
      const response = await getFarmMapData();
      const fetchedFarms = response.farms ?? [];
      setFarms(fetchedFarms);

      if (fetchedFarms.length > 0) {
        setSelectedFarm(fetchedFarms[0].id);
      }
    } catch {
      toast.error("Failed to load farms");
    } finally {
      setIsLoadingFarms(false);
    }
  };

  const fetchRainfallAnalytics = async (farmId: string) => {
    try {
      setIsLoadingRainfall(true);
      const data = await getRainfallAnalytics(farmId);
      setRainfallStats(data);
    } catch {
      toast.error("Failed to load rainfall analytics");
    } finally {
      setIsLoadingRainfall(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EXECUTE AI DATE PREDICTOR PIPELINE
  |--------------------------------------------------------------------------
  */
  const handleAIPredictionRequest = async () => {
    if (!selectedFarm || !forecastDate) {
      toast.error("Please ensure a farm and a target date are selected.");
      return;
    }
    try {
      setIsLoadingAI(true);
      const data = await getAIPredictionForDate(selectedFarm, forecastDate);
      setAiPrediction(data);
      toast.success("AI planting advisory updated for chosen date!");
    } catch {
      toast.error("The AI agent could not process this date model. Check server logs.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WATCHERS & REACTION LIFECYCLE Loops
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (!selectedFarm) return;
    fetchRainfallAnalytics(selectedFarm);
    // Reset derived panels when the farm context changes so only one
    // analytics request runs per selection and stale snapshot data clears.
    setAiPrediction(null);
    setForecastDate("");
    setLookupDate("");
    setDateSnapshot(null);
  }, [selectedFarm]);

  const summary = rainfallStats?.summary;
  const snapshotRainGuide = dateSnapshot ? getRainfallGuide(dateSnapshot.rain_mm) : null;
  const snapshotProbabilityGuide = dateSnapshot ? getProbabilityGuide(dateSnapshot.probability) : null;
  const summaryProbabilityGuide = getProbabilityGuide(summary?.rain_probability ?? 0);
  const aiRainGuide = aiPrediction ? getRainfallGuide(aiPrediction.predicted_rainfall_mm) : null;
  const aiProbabilityGuide = aiPrediction ? getProbabilityGuide(aiPrediction.likelyhood_of_raining) : null;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Rainfall Intelligence
        </h1>
        <p className="mt-2 text-slate-400">
          Monitor cumulative averages, map historical records, and run predictive AI agricultural planting models.
        </p>
      </motion.div>

      {/* TOP RACK: FARM DROP SELECTOR */}
      {/* TOP DECK GRID: SELECTION PANEL & LOOKUP SNAPSHOT TOOL */}
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  
  {/* FARM SELECTOR CARD */}
  <Card className="border-slate-800 bg-slate-900/55 shadow-xl backdrop-blur-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-white text-md">
        <MapPinned className="h-5 w-5 text-cyan-400" /> Farm Selection
      </CardTitle>
      <CardDescription className="text-slate-400">
        {isLoadingFarms ? "Syncing coordinates..." : "Choose farm operational zone"}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Select value={selectedFarm} onValueChange={setSelectedFarm}>
        <SelectTrigger className="border-slate-700 bg-slate-950 text-white focus:ring-cyan-500">
          <SelectValue placeholder="Fetching Farms..." />
        </SelectTrigger>
        <SelectContent className="border-slate-700 bg-slate-950 text-white">
          {farms.map((farm) => (
            <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>

  {/* NEW: QUICK DATE LOOKUP SNAPSHOT CARD */}
  <Card className="border-slate-800 bg-slate-900/55 shadow-xl backdrop-blur-md lg:col-span-2">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-white text-md">
        <CalendarDays className="h-5 w-5 text-indigo-400" /> Quick Date Weather Lookup
      </CardTitle>
      <CardDescription className="text-slate-400">
        Select a target timeline date to inspect forecast.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        
        {/* Date Input Box */}
        <div className="md:col-span-2">
          <input
            type="date"
            value={lookupDate}
            min={new Date().toISOString().split('T')[0]} // Block previous historical selection dates
            onChange={(e) => handleLookupDateChange(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Real-time Values Display */}
        <div className="md:col-span-3 flex items-center justify-center border border-slate-800 bg-slate-950/60 rounded-md h-[42px] px-4">
          {isLoadingSnapshot ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" /> Calculating metrics...
            </div>
          ) : dateSnapshot ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="grid w-full grid-cols-1 gap-2 text-xs md:grid-cols-[1fr_auto_1fr_auto]"
            >
              {/* Show the interpretation guide next to the raw rain value so
              farmers can read the number without translating millimeters. */}
              <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <div className="min-w-0">
                  <div className="text-slate-300">Rain</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{dateSnapshot.rain_mm} mm</span>
                    {snapshotRainGuide ? (
                      <Badge className={cn("text-[10px] font-normal", snapshotRainGuide.badgeClassName)}>
                        {snapshotRainGuide.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="hidden h-3 w-[1px] bg-slate-800 md:block" />
              {/* Apply the same interpretation system to chance-of-rain values
              so the whole rainfall UI uses one consistent vocabulary. */}
              <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
                <CloudLightning className="h-4 w-4 text-orange-400" />
                <div className="min-w-0">
                  <div className="text-slate-300">Probability</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-white">{dateSnapshot.probability}%</strong>
                    {snapshotProbabilityGuide ? (
                      <Badge
                        className={cn("text-[10px] font-normal", snapshotProbabilityGuide.badgeClassName)}
                      >
                        {snapshotProbabilityGuide.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <Badge className="justify-self-start text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20 capitalize font-normal px-1.5 py-0 md:justify-self-end">
                {dateSnapshot.source.replace('_', ' ')}
              </Badge>
            </motion.div>
          ) : (
            <span className="text-xs text-slate-500 font-normal">Choose a target calendar date above to display parameters</span>
          )}
        </div>

      </div>
    </CardContent>
  </Card>

</div>

      {/* MAIN INTELLIGENCE GRID SYSTEM FRAME */}
      <div className="relative min-h-[500px]">
        {/* Keep refresh feedback inline so analytics updates do not block the
        whole workspace or break the page flow. */}
        {isLoadingRainfall && !isInitialRainfallLoad && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing rainfall analytics timeline...</span>
          </div>
        )}

        {/* COLD START INTERRUPT SCREEN */}
        {isInitialRainfallLoad ? (
          <div className="flex h-[500px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/45 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-sm">Assembling spatial precipitation analytics models...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI DECK ROW 1 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-slate-800 bg-slate-900/55 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                    <CloudRain className="h-5 w-5 text-blue-400" /> Predicted Next Rain Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-blue-300 tracking-tight">
                    {summary?.next_rain_event ?? "No immediate rain event expected"}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Based on Daily weather forecast.</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                    <CloudLightning className="h-5 w-5 text-orange-400" /> Next 24H Maximum Probability
                  </CardTitle>
                </CardHeader>
                <CardContent >
                  <div className="text-4xl font-extrabold text-orange-400 tracking-tight ">
                    {summary?.rain_probability ?? 0}%
                  </div>
                  {/* Turn the probability score into a plain-language action
                  label instead of leaving it as a raw percentage only. */}
                  <Badge
                    className={cn("mt-3 rounded-md", summaryProbabilityGuide.badgeClassName)}
                  >
                    {summaryProbabilityGuide.label}
                  </Badge>
                  <p className={cn("mt-2 text-xs", summaryProbabilityGuide.textClassName)}>
                    {summaryProbabilityGuide.explanation}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* NEXT 1-MONTH AVERAGES ACCUMULATION KPI GRID (Demand 4) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-slate-800 bg-slate-900/55 transition-all hover:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">30-Day Daily Avg</div>
                      <div className="text-2xl font-bold text-white mt-0.5">{summary?.daily_rainfall ?? 0} mm</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 transition-all hover:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">30-Day Weekly Avg</div>
                      <div className="text-2xl font-bold text-white mt-0.5">{summary?.weekly_rainfall ?? 0} mm</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 transition-all hover:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                      <CloudRain className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Monthly Forecast</div>
                      <div className="text-2xl font-bold text-white mt-0.5">{summary?.monthly_rainfall ?? 0} mm</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SPLIT SCREEN VISUALIZATION WORKSPACE */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              {/* TIMELINE AREA GRAPH PANEL (Demand 1) */}
              <div className="xl:col-span-3 space-y-6">
                <Card className="border-slate-800 bg-slate-900/55 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg font-semibold">Rainfall Trend Analytics</CardTitle>
                    <CardDescription className="text-slate-400">
                      Real-time trend analysis mapping precipitation depth (mm) against forecast probabilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[380px] w-full pt-4">
                      {rainfallStats?.series && rainfallStats.series.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={rainfallStats.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Rain Volume (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', offset: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }} />
                            <Area type="monotone" dataKey="rain_mm" name="Rainfall Depth (mm)" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                          No sequential timeline series generated for this coordinates.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* DEDICATED PREDICTIVE SIDEBAR PANEL (Demand 5) */}
              <div className="space-y-6">
                <Card className="border-slate-800 bg-slate-900/55 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-cyan-500/20">
                    <BrainCircuit className="h-16 w-16" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-md flex items-center gap-1.5 font-bold">
                      <Sparkles className="h-4 w-4 text-cyan-400" /> AI Agent Climate Forecaster
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Query long-range planetary AI models for specialized agronomic insights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium">Select Prediction Date Target</label>
                      <input
                        type="date"
                        value={forecastDate}
                        onChange={(e) => setForecastDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      />
                    </div>

                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-900/20"
                      disabled={!selectedFarm || !forecastDate || isLoadingAI}
                      onClick={handleAIPredictionRequest}
                    >
                      {isLoadingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Consulting AI Agent...
                        </>
                      ) : (
                        "Generate AI Planting Advice"
                      )}
                    </Button>

                    {/* DYNAMICALLY LOADED AI CONTROLLER FRAME */}
                    {aiPrediction ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                          <div className="text-xs text-slate-400 font-medium">Model Precipitation Estimates</div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-cyan-300">{aiPrediction.predicted_rainfall_mm} mm</span>
                            <span className="text-xs font-semibold text-orange-400">Prob: {aiPrediction.likelyhood_of_raining}%</span>
                          </div>
                          {/* Reuse the same frontend guide here so the AI panel
                          reads consistently with the quick lookup and KPI deck. */}
                          <div className="flex flex-wrap gap-2">
                            {aiRainGuide ? (
                              <Badge className={cn("font-normal", aiRainGuide.badgeClassName)}>
                                {aiRainGuide.label}
                              </Badge>
                            ) : null}
                            {aiProbabilityGuide ? (
                              <Badge className={cn("font-normal", aiProbabilityGuide.badgeClassName)}>
                                {aiProbabilityGuide.label}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-slate-500">Atmospheric Humidity Target: {aiPrediction.humidity}%</div>
                        </div>

                        {/* AI WRITTEN ADVISORY OUTPUT BOX */}
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-2">
                          <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                            <BrainCircuit className="h-3.5 w-3.5" /> AI Planting Fit Analysis:
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {aiPrediction.advisory?.planting_advice ?? "AI response compiled but unparsed."}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                        Pick a date window above and click generate to invoke deep-learning soil & rainfall suitability reports.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div> {/* End Layout Grid */}

            {/* Add one reference card so farmers can quickly decode rainfall
            amounts and rain chances anywhere on this screen. */}
            <Card className="border-slate-800 bg-slate-900/55 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg font-semibold">Rainfall Reading Guide</CardTitle>
                <CardDescription className="text-slate-400">
                  Use this guide to interpret the rainfall and probability values shown across the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Rainfall Depth Guide</div>
                  <div className="space-y-2">
                    {RAINFALL_GUIDE.map((entry) => (
                      <div
                        key={`${entry.label}-${entry.min}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-white">{entry.label}</div>
                          <div className="text-xs text-slate-400">{entry.explanation}</div>
                        </div>
                        <Badge className={cn("shrink-0 font-normal", entry.badgeClassName)}>
                          {entry.rangeLabel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Rain Chance Guide</div>
                  <div className="space-y-2">
                    {PROBABILITY_GUIDE.map((entry) => (
                      <div
                        key={`${entry.label}-${entry.min}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-white">{entry.label}</div>
                          <div className="text-xs text-slate-400">{entry.explanation}</div>
                        </div>
                        <Badge className={cn("shrink-0 font-normal", entry.badgeClassName)}>
                          {entry.rangeLabel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
