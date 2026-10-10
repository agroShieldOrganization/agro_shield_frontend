import { motion } from "motion/react";
import { useEffect, useState } from "react";

import {
  Plus,
  MapPin,
  TrendingUp,
  Sprout,
  AlertTriangle,
  Leaf,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

import { AddCropDialog } from "../components/AddCropDialog";

import { toast } from "sonner";

import {
  getFarms,
  type Farm,
} from "../../services/FarmServices/FarmService";

const statusConfig = {
  active: {
    label: "Active",
    color: "emerald",
    bg: "from-white-500/90 to-emerald-600/10",
    border: "border-emerald-500/30",
  },

  inactive: {
    label: "Inactive",
    color: "orange",
    bg: "from-orange-500/10 to-orange-600/10",
    border: "border-orange-500/30",
  },

  archived: {
    label: "Archived",
    color: "slate",
    bg: "from-slate-500/10 to-slate-600/10",
    border: "border-slate-500/30",
  },
};

export function MyFarms() {

  const [farms, setFarms] =
    useState<Farm[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCropDialogOpen, setIsCropDialogOpen] =
    useState(false);

  const [selectedFarm, setSelectedFarm] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH FARMS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchFarms() {

      try {

        setIsLoading(true);

        const response =
          await getFarms();

        setFarms(response.farms);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to fetch farms"
        );

      } finally {

        setIsLoading(false);
      }
    }

    fetchFarms();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | OPEN CROP DIALOG
  |--------------------------------------------------------------------------
  */

  const handleAddCrop = (
    farmName: string
  ) => {

    setSelectedFarm(farmName);

    setIsCropDialogOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CROP ADDED
  |--------------------------------------------------------------------------
  */

  const handleCropAdded = () => {

    toast.success(
      "Crop added successfully"
    );

    setIsCropDialogOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (isLoading) {

    return (

      <div className="flex items-center justify-center py-20">

        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >

        <div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            My Farms
          </h1>

          <p className="text-sm md:text-base text-slate-400">
            Manage and monitor all your registered farms
          </p>

        </div>

        <Link to="/add-farm">

          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">

            <Plus className="w-5 h-5 mr-2" />

            Add New Farm

          </Button>

        </Link>
      </motion.div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">

          <div className="text-3xl font-bold text-white">
            {farms.length}
          </div>

          <div className="mt-1 text-sm text-slate-400">
            Total Farms
          </div>

        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">

          <div className="text-3xl font-bold text-white">

            {farms.reduce(
              (total, farm) =>
                total +
                Number(
                  farm.size_hectares ?? 0
                ),
              0
            )} ha

          </div>

          <div className="mt-1 text-sm text-slate-400">
            Total Farm Area
          </div>

        </div>

        <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6">

          <div className="text-3xl font-bold text-white">
            {farms.filter(
              (farm) =>
                farm.status === "active"
            ).length}
          </div>

          <div className="mt-1 text-sm text-slate-400">
            Active Farms
          </div>

        </div>

      </div>

      {/* EMPTY STATE */}

      {farms.length === 0 && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >

          <Sprout className="w-24 h-24 text-slate-700 mx-auto mb-4" />

          <h3 className="text-xl font-bold text-white mb-2">
            No Farms Yet
          </h3>

          <p className="text-slate-400 mb-6">
            Get started by adding your first farm
          </p>

          <Link to="/add-farm">

            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">

              <Plus className="w-5 h-5 mr-2" />

              Add Your First Farm

            </Button>

          </Link>

        </motion.div>
      )}

      {/* FARM LIST */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">

        {farms.map((farm, index) => {

          const config =
            statusConfig[
              farm.status as keyof typeof statusConfig
            ];

          return (

            <motion.div
              key={farm.id}
              initial={{
                x: -20,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              transition={{
                delay:
                  0.1 + index * 0.05,
              }}
              className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-2xl p-6`}
            >

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-2xl font-bold text-white">
                    {farm.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-slate-400">

                    <MapPin className="w-4 h-4" />

                    <span>
                      {farm.location_name}
                    </span>

                  </div>

                  <div className="mt-2 text-sm text-slate-500">

                    Lat:
                    {" "}
                    {farm.latitude}
                    {" | "}
                    Lng:
                    {" "}
                    {farm.longitude}

                  </div>

                </div>

                <Badge
                  className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/30`}
                >

                  {config.label}

                </Badge>

              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 mb-5">

                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">

                  <div className="text-xs text-slate-500">
                    Farm Size
                  </div>

                  <div className="mt-1 text-lg font-bold text-white">
                    {farm.size_hectares ?? 0} ha
                  </div>

                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">

                  <div className="text-xs text-slate-500">
                    Primary Crop
                  </div>

                  <div className="mt-1 text-lg font-bold text-white">
                    {farm.primary_crop_name ??
                      "N/A"}
                  </div>

                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">

                  <div className="text-xs text-slate-500">
                    Health Score
                  </div>

                  <div className="mt-1 text-lg font-bold text-white">
                    {farm.health_score ??
                      0}%
                  </div>

                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">

                  <div className="text-xs text-slate-500">
                    Status
                  </div>

                  <div className="mt-1 text-lg font-bold text-white capitalize">
                    {farm.status}
                  </div>

                </div>

              </div>

              <div className="mt-6">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm text-slate-400">
                    Farm Health
                  </span>

                  <span className="text-sm text-white">
                    {farm.health_score ?? 0}%
                  </span>

                </div>

                <Progress
                  value={
                    Number(
                      farm.health_score ?? 0
                    )
                  }
                  className="h-3"
                />

              </div>

              <Button
                onClick={() =>
                  handleAddCrop(
                    farm.name
                  )
                }
                className="mt-6 w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/50 text-emerald-400"
              >

                <Leaf className="w-5 h-5 mr-2" />

                Add Crop & Get Advisory

              </Button>

            </motion.div>
          );
        })}
      </div>

      {/* ADD CROP MODAL */}

      <AddCropDialog
        isOpen={isCropDialogOpen}
        onClose={() =>
          setIsCropDialogOpen(false)
        }
        farmName={
          selectedFarm ?? undefined
        }
        onCropAdded={handleCropAdded}
      />

    </div>
  );
}