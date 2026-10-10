import { motion } from "motion/react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarRange,
  LineChart as LineChartIcon,
  Loader2,
  LocateFixed,
  Waves,
} from "lucide-react";

import { RiskMap } from "../RiskMap";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  getFarmMapData,
} from "../../../services/GisService/GisService";

import {
  getFloodRisks,
} from "../../../services/TomorrowIOServices/FloodRiskService";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status?: string;
  primary_crop_name?: string | null;
  location_name?: string | null;
}

interface FloodRiskGraphMetric {
  dates?: string[];
  values?: number[];
}

interface FloodRisk {
  farm_id: string;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  flood_risk: number;
  risk_level: string;
  risk_date?: string | null;
  weather?: {
    peak_discharge?: number;
    flood_threshold_p95?: number;
    flood_threshold_p75?: number;
    long_term_mean?: number;
    risk_ratio?: number;
    rainfall?: number;
    temperature?: number;
    air_quality?: number;
    soil_temperature?: number;
  };
  graph?: {
    series?: {
      dates?: string[];
      discharge?: number[];
    };
    forecast?: {
      dates?: string[];
      discharge?: number[];
      discharge_max?: number[];
    };
    thresholds?: {
      flood_level_p95?: number;
      elevated_p75?: number;
      long_term_mean?: number;
    };
    // Extensible bag for future backend metric series.
    metrics?: Record<string, FloodRiskGraphMetric>;
  };
}

interface FarmClimateRecord {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  status?: string;
  primary_crop_name?: string | null;
  location_name?: string | null;
  floodRisk: FloodRisk | null;
}

interface ChartPoint {
  date: string;
  label: string;
  [key: string]: string | number | null;
}

type DateRangeId =
  | "7d"
  | "30d"
  | "90d"
  | "180d"
  | "365d";

/*
|--------------------------------------------------------------------------
| METRIC TYPES
|--------------------------------------------------------------------------
|
| Only metrics that produce a real time-series are allowed as chart options.
| Scalar constants (p95, p75, long_term_mean, flood_risk_probability) are
| rendered as fixed reference lines on the chart, not selectable series.
| Unimplemented backend metrics (rainfall, temperature, etc.) are removed
| from all selectors until the backend actually sends them.
|
*/

type ChartMetricId =
  | "river_discharge"
  | "forecast_discharge"
  | "forecast_peak_discharge";

/*
|--------------------------------------------------------------------------
| SNAPSHOT METRICS
|--------------------------------------------------------------------------
|
| The three snapshot values shown in the "Selected Farm Snapshot" card are
| fixed — farmers always need the same three data points. Replacing the
| three configurable selectors with hardcoded constants removes 3 state
| variables, 3 Select components, and 30 dead option slots.
|
*/

type SnapshotMetricId =
  | "forecast_peak_discharge"
  | "flood_risk_probability"
  | "flood_threshold_p95";

interface MetricOption<T extends string = string> {
  value: T;
  label: string;
  unit: string;
  description: string;
}

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const DATE_RANGE_OPTIONS: Array<{
  value: DateRangeId;
  label: string;
  days: number;
}> = [
  { value: "7d",   label: "Last 7 Days",     days: 7   },
  { value: "30d",  label: "Last 30 Days",    days: 30  },
  { value: "90d",  label: "Last 90 Days",    days: 90  },
  { value: "180d", label: "Last 180 Days",   days: 180 },
  { value: "365d", label: "Last 12 Months",  days: 365 },
];

/*
|--------------------------------------------------------------------------
| CHART METRIC OPTIONS
|--------------------------------------------------------------------------
|
| Removed from previous version:
|   ✗ flood_risk_probability  — scalar, draws a flat horizontal line
|   ✗ flood_threshold_p95     — scalar, draws a flat horizontal line
|   ✗ flood_threshold_p75     — scalar, draws a flat horizontal line
|   ✗ long_term_mean          — scalar, draws a flat horizontal line
|   ✗ rainfall                — unimplemented, backend does not send yet
|   ✗ temperature             — unimplemented, backend does not send yet
|   ✗ air_quality             — unimplemented, backend does not send yet
|   ✗ soil_temperature        — unimplemented, backend does not send yet
|
| Scalars are now drawn as named reference lines directly on the chart.
| Unimplemented metrics will be added back once the backend sends them.
|
*/

const CHART_METRIC_OPTIONS: MetricOption<ChartMetricId>[] = [
  {
    value: "river_discharge",
    label: "River Flow History",
    unit: "m³/s",
    description: "Past river flow across the selected date range.",
  },
  {
    value: "forecast_discharge",
    label: "7-Day Forecast Flow",
    unit: "m³/s",
    description: "Expected river flow for the next 7 days.",
  },
  {
    value: "forecast_peak_discharge",
    label: "7-Day Peak Forecast Flow",
    unit: "m³/s",
    description: "Highest expected river flow within the next 7 days.",
  },
];

/*
|--------------------------------------------------------------------------
| SNAPSHOT METRIC DEFINITIONS
|--------------------------------------------------------------------------
|
| Used only as a lookup map for labels/units/descriptions. Not rendered
| as a dropdown — the three values are permanently fixed.
|
*/

const SNAPSHOT_METRIC_DEFINITIONS: MetricOption<SnapshotMetricId>[] = [
  {
    value: "forecast_peak_discharge",
    label: "Peak Forecast Flow",
    unit: "m³/s",
    description: "The highest river flow expected in the next 7 days.",
  },
  {
    value: "flood_risk_probability",
    label: "Flood Risk Probability",
    unit: "%",
    description: "Current risk score produced by the backend.",
  },
  {
    value: "flood_threshold_p95",
    label: "Flood Warning Level",
    unit: "m³/s",
    description: "A historical warning level built from long-term river records.",
  },
];

/*
|--------------------------------------------------------------------------
| The three snapshot metrics shown in the farm snapshot card.
| Fixed — no user configuration needed or offered.
|--------------------------------------------------------------------------
*/

const FIXED_SNAPSHOT_METRICS: SnapshotMetricId[] = [
  "forecast_peak_discharge",
  "flood_risk_probability",
  "flood_threshold_p95",
];

const LINE_COLORS = [
  "#38bdf8",
  "#22c55e",
  "#f97316",
  "#e879f9",
  "#facc15",
  "#14b8a6",
  "#fb7185",
  "#818cf8",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDateRangeValues(range: DateRangeId) {
  const option =
    DATE_RANGE_OPTIONS.find((item) => item.value === range) ??
    DATE_RANGE_OPTIONS[2];

  const endDate   = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (option.days - 1));

  return {
    startDate: formatDateKey(startDate),
    endDate:   formatDateKey(endDate),
  };
}

function toNumberOrNull(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatMetricValue(
  value: number | null | undefined,
  unit = "",
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
}

function getRiskBadgeClasses(riskLevel?: string): string {
  if (riskLevel === "high")   return "border-red-500/30 bg-red-500/10 text-red-300";
  if (riskLevel === "medium") return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

function getSeriesForChartMetric(
  record: FarmClimateRecord,
  metric: ChartMetricId
): { dates: string[]; values: (number | null)[] } {
  const graph = record.floodRisk?.graph;

  switch (metric) {
    case "river_discharge":
      return {
        dates:  graph?.series?.dates    ?? [],
        values: graph?.series?.discharge ?? [],
      };

    case "forecast_discharge":
      return {
        dates:  graph?.forecast?.dates    ?? [],
        values: graph?.forecast?.discharge ?? [],
      };

    case "forecast_peak_discharge":
      return {
        dates:  graph?.forecast?.dates ?? [],
        values: graph?.forecast?.discharge_max ?? graph?.forecast?.discharge ?? [],
      };
  }
}

function getSnapshotValue(
  record: FarmClimateRecord,
  metric: SnapshotMetricId
): number | null {
  const floodRisk = record.floodRisk;

  switch (metric) {
    case "forecast_peak_discharge":
      return toNumberOrNull(floodRisk?.weather?.peak_discharge);

    case "flood_risk_probability":
      return toNumberOrNull(floodRisk?.flood_risk);

    case "flood_threshold_p95":
      return toNumberOrNull(
        floodRisk?.graph?.thresholds?.flood_level_p95 ??
        floodRisk?.weather?.flood_threshold_p95
      );
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function FloodLayer() {

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [farms,       setFarms]       = useState<Farm[]>([]);
  const [floodRisks,  setFloodRisks]  = useState<FloodRisk[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [dateRange,   setDateRange]   = useState<DateRangeId>("90d");
  const [chartMetric, setChartMetric] = useState<ChartMetricId>("river_discharge");
  const [selectedFarmId, setSelectedFarmId] = useState("all");

  /*
  |--------------------------------------------------------------------------
  | FETCH DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchMapData() {
      try {
        setIsLoading(true);

        const { startDate, endDate } = getDateRangeValues(dateRange);

        const farmResponse = await getFarmMapData();
        setFarms(farmResponse.farms ?? []);

        const floodResponse = await getFloodRisks({ startDate, endDate });
        setFloodRisks(floodResponse.flood_risks ?? []);

      } catch (error) {
        console.error("Failed to fetch climate map data", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMapData();

  }, [dateRange]);

  /*
  |--------------------------------------------------------------------------
  | MERGED FARM DIRECTORY
  |--------------------------------------------------------------------------
  */

  const farmDirectory = useMemo(() => {

    const riskByFarmId = new Map(
      floodRisks.map((risk) => [risk.farm_id, risk])
    );

    const mergedFarms = farms.map((farm) => ({
      id:                farm.id,
      name:              farm.name,
      latitude:          toNumberOrNull(farm.latitude),
      longitude:         toNumberOrNull(farm.longitude),
      status:            farm.status,
      primary_crop_name: farm.primary_crop_name,
      location_name:     farm.location_name,
      floodRisk:         riskByFarmId.get(farm.id) ?? null,
    }));

    const orphanRisks = floodRisks
      .filter((risk) => !farms.some((farm) => farm.id === risk.farm_id))
      .map((risk) => ({
        id:                risk.farm_id,
        name:              risk.name ?? `Farm ${risk.farm_id}`,
        latitude:          toNumberOrNull(risk.latitude),
        longitude:         toNumberOrNull(risk.longitude),
        status:            "active",
        primary_crop_name: null,
        location_name:     null,
        floodRisk:         risk,
      }));

    return [...mergedFarms, ...orphanRisks].sort((a, b) =>
      (b.floodRisk?.flood_risk ?? 0) - (a.floodRisk?.flood_risk ?? 0)
    );

  }, [farms, floodRisks]);

  useEffect(() => {
    if (selectedFarmId !== "all") {
      const farmStillExists = farmDirectory.some((f) => f.id === selectedFarmId);
      if (!farmStillExists) setSelectedFarmId("all");
    }
  }, [farmDirectory, selectedFarmId]);

  /*
  |--------------------------------------------------------------------------
  | CHART DATA
  |--------------------------------------------------------------------------
  */

  const chartMetricMeta = useMemo(
    () =>
      CHART_METRIC_OPTIONS.find((item) => item.value === chartMetric) ??
      CHART_METRIC_OPTIONS[0],
    [chartMetric]
  );

  const chartSeries = useMemo(() => {
    return farmDirectory
      .filter((farm) => {
        const series = getSeriesForChartMetric(farm, chartMetric);
        return series.values.some((v) => toNumberOrNull(v) !== null);
      })
      .map((farm, index) => ({
        key:   farm.id,
        label: farm.name,
        color: LINE_COLORS[index % LINE_COLORS.length],
      }));
  }, [chartMetric, farmDirectory]);

  const chartData = useMemo<ChartPoint[]>(() => {

    const dateMap = new Map<string, ChartPoint>();

    farmDirectory.forEach((farm) => {
      const series = getSeriesForChartMetric(farm, chartMetric);

      series.dates.forEach((date, index) => {
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, label: formatDateLabel(date) });
        }

        const point = dateMap.get(date);
        if (!point) return;

        point[farm.id] = toNumberOrNull(series.values[index]);
      });
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

  }, [chartMetric, farmDirectory]);

  // Keep previously loaded content on screen during refetches so changing
  // the date range or chart metric does not collapse the whole page.
  const hasChartContent =
    chartData.length > 0 &&
    chartSeries.length > 0;

  const isInitialChartLoad =
    isLoading &&
    !hasChartContent;

  /*
  |--------------------------------------------------------------------------
  | SELECTED FARM
  |--------------------------------------------------------------------------
  */

  const selectedFarm = useMemo(() => {
    if (farmDirectory.length === 0) return null;
    if (selectedFarmId === "all")   return farmDirectory[0];
    return (
      farmDirectory.find((farm) => farm.id === selectedFarmId) ??
      farmDirectory[0]
    );
  }, [farmDirectory, selectedFarmId]);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => ({
    totalFarms:    farmDirectory.length,
    activeFarms:   farmDirectory.filter((f) => f.status === "active").length,
    highRiskFarms: farmDirectory.filter((f) => f.floodRisk?.risk_level === "high").length,
    mediumRiskFarms: farmDirectory.filter((f) => f.floodRisk?.risk_level === "medium").length,
  }), [farmDirectory]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
      >
        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          Climate Intelligence Trends
        </h1>
        <p className="text-sm text-slate-400 md:text-base">
          Compare farm-by-farm flood trends, switch date ranges, and inspect
          risk metrics from the backend time-series response.
        </p>
      </motion.div>


          {/* SUMMARY STAT TILES */}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            {[
              { label: "Total Farms",        value: stats.totalFarms,      accent: "text-white"        },
              { label: "Active Farms",        value: stats.activeFarms,     accent: "text-emerald-300"  },
              { label: "High Risk Farms",     value: stats.highRiskFarms,   accent: "text-red-300"      },
              { label: "Medium Risk Farms",   value: stats.mediumRiskFarms, accent: "text-orange-300"   },
            ].map((item) => (
              <Card key={item.label} className="border-slate-800 bg-slate-900/55">
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-400">{item.label}</div>
                  <div className={`mt-2 text-3xl font-bold ${item.accent}`}>
                    {item.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

      {/* CONTROLS */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-5"
      >
        {/* DATE RANGE */}

        <Card className="border-slate-800 bg-slate-900/55 xl:col-span-2">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-emerald-300">
              <CalendarRange className="h-4 w-4" />
              <CardTitle className="text-base font-semibold text-white">
                Date Range
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Choose range used to fetch farm trend lines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as DateRangeId)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950/70 text-white">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-950 text-white">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* CHART METRIC
            Previously this card also contained three "Insight" selectors
            (detailMetricOne/Two/Three) that controlled the snapshot card.
            They are removed — the snapshot now shows three fixed, always-
            relevant metrics. The card is now a single focused selector. */}

        <Card className="border-slate-800 bg-slate-900/55 xl:col-span-3">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <LineChartIcon className="h-4 w-4" />
              <CardTitle className="text-base font-semibold text-white">
                Chart Parameter
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Pick which time-series parameter is plotted as one line per farm.
              Threshold reference lines (P95, P75, long-term mean) are always
              drawn on the chart regardless of this selection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={chartMetric}
              onValueChange={(value) => setChartMetric(value as ChartMetricId)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950/70 text-white">
                <SelectValue placeholder="Select chart metric" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-950 text-white">
                {CHART_METRIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">

        {/* LEFT — MAP + SUMMARY STATS */}

        <div className="space-y-6 xl:col-span-3">

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1   }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Use a compact inline status row during refreshes so the chart
            layout stays anchored instead of being replaced by a loader. */}
            {isLoading && hasChartContent ? (
              <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Updating flood trend data for the selected range...
                </span>
              </div>
            ) : null}

            {isInitialChartLoad ? (
              <div className="flex h-[720px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/40">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>
                    Loading climate trend lines...
                  </span>
                </div>
              </div>
            ) : (
              <RiskMap
                chartData={chartData}
                series={chartSeries}
                metricLabel={chartMetricMeta.label}
                metricUnit={chartMetricMeta.unit}
                highlightedFarmId={
                  selectedFarmId === "all" ? null : selectedFarmId
                }
                emptyMessage={`${chartMetricMeta.label} is not available in the current backend response for the selected range.`}
              />
            )}
          </motion.div>

          {/* This explainer card translates the technical hydrology terms
          into farmer-friendly language so users can understand what the
          chart is showing and how the backend creates the risk result. */}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <Card className="border-slate-800 bg-slate-900/55">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <LineChartIcon className="h-4 w-4" />
                  <CardTitle className="text-lg font-semibold text-white">
                    Understanding This Chart
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  A simple guide to what each value means and how the system decides when flood risk is high.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="text-sm font-semibold text-white">
                      River Flow History
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This shows how much water has already been moving through the river near each farm during the date range you selected.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="text-sm font-semibold text-white">
                      7-Day Forecast Flow
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This shows the expected river flow for the next 7 days, based on the flood forecast model used by the backend.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="text-sm font-semibold text-white">
                      7-Day Peak Forecast Flow
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This is the highest predicted river flow within that 7-day forecast window. It is the main value used to test how serious the flood risk may become.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="text-sm font-semibold text-white">
                    How Flood Risk Is Generated
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The backend compares the peak forecast flow against a historical flood warning level for that river location. That warning level is built from long-term river records from 1984 to today. If the forecast peak gets close to or rises above that warning level, the farm’s flood risk probability increases and the status can move from low to medium or high.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="text-sm font-semibold text-white">
                      Flood Risk Probability
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This is the final risk score shown as a percentage. A higher percentage means the predicted river behavior is moving closer to dangerous flood conditions.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="text-sm font-semibold text-white">
                      Flood Warning Level
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This is the technical threshold the system uses in the background. It does not mean flooding is happening now, but it helps the system judge when forecast flow is becoming risky.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* RIGHT SIDEBAR */}

        <div className="space-y-6">

          {/* FARM RISK DIRECTORY */}

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-800 bg-slate-900/55">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-2 text-orange-300">
                  <Waves className="h-4 w-4" />
                  <CardTitle className="text-lg font-semibold text-white">
                    Farm Risk Directory
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Select a farm to inspect its snapshot, or browse all farms
                  sorted by flood probability.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Select
                  value={selectedFarmId}
                  onValueChange={setSelectedFarmId}
                >
                  <SelectTrigger className="border-slate-700 bg-slate-950/70 text-white">
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-950 text-white">
                    <SelectItem value="all">
                      Highlight Highest Risk Farm
                    </SelectItem>
                    {farmDirectory.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-3">
                    {farmDirectory.map((farm, index) => {

                      const isHighRisk =
                        farm.floodRisk?.risk_level === "high";

                      const floodRiskValue =
                        toNumberOrNull(farm.floodRisk?.flood_risk);

                      const isSelected =
                        selectedFarmId === farm.id ||
                        (selectedFarmId === "all" && index === 0);

                      return (
                        <button
                          key={farm.id}
                          type="button"
                          onClick={() => setSelectedFarmId(farm.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition hover:border-cyan-400/40 hover:bg-slate-800/50 ${
                            isSelected
                              ? "border-cyan-400/50 bg-slate-800/55"
                              : "border-slate-800 bg-slate-950/45"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isHighRisk ? "text-red-300" : "text-white"}`}>
                                  {farm.name}
                                </span>
                                {isHighRisk && (
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                Lat: {formatMetricValue(farm.latitude, "", 4)} |{" "}
                                Lng: {formatMetricValue(farm.longitude, "", 4)}
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className={getRiskBadgeClasses(
                                farm.floodRisk?.risk_level
                              )}
                            >
                              {farm.floodRisk?.risk_level ?? "low"}
                            </Badge>
                          </div>

                          <div className={`mt-3 text-sm ${isHighRisk ? "text-red-300" : "text-slate-300"}`}>
                            Flood risk probability:{" "}
                            {formatMetricValue(floodRiskValue, "%", 1)}
                          </div>

                          <div className="mt-2 text-xs text-slate-500">
                            {farm.location_name ?? "No location label"}
                            {farm.primary_crop_name
                              ? ` • ${farm.primary_crop_name}`
                              : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* SELECTED FARM SNAPSHOT
              Previously: three configurable Select dropdowns let users pick
              which metrics to display here, requiring 3 state variables and
              3 × 10 = 30 option slots (many pointing to unimplemented data).
              Now: three fixed metrics always shown. Farmers always need peak
              discharge, flood probability, and the historical flood threshold
              — there is no meaningful alternative combination. */}

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-slate-800 bg-slate-900/55">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-2 text-cyan-300">
                  <LocateFixed className="h-4 w-4" />
                  <CardTitle className="text-lg font-semibold text-white">
                    Selected Farm Snapshot
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Peak discharge, flood probability, and the historical flood
                  threshold for the selected farm.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {selectedFarm ? (
                  <>
                    {/* FARM IDENTITY BLOCK */}

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            Farm
                          </div>
                          <div className={`mt-2 text-lg font-semibold ${
                            selectedFarm.floodRisk?.risk_level === "high"
                              ? "text-red-300"
                              : "text-white"
                          }`}>
                            {selectedFarm.name}
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={getRiskBadgeClasses(
                            selectedFarm.floodRisk?.risk_level
                          )}
                        >
                          {selectedFarm.floodRisk?.risk_level ?? "low"}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-300">
                        <div>
                          <span className="text-slate-500">Coordinates:</span>{" "}
                          {formatMetricValue(selectedFarm.latitude, "", 5)},{" "}
                          {formatMetricValue(selectedFarm.longitude, "", 5)}
                        </div>
                        <div>
                          <span className="text-slate-500">Location:</span>{" "}
                          {selectedFarm.location_name ?? "—"}
                        </div>
                        <div>
                          <span className="text-slate-500">Crop:</span>{" "}
                          {selectedFarm.primary_crop_name ?? "—"}
                        </div>
                        <div>
                          <span className="text-slate-500">Status:</span>{" "}
                          {selectedFarm.status ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* FIXED METRIC TILES */}

                    <div className="grid grid-cols-1 gap-3">
                      {FIXED_SNAPSHOT_METRICS.map((metricId) => {

                        const meta = SNAPSHOT_METRIC_DEFINITIONS.find(
                          (m) => m.value === metricId
                        ) ?? SNAPSHOT_METRIC_DEFINITIONS[0];

                        const value = getSnapshotValue(selectedFarm, metricId);

                        const isHighRiskScore =
                          metricId === "flood_risk_probability" &&
                          (value ?? 0) >= 70;

                        return (
                          <div
                            key={metricId}
                            className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {meta.label}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {meta.description}
                                </div>
                              </div>
                              {isHighRiskScore && (
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
                              )}
                            </div>

                            <div className={`mt-4 text-2xl font-semibold ${
                              isHighRiskScore ? "text-red-300" : "text-cyan-300"
                            }`}>
                              {formatMetricValue(
                                value,
                                meta.unit,
                                meta.unit === "%" ? 1 : 2
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-6 text-sm text-slate-400">
                    No farm is available yet for the selected range.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
