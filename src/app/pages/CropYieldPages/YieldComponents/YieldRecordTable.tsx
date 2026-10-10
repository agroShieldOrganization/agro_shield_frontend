import { type Dispatch, type SetStateAction } from "react";
import { motion } from "motion/react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

interface YieldRecordTableProps {
  records: any[];
  filteredRecords: any[];
  page: number;
  totalRecords: number;
  setPage: Dispatch<SetStateAction<number>>;
  onExport?: () => void;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  above_target: { label: "Above Target", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  on_target:    { label: "On Target",    classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  below_target: { label: "Below Target", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function formatNaira(value: number) {
  return value >= 1_000_000 ? `₦${(value / 1_000_000).toFixed(1)}M` : `₦${(value / 1_000).toFixed(0)}K`;
}

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

export default function YieldRecordTable({ records, filteredRecords, page, totalRecords, setPage, onExport }: YieldRecordTableProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-white font-semibold">Yield Records</h3>
              <p className="text-slate-500 text-xs mt-0.5">{filteredRecords.length} records found</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs gap-2"
              onClick={onExport}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "Record ID",
                    "Farm",
                    "Crop",
                    "Section",
                    "Date",
                    "Quantity",
                    "Revenue",
                    "Efficiency",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                      No yield records match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r: any, i: number) => {
                    const farmName = r.farm?.name ?? r.farm ?? "-";
                    const cropName = r.crop_name ?? r.crop ?? "-";
                    const sectionName = r.farmSection?.name ?? r.section ?? "-";
                    const date = (r.harvest_date || r.date || "").split("T")[0];
                    const quantity = r.quantity_kg ? `${Number(r.quantity_kg).toLocaleString()} kg` : r.quantity ?? "-";
                    const revenue = r.revenue ? formatNaira(Number(r.revenue)) : r.revenue ?? "-";
                    const efficiency = r.efficiency_percentage ?? (r.quantity_kg ? Math.round(((Number(r.quantity_kg) - (Number(r.loss_kg) || 0)) / Number(r.quantity_kg)) * 100) : 0);
                    const statusKey = efficiency >= 90 ? "above_target" : efficiency >= 75 ? "on_target" : "below_target";
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3.5 pr-4 font-mono text-xs text-emerald-400/80 whitespace-nowrap">{r.id}</td>
                        <td className="py-3.5 pr-4 text-slate-200 font-medium whitespace-nowrap">{farmName}</td>
                        <td className="py-3.5 pr-4 text-slate-400 whitespace-nowrap">{cropName}</td>
                        <td className="py-3.5 pr-4 text-slate-500 text-xs whitespace-nowrap">{sectionName}</td>
                        <td className="py-3.5 pr-4 text-slate-500 text-xs whitespace-nowrap">{date}</td>
                        <td className="py-3.5 pr-4 text-slate-200 font-medium whitespace-nowrap">{quantity}</td>
                        <td className="py-3.5 pr-4 text-slate-200 whitespace-nowrap">{revenue}</td>
                        <td className="py-3.5 pr-4 min-w-[120px]">
                          <EfficiencyBar value={efficiency} />
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig[statusKey].classes}`}>
                            {statusConfig[statusKey].label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
            <p className="text-slate-500 text-xs">Showing {filteredRecords.length} of {totalRecords} records</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === n ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
