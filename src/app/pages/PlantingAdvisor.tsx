import { motion } from "motion/react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Sprout,
  Calendar,
  Thermometer,
  Droplets,
  Sun,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { Badge } from "../components/ui/badge";

import { Button } from "../components/ui/button";

import { Progress } from "../components/ui/progress";

import { AddCropDialog } from "../components/AddCropDialog";

import {
  getCropCycles,
} from "../../services/CropCycleService/CropCycleService";

const statusConfig = {

  planned: {
    color: "blue",
    label: "Planned",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/30",
  },

  planted: {
    color: "emerald",
    label: "Planted",
    bg: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-500/30",
  },

  growing: {
    color: "yellow",
    label: "Growing",
    bg: "from-yellow-500/10 to-amber-500/10",
    border: "border-yellow-500/30",
  },

  harvested: {
    color: "teal",
    label: "Harvested",
    bg: "from-teal-500/10 to-cyan-500/10",
    border: "border-teal-500/30",
  },

  failed: {
    color: "red",
    label: "Failed",
    bg: "from-red-500/10 to-red-600/10",
    border: "border-red-500/30",
  },
};

export function PlantingAdvisor() {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [
    cropCycles,
    setCropCycles,
  ] = useState<any[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isCropDialogOpen,
    setIsCropDialogOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH CROP CYCLES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchCropCycles() {

      try {

        setIsLoading(true);

        const response =
          await getCropCycles();

        setCropCycles(
          response.crop_cycles ?? []
        );
         console.log(response.crop_cycles);

      } catch (error) {

        toast.error(
          "Failed to load planting advisories"
        );

      } finally {

        setIsLoading(false);
      }
    }

    fetchCropCycles();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE NEW CROP
  |--------------------------------------------------------------------------
  */

  const handleCropAdded = (
    cropData: any
  ) => {

    setCropCycles((prev) => [
      cropData,
      ...prev,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | SUMMARY METRICS
  |--------------------------------------------------------------------------
  */

  const summary = useMemo(() => {

    const planted =
      cropCycles.filter(
        (crop) =>
          crop.status === "planted"
      ).length;

    const avgConfidence = 0;

    return {

      cropsReady: planted,

      avgConfidence,

      activeAdvisories:
        cropCycles.length,
    };

  }, [cropCycles]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-slate-400">
          Loading planting advisories...
        </div>

      </div>
    );
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{
          y: -20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="flex items-start justify-between"
      >

        <div>

          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">

            AI Planting Advisor

          </h1>

          <p className="text-sm text-slate-400 md:text-base">

            Climate-aware planting recommendations
            based on crop cycles and farm intelligence.

          </p>

        </div>

        <Button
          onClick={() =>
            setIsCropDialogOpen(true)
          }
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >

          <Plus className="mr-2 h-5 w-5" />

          Add New Crop

        </Button>

      </motion.div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {[
          {
            label: "Crops Ready",
            value:
              summary.cropsReady,
            icon: Sprout,
            color: "emerald",
          },

          {
            label: "Avg Confidence",
            value:
              `${summary.avgConfidence}%`,
            icon: Sun,
            color: "blue",
          },

          {
            label: "Active Advisories",
            value:
              summary.activeAdvisories,
            icon: Calendar,
            color: "teal",
          },
        ].map((item, index) => (

          <motion.div
            key={index}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay:
                0.1 + index * 0.05,
            }}
            className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm"
          >

            <div className="flex items-center justify-between">

              <div>

                <div className="mb-1 text-3xl font-bold text-white">

                  {item.value}

                </div>

                <div className="text-sm text-slate-400">

                  {item.label}

                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-3">

                <item.icon className="h-6 w-6 text-emerald-400" />

              </div>

            </div>

          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}

      {cropCycles.length === 0 && (

        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-10 text-center">

          <Sprout className="mx-auto mb-4 h-16 w-16 text-slate-500" />

          <h3 className="mb-2 text-xl font-semibold text-white">

            No Crop Cycles Yet

          </h3>

          <p className="mb-6 text-slate-400">

            Add your first crop to start receiving
            AI-powered planting advisories.

          </p>

          <Button
            onClick={() =>
              setIsCropDialogOpen(true)
            }
          >
            Add Crop
          </Button>

        </div>
      )}

      {/* CROP CARDS */}

     {/* CROP CARDS */}

<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">

  {cropCycles.map(
    (crop, index) => {

      const config =
        statusConfig[
          crop.status as keyof typeof statusConfig
        ] ??
        statusConfig.planned;

      return (

        <motion.div
          key={crop.id}
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay:
              0.1 + index * 0.05,
          }}
          className={`
            bg-gradient-to-br
            ${config.bg}
            rounded-2xl
            border
            ${config.border}
            p-5
            backdrop-blur-sm
            h-full
            flex
            flex-col
          `}
        >

          {/* TOP */}

          <div className="mb-4 flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/50">

                <Sprout className="h-5 w-5 text-emerald-400" />

              </div>

              <div>

                <h3 className="text-lg font-bold text-white">

                  {crop.crop_name}

                </h3>

                <p className="text-xs text-slate-400">

                  Planting:
                  {" "}
                  {crop.planting_date}

                </p>

              </div>

            </div>

            <Badge
              className="border-slate-700 bg-slate-800 text-slate-200"
            >
              {config.label}
            </Badge>

          </div>

          {/* FARM */}

          <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">

            <div className="grid grid-cols-2 gap-4">

              <div>

                <p className="text-xs text-slate-500">

                  Farm

                </p>

                <p className="text-sm font-semibold text-white">

                  {crop.farm?.name ?? "-"}

                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">

                  Season

                </p>

                <p className="text-sm font-semibold capitalize text-white">

                  {crop.season ?? "-"}

                </p>

              </div>

            </div>

          </div>

          {/* METRICS */}

          <div className="mb-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">

              <div className="mb-2 flex items-center gap-2">

                <Thermometer className="h-4 w-4 text-orange-400" />

                <span className="text-xs text-slate-500">

                  Soil Temp

                </span>

              </div>

              <p className="text-sm font-semibold text-white">

                -

              </p>

            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">

              <div className="mb-2 flex items-center gap-2">

                <Droplets className="h-4 w-4 text-blue-400" />

                <span className="text-xs text-slate-500">

                  Moisture

                </span>

              </div>

              <p className="text-sm font-semibold text-white">

                -

              </p>

            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">

              <div className="mb-2 flex items-center gap-2">

                <Sun className="h-4 w-4 text-yellow-400" />

                <span className="text-xs text-slate-500">

                  Rainfall

                </span>

              </div>

              <p className="text-sm font-semibold text-white">

                -

              </p>

            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">

              <div className="mb-2 flex items-center gap-2">

                <AlertTriangle className="h-4 w-4 text-emerald-400" />

                <span className="text-xs text-slate-500">

                  Confidence

                </span>

              </div>

              <p className="text-sm font-semibold text-white">

                -

              </p>

            </div>

          </div>

          {/* AI CONFIDENCE */}

          <div className="mb-4">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs text-slate-400">

                AI Confidence Level

              </span>

              <span className="text-xs font-semibold text-white">

                -

              </span>

            </div>

            <Progress
              value={0}
              className="h-2 bg-slate-800/50"
            />

          </div>

          {/* NOTES */}

          <div className="mt-auto rounded-xl border border-slate-700 bg-slate-900/50 p-4">

            <p className="text-sm leading-relaxed text-slate-300">

              {crop.notes ??
                "No AI advisory notes yet."}

            </p>

          </div>

        </motion.div>
      );
    }
  )}

</div>
      {/* ADD CROP DIALOG */}

      <AddCropDialog
        isOpen={isCropDialogOpen}
        onClose={() =>
          setIsCropDialogOpen(false)
        }
        onCropAdded={handleCropAdded}
      />

    </div>
  );
}