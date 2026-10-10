import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  BrainCircuit,
  ThermometerSun,
  Sprout,
  Sparkles,
  AlertTriangle,
  Layers3,
  Loader2,
  Droplets,
  Leaf,
  Activity,
  MapPinned,
  TrendingUp,
} from "lucide-react";

// Recharts primitives for data visualization
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { getFarms, type Farm } from "../../../services/FarmServices/FarmService";
import { getSoilAnalytics, type SoilAnalyticsResponse } from "../../../services/ClimateIntelligenceServices/SoilAnalyticService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SoilAiResponse {
  suitability: string;
  crop: string;
  confidence: number;
  advisory: string;
}

export function SoilAnalyticsLayer() {
  /*
  |--------------------------------------------------------------------------
  | STATE MANAGEMENT
  |--------------------------------------------------------------------------
  */
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState("");

  const [soilData, setSoilData] = useState<SoilAnalyticsResponse | null>(null);
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);

  const [forecastDate, setForecastDate] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResponse, setAIResponse] = useState<SoilAiResponse | null>(null);

  const selectedFarm = useMemo(
    () => farms.find((farm) => farm.id === selectedFarmId) ?? null,
    [farms, selectedFarmId]
  );

  const isInitialSoilLoad = isLoadingSoil && !soilData;

  /*
  |--------------------------------------------------------------------------
  | HISTORICAL DATA FOR THE SOIL ANALYTICS LAYER
  |--------------------------------------------------------------------------
  | 
  */
  // Reads dynamic values fetched straight out of your controller endpoint
    const graphData = useMemo(() => {
    if (soilData?.dailyTrends && soilData.dailyTrends.length > 0) {
        return soilData.dailyTrends;
    }
    // Fallback if data hasn't loaded yet
    return [
        { day: "Mon", moisture: 0, temperature: 0 },
        { day: "Tue", moisture: 0, temperature: 0 },
        { day: "Wed", moisture: 0, temperature: 0 },
        { day: "Thu", moisture: 0, temperature: 0 },
        { day: "Fri", moisture: 0, temperature: 0 },
        { day: "Sat", moisture: 0, temperature: 0 },
        { day: "Sun", moisture: 0, temperature: 0 },
    ];
    }, [soilData]);

  /*
  |--------------------------------------------------------------------------
  | CONNECTORS & LIFECYCLE
  |--------------------------------------------------------------------------
  */
  const fetchFarmOptions = async () => {
    try {
      setIsLoadingFarms(true);
      const response = await getFarms();
      const fetchedFarms = response.farms ?? [];
      setFarms(fetchedFarms);

      if (fetchedFarms.length > 0) {
        setSelectedFarmId(fetchedFarms[0].id);
      }
    } catch {
      toast.error("Failed to load farms list.");
    } finally {
      setIsLoadingFarms(false);
    }
  };

  const fetchSoilMetrics = async (farmId: string) => {
    try {
      setIsLoadingSoil(true);
      const data = await getSoilAnalytics(farmId);
      setSoilData(data);
    } catch {
      toast.error("Failed to fetch fresh soil measurements.");
    } finally {
      setIsLoadingSoil(false);
    }
  };

  const handleAIPredictionRequest = async () => {
    if (!selectedFarmId || !forecastDate) return;
    setIsLoadingAI(true);
    
    setTimeout(() => {
      setAIResponse({
        suitability: "Highly Suitable",
        crop: selectedCrop,
        confidence: 89,
        advisory: `The current conditions look great for planting ${selectedCrop}. Stable subsoil temperature and balanced moisture retention across deeper layers will protect seed germinating loops on your selected target date.`,
      });
      setIsLoadingAI(false);
      toast.success("AI Agronomic Advisory updated.");
    }, 1500);
  };

  useEffect(() => {
    fetchFarmOptions();
  }, []);

  useEffect(() => {
    if (!selectedFarmId) return;
    fetchSoilMetrics(selectedFarmId);
    setAIResponse(null);
  }, [selectedFarmId]);

  const metrics = soilData?.soilMetrics;
  const analysis = soilData?.rootZoneAnalysis;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">Soil Analytics</h1>
        <p className="mt-2 text-slate-400">
          Monitor your farm's sub-surface temperatures, layered moisture levels, and AI-driven crop suitability conditions <span className="text-amber-400">(7-days interval)</span>.
        </p>
      </motion.div>

      {/* FARM SELECT PANEL */}
      <Card className="border-slate-800 bg-slate-900/55 shadow-xl backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-md font-semibold">
            <MapPinned className="h-5 w-5 text-amber-400" /> Farm Management Context
          </CardTitle>
          <CardDescription className="text-slate-400">
            Select a farm sector to view its live weather and soil profile metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Active Farm Location</label>
            <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
              <SelectTrigger className="border-slate-700 bg-slate-950 text-white focus:ring-amber-500">
                <SelectValue placeholder={isLoadingFarms ? "Loading farms..." : "Select Farm Location"} />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-950 text-white">
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Farm Name</div>
              <div className="break-all text-xs font-semibold text-white">{selectedFarm?.name ?? "--"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Latitude</div>
              <div className="text-xs font-mono text-cyan-400">{selectedFarm ? selectedFarm.latitude : "--"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Longitude</div>
              <div className="text-xs font-mono text-cyan-400">{selectedFarm ? selectedFarm.longitude : "--"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="relative min-h-[400px]">
        {isLoadingSoil && !isInitialSoilLoad && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-2xl text-amber-400 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin" /> Updating live soil charts...
            </div>
          </div>
        )}

        {isInitialSoilLoad ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/45 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm">Reading farm soil indicators...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI DECK GRID */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="border-slate-800 bg-slate-900/55 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-6 w-6 text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Topsoil Moisture (0-7cm)</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">
                        {metrics?.moisture?.surface ? `${(metrics.moisture.surface * 100).toFixed(0)}%` : "--"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <ThermometerSun className="h-6 w-6 text-orange-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Topsoil Temperature</div>
                      <div className="text-3xl font-extrabold text-white mt-0.5">
                        {metrics?.temperature?.surface ? `${metrics.temperature.surface}°C` : "--"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Soil Health Assessment</div>
                      <div className="text-2xl font-bold text-emerald-300 mt-1">{metrics?.soilHealth ?? "--"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-violet-400" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Irrigation Requirement</div>
                      <div className="text-2xl font-bold text-violet-300 mt-1">{metrics?.irrigationNeed ?? "--"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NEW GRAPH TREND SECTION FOR THE CURRENT DATA FETCH PERIOD */}
            <Card className="border-slate-800 bg-slate-900/55 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-md font-semibold">
                  <TrendingUp className="h-5 w-5 text-amber-400" /> Forecast Period Parameter Trends
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Daily summary of surface layer trends showing structural interactions between heat index layers and humidity cycles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={graphData} margin={{ top: 10, right: -10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis yAxisId="left" label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', fill: '#22d3ee', offset: 10 }} stroke="#22d3ee" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight', fill: '#fb923c', offset: 10 }} stroke="#fb923c" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                      <Legend verticalAlign="top" height={36} iconSize={10} />
                      <Bar yAxisId="left" name="Avg Soil Moisture" dataKey="moisture" fill="#0891b2" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Line yAxisId="right" name="Surface Max Temp" type="monotone" dataKey="temperature" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* SPLIT ROW: SECTOR ANALYSIS & SIDEBAR */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              
              {/* LAYERS VIEWSPACE */}
              <div className="space-y-6 xl:col-span-3">
                <Card className="border-slate-800 bg-slate-900/55 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-md font-semibold">
                      <Layers3 className="h-5 w-5 text-cyan-400" /> Detailed Subsurface Profiles
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      View soil matrix readings across separate distinct root-depth profiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* HIGH CONTRAST TAB SWITCHES */}
                    <Tabs defaultValue="moisture" className="w-full">
                      <TabsList className="bg-slate-950 border-2 border-slate-700 p-1.5 rounded-xl w-full grid grid-cols-2 shadow-inner">
                        <TabsTrigger 
                          value="moisture" 
                          className="text-xs font-bold tracking-wide transition-all py-2.5 data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400 hover:text-slate-200"
                        >
                          <Droplets className="h-4 w-4 mr-1.5 inline-block" /> Soil Moisture Content
                        </TabsTrigger>
                        <TabsTrigger 
                          value="temperature" 
                          className="text-xs font-bold tracking-wide transition-all py-2.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400 hover:text-slate-200"
                        >
                          <ThermometerSun className="h-4 w-4 mr-1.5 inline-block" /> Layer Temperature Profile
                        </TabsTrigger>
                      </TabsList>

                      {/* MOISTURE PROFILE LAYERS */}
                      <TabsContent value="moisture" className="space-y-4 pt-6">
                        {[
                          { depth: "Topsoil Zone (0 - 7 cm)", value: metrics?.moisture?.surface ?? 0 },
                          { depth: "Shallow Root Matrix (7 - 28 cm)", value: metrics?.moisture?.shallow ?? 0 },
                          { depth: "Mid-Stratum Bedding (28 - 100 cm)", value: metrics?.moisture?.mid ?? 0 },
                          { depth: "Deep Subsoil Root-zone (100 - 255 cm)", value: metrics?.moisture?.deep ?? 0 },
                        ].map((layer) => (
                          <div key={layer.depth}>
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{layer.depth}</span>
                              <span className="font-mono font-bold text-cyan-400">{(layer.value * 100).toFixed(0)}% Volume</span>
                            </div>
                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                                style={{ width: `${layer.value * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      {/* TEMPERATURE PROFILE LAYERS */}
                      <TabsContent value="temperature" className="space-y-4 pt-6">
                        {[
                          { depth: "Topsoil Zone (0 - 7 cm)", value: metrics?.temperature?.surface ?? 0 },
                          { depth: "Shallow Root Matrix (7 - 28 cm)", value: metrics?.temperature?.shallow ?? 0 },
                          { depth: "Mid-Stratum Bedding (28 - 100 cm)", value: metrics?.temperature?.mid ?? 0 },
                          { depth: "Deep Subsoil Root-zone (100 - 255 cm)", value: metrics?.temperature?.deep ?? 0 },
                        ].map((layer) => (
                          <div key={layer.depth}>
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{layer.depth}</span>
                              <span className="font-mono font-bold text-orange-400">{layer.value}°C</span>
                            </div>
                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500"
                                style={{ width: `${Math.min(layer.value * 2.5, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* PRACTICAL AGRONOMIC STRUCTURAL ANALYSIS */}
                <Card className="border-slate-800 bg-slate-900/55 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white text-md font-semibold">Agronomic Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 items-start">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Sprout className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Root Development Status</div>
                        <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                          {analysis?.expansionCondition ?? "No data available for this sector."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3 items-start">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">Topsoil Risk Warnings</div>
                        <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                          {analysis?.surfaceDryingRisk ?? "Topsoil evaporation rate levels are normal."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SIDEBAR (AI MATCHING CONTROLS) */}
              <div className="space-y-6">
                <Card className="border-slate-800 bg-slate-900/55 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-cyan-500/10">
                    <BrainCircuit className="h-16 w-16" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-cyan-400" /> AI Soil Suitability Engine
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Evaluates subsoil conditions against specific crop growth profiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Target Crop Profile</label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white outline-none focus:border-amber-500 transition-colors cursor-pointer"
                      >
                        <option value="maize">Maize (Corn)</option>
                        <option value="rice">Rice (Lowland/Upland)</option>
                        <option value="cassava">Cassava Cultivars</option>
                        <option value="soybean">Soybean Legumes</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Intended Seeding Date</label>
                      <input
                        type="date"
                        value={forecastDate}
                        onChange={(e) => setForecastDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 outline-none transition-all"
                      />
                    </div>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wide shadow-md"
                      disabled={!selectedFarmId || !forecastDate || isLoadingAI}
                      onClick={handleAIPredictionRequest}
                    >
                      {isLoadingAI ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Evaluating Soil Suitability...
                        </>
                      ) : (
                        "Analyze Soil Suitability"
                      )}
                    </Button>

                    {/* AI INTERACTIONS LAYOUT */}
                    {aiResponse ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Seeding Match</div>
                            <div className="text-lg font-black text-amber-400 mt-0.5">{aiResponse.suitability}</div>
                          </div>
                          <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-mono py-1 rounded-md">
                            {aiResponse.confidence}% Score
                          </Badge>
                        </div>

                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-1.5">
                          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <BrainCircuit className="h-3.5 w-3.5" /> Agronomic Advisory:
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300 font-medium">
                            {aiResponse.advisory}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-[11px] text-slate-500 leading-normal">
                        Select a crop and an intended seeding date to query the agronomic suitability model.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}