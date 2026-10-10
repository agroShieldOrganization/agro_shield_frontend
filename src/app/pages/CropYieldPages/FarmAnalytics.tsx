
import { useState, useEffect, type ElementType } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  Plus,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Flame,
  Activity,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AddYieldRecord } from "./AddCropYield";
import { getFarms, type Farm } from "../../../services/FarmServices/FarmService";
import { getCropCycles, type CropCycle } from "../../../services/utilityServices";
import { getYieldSummary, getYieldRecords, createYieldRecord } from "../../../services/YieldAnalytics/YieldAnalyticsService";
import HeaderComponent from "./YieldComponents/HeaderComponent";
import KPICards, { type KpiTotals } from "./YieldComponents/KPICards";
import TrendsPlot from "./YieldComponents/TrendsPlot";
import YieldRecordTable from "./YieldComponents/YieldRecordTable";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const monthlyYield = [
  { month: "Jan", yield: 2400, target: 2200, revenue: 500000 },
  { month: "Feb", yield: 1800, target: 2000, revenue: 350000 },
  { month: "Mar", yield: 3900, target: 3500, revenue: 750000 },
  { month: "Apr", yield: 4500, target: 4000, revenue: 920000 },
  { month: "May", yield: 5200, target: 4800, revenue: 1200000 },
  { month: "Jun", yield: 4800, target: 5000, revenue: 1050000 },
];

const cropDistribution = [
  { name: "Maize", value: 45, color: "#10b981" },
  { name: "Rice", value: 25, color: "#3b82f6" },
  { name: "Cassava", value: 20, color: "#f59e0b" },
  { name: "Soybeans", value: 10, color: "#8b5cf6" },
];

const farmPerformance = [
  { farm: "Kaduna", yield: 5400, revenue: 1200000 },
  { farm: "Benue", yield: 4800, revenue: 1050000 },
  { farm: "Abuja", yield: 3900, revenue: 870000 },
  { farm: "Kano", yield: 3100, revenue: 680000 },
  { farm: "Lagos", yield: 2600, revenue: 590000 },
];

// yieldRecords will be fetched from the backend; see `records` state below

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; classes: string }> = {
  above_target: { label: "Above Target", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  on_target:    { label: "On Target",    classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  below_target: { label: "Below Target", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const formatNaira = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
          <span className="capitalize">{p.dataKey}</span>
          <span className="font-semibold">
            {p.dataKey === "revenue" ? formatNaira(p.value) : `${p.value.toLocaleString()} kg`}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SelectProps {
  icon: ElementType;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}




interface InsightCardProps {
  label: string;
  value: string;
  sub: string;
  icon: ElementType;
  accent: string;
  delay?: number;
}

function InsightCard({ label, value, sub, icon: Icon, accent, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors overflow-hidden">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl shrink-0" style={{ background: `${accent}20` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-white font-bold text-base truncate">{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Efficiency Bar ───────────────────────────────────────────────────────────

function EfficiencyBar({ value }: { value: number }) {
  const color = value >= 90 ? "#10b981" : value >= 75 ? "#3b82f6" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-medium text-slate-400 w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CropYieldAnalytics() {
  const [farm, setFarm] = useState("All Farms");
  const [crop, setCrop] = useState("All Crops");
  const [dateRange, setDateRange] = useState("Last 6 months");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const filteredRecords = records.filter((r) => {
    const matchesFarm = farm === "All Farms" || r.farm?.name === farm || r.farm === farm;
    const matchesCrop = crop === "All Crops" || r.crop_name === crop || r.crop === crop;
    const matchesSearch =
      search === "" ||
      (r.farm?.name || r.farm || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.crop_name || r.crop || "").toLowerCase().includes(search.toLowerCase()) ||
      (String(r.id || "")).toLowerCase().includes(search.toLowerCase());
    return matchesFarm && matchesCrop && matchesSearch;
  });

  const kpiFilteredRecords = records.filter((r) => {
    const matchesFarm = farm === "All Farms" || r.farm?.name === farm || r.farm === farm;
    const matchesCrop = crop === "All Crops" || r.crop_name === crop || r.crop === crop;
    const matchesSearch =
      search === "" ||
      (r.farm?.name || r.farm || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.crop_name || r.crop || "").toLowerCase().includes(search.toLowerCase()) ||
      (String(r.id || "")).toLowerCase().includes(search.toLowerCase());
    return matchesFarm && matchesCrop && matchesSearch;
  });

  const kpiTotals: KpiTotals = {
    total_yield_kg: kpiFilteredRecords.reduce(
      (sum, r) => sum + (Number(r.quantity_kg ?? r.quantity ?? 0) || 0),
      0
    ),
    total_net_yield_kg: kpiFilteredRecords.reduce(
      (sum, r) => {
        const yieldQty = Number(r.quantity_kg ?? r.quantity ?? 0) || 0;
        const lossQty = Number(r.loss_kg ?? 0) || 0;
        return sum + Math.max(yieldQty - lossQty, 0);
      },
      0
    ),
    total_loss_kg: kpiFilteredRecords.reduce(
      (sum, r) => sum + (Number(r.loss_kg ?? 0) || 0),
      0
    ),
    total_revenue: kpiFilteredRecords.reduce(
      (sum, r) => sum + (Number(r.revenue ?? 0) || 0),
      0
    ),
    avg_efficiency: kpiFilteredRecords.length
      ? Math.round(
          kpiFilteredRecords.reduce((sum, r) => {
            const efficiency = Number(r.efficiency_percentage ?? 0);
            if (efficiency > 0) return sum + efficiency;
            const qty = Number(r.quantity_kg ?? r.quantity ?? 0) || 0;
            const loss = Number(r.loss_kg ?? 0) || 0;
            return qty > 0 ? sum + Math.round(((qty - loss) / qty) * 100) : sum;
          }, 0) / kpiFilteredRecords.length
        )
      : 0,
  };

  // Build live trend series using backend records and the current header filters.
  const trendRecords = records.filter((r) => {
    const matchesFarm = farm === "All Farms" || r.farm?.name === farm || r.farm === farm;
    const matchesCrop = crop === "All Crops" || r.crop_name === crop || r.crop === crop;
    const matchesSearch =
      search === "" ||
      (r.farm?.name || r.farm || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.crop_name || r.crop || "").toLowerCase().includes(search.toLowerCase()) ||
      (String(r.id || "")).toLowerCase().includes(search.toLowerCase());
    return matchesFarm && matchesCrop && matchesSearch;
  });

  const monthlyYieldData = (() => {
    if (records.length === 0) return monthlyYield;

    const monthMap = new Map<string, { month: string; yield: number; target: number; revenue: number }>();
    trendRecords.forEach((r: any) => {
      const dateString = r.harvest_date || r.date || "";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return;
      const month = date.toLocaleString("en", { month: "short" });
      const quantity = Number(r.quantity_kg ?? r.quantity ?? 0) || 0;
      const revenue = Number(r.revenue ?? 0) || 0;
      const existing = monthMap.get(month) ?? { month, yield: 0, target: 0, revenue: 0 };
      existing.yield += quantity;
      existing.revenue += revenue;
      existing.target = Math.round(existing.yield * 1.05); // estimate target dynamically
      monthMap.set(month, existing);
    });

    return Array.from(monthMap.values()).slice(-6);
  })();

  // Fetch analytics summary, records, farms, and crop cycles
  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoadingSummary(true);
        const res = await getYieldSummary();
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSummary(false);
      }
    }

    async function fetchRecords() {
      try {
        setLoadingRecords(true);
        const res = await getYieldRecords();
        setRecords(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecords(false);
      }
    }

    async function fetchFarms() {
      try {
        const res = await getFarms();
        setFarms(res.farms || []);
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchCropCycles() {
      try {
        const response = await getCropCycles();
        setCropCycles(response.crop_cycles ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSummary();
    fetchRecords();
    fetchFarms();
    fetchCropCycles();
  }, []);

  const cropOptions = [
    "All Crops",
    ...Array.from(
      new Set(
        cropCycles
          .filter((cycle) =>
            farm === "All Farms" ||
            cycle.farm?.name === farm ||
            cycle.farm_id === farms.find((f) => f.name === farm)?.id
          )
          .map((cycle) => cycle.crop_name)
          .filter(Boolean)
      )
    ),
  ];

  useEffect(() => {
    if (crop !== "All Crops" && !cropOptions.includes(crop)) {
      setCrop("All Crops");
    }
  }, [crop, cropOptions]);

  // Derived data for charts (fall back to existing mocks if no backend data)
  const palette = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  const cropDistributionData = summary?.by_crop?.map((b: any, i: number) => ({
    name: b.crop_name,
    value: Number(b.total_yield_kg) || 0,
    color: palette[i % palette.length],
  })) ?? cropDistribution;

  const farmPerformanceData = summary?.by_farm?.map((b: any) => ({
    farm: b.farm?.name ?? b.farm_id,
    yield: Number(b.total_yield_kg) || 0,
    revenue: Number(b.total_revenue) || 0,
  })) ?? farmPerformance;

  const farmOptions = ["All Farms", ...farms.map((f) => f.name)];

  return (
    <div className="space-y-6 pb-10">
      <HeaderComponent
        farm={farm}
        crop={crop}
        dateRange={dateRange}
        search={search}
        farmOptions={farmOptions}
        cropOptions={cropOptions}
        setFarm={setFarm}
        setCrop={setCrop}
        setDateRange={setDateRange}
        setSearch={setSearch}
        onOpenAddModal={setOpenAddModal}
      />

      {/* ── KPI CARDS SECTION ─────────────────────────────────────────── */}
      {/* Pass filter-aware KPI totals into the shared KPI cards component. */}
      <KPICards totals={kpiTotals} />

      {/* ── TREND PLOT SECTION ─────────────────────────────────────────── */}
      <TrendsPlot data={monthlyYieldData} />

      {/* ── CHARTS ROW 2 ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Crop Contribution – 2 cols */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="bg-slate-900/60 border-slate-800 h-full">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-1">Crop Contribution</h3>
              <p className="text-slate-500 text-xs mb-4">Yield share by crop type</p>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={cropDistributionData} dataKey="value" outerRadius={90} innerRadius={52} paddingAngle={3}>
                    {cropDistributionData.map((c: any) => (
                      <Cell key={c.name} fill={c.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val}%`, "Share"]} contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2.5 mt-4">
                {cropDistributionData.map((c: any) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-slate-400 text-xs flex-1">{c.name}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (c.value || 0) / (summary?.totals?.total_yield_kg || 1) * 100)}` }} transition={{ duration: 0.8, delay: 0.5 }} />
                    </div>
                    <span className="text-slate-300 text-xs font-medium w-8 text-right">{Math.round(c.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Farm Performance Ranking – 3 cols */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="lg:col-span-3">
          <Card className="bg-slate-900/60 border-slate-800 h-full">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-1">Farm Performance Ranking</h3>
              <p className="text-slate-500 text-xs mb-4">Yield output by farm (kg)</p>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={farmPerformanceData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="farm" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="yield" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>

              {/* Mini ranking list */}
              <div className="mt-4 space-y-2">
                {farmPerformanceData.map((f: any, i: number) => (
                  <div key={f.farm} className="flex items-center gap-3 text-xs">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <span className="text-slate-400 flex-1">{f.farm}</span>
                    <span className="text-slate-300 font-medium">{(f.yield || 0).toLocaleString()} kg</span>
                    <span className="text-slate-500">{formatNaira(f.revenue || 0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── YIELD INSIGHTS ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Yield Insights</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <InsightCard
            label="Best Farm"
            value="Kaduna Farm"
            sub="5,400 kg · ₦1.2M revenue"
            icon={Star}
            accent="#f59e0b"
            delay={0.1}
          />
          <InsightCard
            label="Best Crop"
            value="Maize"
            sub="45% of total yield share"
            icon={Flame}
            accent="#10b981"
            delay={0.15}
          />
          <InsightCard
            label="Highest Revenue"
            value="₦1.2M"
            sub="Kaduna Farm · May 2025"
            icon={TrendingUp}
            accent="#3b82f6"
            delay={0.2}
          />
          <InsightCard
            label="Lowest Performing"
            value="Lagos Farm"
            sub="2,600 kg — needs attention"
            icon={TrendingDown}
            accent="#ef4444"
            delay={0.25}
          />
        </div>
      </div>

      <YieldRecordTable
        records={records}
        filteredRecords={filteredRecords}
        page={page}
        setPage={setPage}
        totalRecords={records.length}
      />

                  <AddYieldRecord
                    open={openAddModal}
                    onOpenChange={setOpenAddModal}
                    onSubmit={async (data) => {
                      await createYieldRecord({
                        farm_id: data.farm_id,
                        crop_name: data.crop_name,
                        harvest_date: data.harvest_date,
                        quantity_kg: Number(data.quantity_kg),
                        loss_kg: data.loss_kg ? Number(data.loss_kg) : undefined,
                        revenue: data.revenue ? Number(data.revenue) : undefined,
                        notes: data.notes || undefined,
                      });
                      const refreshed = await getYieldRecords();
                      setRecords(refreshed.data || []);
                    }}
                  />

    </div>
  );
}
