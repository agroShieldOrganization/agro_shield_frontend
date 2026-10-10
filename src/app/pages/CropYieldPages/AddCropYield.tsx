"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wheat,
  MapPin,
  CalendarDays,
  Scale,
  Wallet,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";
import {
  getFarms,
  type Farm,
} from "../../../services/FarmServices/FarmService";
import { createYieldRecord } from "../../../services/YieldAnalytics/YieldAnalyticsService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddYieldRecordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: YieldFormData) => Promise<void>;
}

export interface YieldFormData {
  farm_id: string;
  crop_name: string;
  harvest_date: string;
  quantity_kg: string;
  revenue: string;
  loss_kg: string;
  notes: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const initialForm: YieldFormData = {
  farm_id: "",
  crop_name: "",
  harvest_date: "",
  quantity_kg: "",
  revenue: "",
  loss_kg: "",
  notes: "",
};

type FieldErrors = Partial<Record<keyof YieldFormData, string>>;

function validate(data: YieldFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.farm_id)       errors.farm_id       = "Please select a farm.";
  if (!data.crop_name)     errors.crop_name     = "Please select a crop.";
  if (!data.harvest_date)  errors.harvest_date  = "Harvest date is required.";
  if (!data.quantity_kg || isNaN(Number(data.quantity_kg)) || Number(data.quantity_kg) <= 0)
    errors.quantity_kg = "Enter a valid yield quantity.";
  if (data.revenue && isNaN(Number(data.revenue.replace(/,/g, ""))))
    errors.revenue = "Enter a valid revenue amount.";
  if (data.loss_kg && (isNaN(Number(data.loss_kg)) || Number(data.loss_kg) < 0))
    errors.loss_kg = "Enter a valid loss amount.";
  return errors;
}

// ─── Field Components ─────────────────────────────────────────────────────────

interface LabelProps { children: React.ReactNode; required?: boolean; }
function FieldLabel({ children, required }: LabelProps) {
  return (
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-emerald-500 ml-0.5">*</span>}
    </label>
  );
}

interface ErrorProps { message?: string; }
function FieldError({ message }: ErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-red-400 text-xs mt-1.5"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full bg-slate-800/80 border ${
    hasError ? "border-red-500/60 focus:border-red-400" : "border-slate-700 focus:border-emerald-500/60"
  } text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all hover:border-slate-600`;

interface SelectFieldProps {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}

function SelectField({ icon: Icon, value, onChange, options, placeholder, disabled, error }: SelectFieldProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass(!!error)} pl-9 pr-8 appearance-none disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}

// ─── Efficiency Preview ───────────────────────────────────────────────────────

function EfficiencyPreview({ quantity, loss }: { quantity: string; loss: string }) {
  const q = parseFloat(quantity) || 0;
  const l = parseFloat(loss) || 0;
  if (q <= 0) return null;
  const efficiency = Math.max(0, Math.round(((q - l) / q) * 100));
  const color = efficiency >= 90 ? "#10b981" : efficiency >= 75 ? "#3b82f6" : "#f59e0b";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center gap-3"
    >
      <TrendingUp className="w-4 h-4 shrink-0" style={{ color }} />
      <div className="flex-1">
        <p className="text-xs text-slate-400 mb-1">Estimated Yield Efficiency</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${efficiency}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color }}>{efficiency}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AddYieldRecord({ open, onOpenChange, onSubmit }: AddYieldRecordProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [form, setForm]       = useState<YieldFormData>(initialForm);
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchFarms() {
      try {
        setIsLoadingFarms(true);
        const response = await getFarms();
        setFarms(response.farms ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load farms");
      } finally {
        setIsLoadingFarms(false);
      }
    }

    fetchFarms();
  }, [open]);

  

  const set = (field: keyof YieldFormData) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Extract unique crops from farms
  const availableCrops = Array.from(
    new Set(
      farms
        .map((f) => f.primary_crop_name)
        .filter((c): c is string => Boolean(c))
    )
  ).map((crop) => ({ id: crop, name: crop }));


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        farm_id: form.farm_id,
        crop_name: form.crop_name,
        harvest_date: form.harvest_date,
        quantity_kg: Number(form.quantity_kg),
        loss_kg: form.loss_kg ? Number(form.loss_kg) : undefined,
        revenue: form.revenue ? Number(form.revenue) : undefined,
        notes: form.notes || undefined,
      };

      if (onSubmit) {
        await onSubmit(form);
      } else {
        await createYieldRecord(payload);
      }
      setSuccess(true);
      toast.success("Yield record saved");
      setTimeout(() => {
        setSuccess(false);
        setForm(initialForm);
        setErrors({});
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to save yield record");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm(initialForm);
    setErrors({});
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true);
          return;
        }
        handleClose();
      }}
    >
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg p-0 overflow-hidden gap-0">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Wheat className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-base">Add Yield Report</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                Record harvest data for a farm or section.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Success State ── */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 gap-3"
            >
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-semibold">Yield Record Saved</p>
              <p className="text-slate-500 text-sm">Your harvest data has been recorded.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">

          {/* Farm + Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel required>Farm</FieldLabel>
              <SelectField
                icon={MapPin}
                value={form.farm_id}
                onChange={set("farm_id")}
                options={farms}
                placeholder={isLoadingFarms ? "Loading farms..." : "Select farm"}
                disabled={isLoadingFarms || farms.length === 0}
                error={errors.farm_id}
              />
              <FieldError message={errors.farm_id} />
            </div>

            
          </div>

          {/* Crop + Harvest Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Crop</FieldLabel>
              <SelectField
                icon={Wheat}
                value={form.crop_name}
                onChange={set("crop_name")}
                options={availableCrops}
                placeholder="Select crop"
                error={errors.crop_name}
              />
              <FieldError message={errors.crop_name} />
            </div>

            <div>
              <FieldLabel required>Harvest Date</FieldLabel>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => set("harvest_date")(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={`${inputClass(!!errors.harvest_date)} pl-9 [color-scheme:dark]`}
                />
              </div>
              <FieldError message={errors.harvest_date} />
            </div>
          </div>

          {/* Quantity + Yield Loss */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Yield Quantity (kg)</FieldLabel>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity_kg}
                  onChange={(e) => set("quantity_kg")(e.target.value)}
                  placeholder="e.g. 1200"
                  className={`${inputClass(!!errors.quantity_kg)} pl-9`}
                />
              </div>
              <FieldError message={errors.quantity_kg} />
            </div>

            <div>
              <FieldLabel>Yield Loss (kg)</FieldLabel>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.loss_kg}
                  onChange={(e) => set("loss_kg")(e.target.value)}
                  placeholder="e.g. 80"
                  className={`${inputClass(!!errors.loss_kg)} pl-9`}
                />
              </div>
              <FieldError message={errors.loss_kg} />
            </div>
          </div>

          {/* Efficiency preview */}
          <EfficiencyPreview quantity={form.quantity_kg} loss={form.loss_kg} />

          {/* Revenue */}
          <div>
            <FieldLabel>Revenue (₦)</FieldLabel>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="number"
                min="0"
                value={form.revenue}
                onChange={(e) => set("revenue")(e.target.value)}
                placeholder="e.g. 320000"
                className={`${inputClass(!!errors.revenue)} pl-9`}
              />
            </div>
            <FieldError message={errors.revenue} />
          </div>

          {/* Notes */}
          <div>
            <FieldLabel>Notes</FieldLabel>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Any observations, pest issues, weather conditions…"
                className={`${inputClass()} pl-9 resize-none`}
              />
            </div>
          </div>

        </div>

          {/* ── Footer ── */}
          <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading || success}
            className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[130px] gap-2 shadow-lg shadow-emerald-900/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : (
              "Save Yield Record"
            )}
          </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
