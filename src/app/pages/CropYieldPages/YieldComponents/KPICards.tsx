import { type ElementType } from "react";
import { motion } from "motion/react";
import { Wheat, Wallet, Target, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

export interface KpiTotals {
  total_yield_kg: number;
  total_net_yield_kg: number;
  total_loss_kg: number;
  total_revenue: number;
  avg_efficiency: number;
}

interface KPICardsProps {
  totals: KpiTotals | null;
}

interface KPIItemProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: ElementType;
  sub: string;
  delay: number;
}

function formatNaira(value: number) {
  return value >= 1_000_000 ? `₦${(value / 1_000_000).toFixed(1)}M` : `₦${(value / 1_000).toFixed(0)}K`;
}

function KPIItem({ title, value, change, positive, icon: Icon, sub, delay }: KPIItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors relative overflow-hidden">
        {/* Accent glow to keep the KPI card background polished. */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl pointer-events-none" />

        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{title}</p>
              <h3 className="text-2xl font-bold text-white leading-none">{value}</h3>
              <p className="text-slate-500 text-xs">{sub}</p>
              <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${positive ? "text-emerald-400" : "text-red-400"}`}>
                {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {change} vs last period
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700/50">
              <Icon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function KPICards({ totals }: KPICardsProps) {
  const totalYield = totals ? `${Number(totals.total_yield_kg).toLocaleString()} kg` : "—";
  const totalRevenue = totals ? formatNaira(Number(totals.total_revenue || 0)) : "—";
  const efficiency = totals ? `${Math.round(Number(totals.avg_efficiency || 0))}%` : "—";
  const totalLoss = totals ? `${Number(totals.total_loss_kg || 0).toLocaleString()} kg` : "—";

  const cards: KPIItemProps[] = [
    {
      title: "Total Yield",
      value: totalYield,
      change: "+12%",
      positive: true,
      icon: Wheat,
      sub: "Across registered farms",
      delay: 0.1,
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: "+8%",
      positive: true,
      icon: Wallet,
      sub: "Net of input costs",
      delay: 0.15,
    },
    {
      title: "Yield Efficiency",
      value: efficiency,
      change: "+5%",
      positive: true,
      icon: Target,
      sub: "vs. last period",
      delay: 0.2,
    },
    {
      title: "Yield Loss",
      value: totalLoss,
      change: "-3%",
      positive: false,
      icon: AlertTriangle,
      sub: "Pest & climate factors",
      delay: 0.25,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KPIItem key={card.title} {...card} />
      ))}
    </div>
  );
}
