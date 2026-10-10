import { useState, type ElementType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Calendar,
  Leaf,
  BarChart2,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

interface HeaderComponentProps {
  farm: string;
  crop: string;
  dateRange: string;
  search: string;
  farmOptions: string[];
  cropOptions: string[];
  setFarm: (value: string) => void;
  setCrop: (value: string) => void;
  setDateRange: (value: string) => void;
  setSearch: (value: string) => void;
  onOpenAddModal: (open: boolean) => void;
}

interface SelectProps {
  icon: ElementType;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const DATE_RANGES = ["Last 30 days", "Last 3 months", "Last 6 months", "This Year"];

function FilterSelect({ icon: Icon, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl px-4 py-2.5 text-sm transition-all min-w-[150px]"
      >
        <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="flex-1 text-left truncate">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-800 ${
                  value === opt ? "text-emerald-400 bg-emerald-500/10" : "text-slate-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HeaderComponent({
  farm,
  crop,
  dateRange,
  search,
  farmOptions,
  cropOptions,
  setFarm,
  setCrop,
  setDateRange,
  setSearch,
  onOpenAddModal,
}: HeaderComponentProps) {
  return (
    <>
      {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Crop Yield Analytics</h1>
          </div>
          <p className="text-slate-400 text-sm pl-3.5">
            Track yield performance, productivity, and revenue across all farms.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => onOpenAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            Add Yield Report
          </Button>
        </div>
      </motion.div>

      {/* ── FILTERS BAR ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-wrap items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-slate-400">Filter:</span>
        </div>

        <FilterSelect icon={BarChart2} value={farm} options={farmOptions} onChange={setFarm} />
        <FilterSelect icon={Leaf} value={crop} options={cropOptions} onChange={setCrop} />
        <FilterSelect icon={Calendar} value={dateRange} options={DATE_RANGES} onChange={setDateRange} />

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search farm, crop, record ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 hover:border-slate-500 focus:border-emerald-500/60 text-slate-300 placeholder-slate-600 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {(farm !== "All Farms" || crop !== "All Crops" || search) && (
          <button
            type="button"
            onClick={() => {
              setFarm("All Farms");
              setCrop("All Crops");
              setSearch("");
            }}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2"
          >
            Clear
          </button>
        )}
      </motion.div>
    </>
  );
}
