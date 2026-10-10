import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "../../../components/ui/card";

interface TrendPoint {
  month: string;
  yield: number;
  target: number;
  revenue: number;
}

interface TrendsPlotProps {
  data: TrendPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex justify-between gap-4 text-slate-200">
          <span className="capitalize">{entry.dataKey}</span>
          <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrendsPlot({ data }: TrendsPlotProps) {
  const isEmpty = data.length === 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Yield Trend</h3>
                <p className="text-slate-500 text-xs mt-0.5">Actual yield vs. estimated target</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />Target</span>
              </div>
            </div>

            {isEmpty ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500 text-sm">
                No trend data available for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="target" stroke="#475569" strokeDasharray="4 4" strokeWidth={1.5} fill="url(#targetGrad)" />
                  <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} fill="url(#yieldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Revenue Trend</h3>
                <p className="text-slate-500 text-xs mt-0.5">Monthly revenue from backend yield records</p>
              </div>
            </div>

            {isEmpty ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500 text-sm">
                No revenue data available for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
