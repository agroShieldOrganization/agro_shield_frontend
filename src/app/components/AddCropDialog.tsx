import { useEffect, useState } from "react";

import {
  Sprout,
  Calendar,
  Save,
  Tractor,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { BaseModal } from "./ui/BaseModal";

import {
  createCropCycle,
} from "../../services/CropCycleService/CropCycleService";

import {
  getFarms,
} from "../../services/FarmServices/FarmService";

interface Farm {
  id: string;
  name: string;
}

interface AddCropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCropAdded?: (cropData: any) => void;
}

const cropTypes = [
  "Maize",
  "Rice",
  "Cassava",
  "Millet",
  "Tomatoes",
  "Yam",
  "Beans",
  "Sorghum",
  "Groundnut",
  "Pepper",
  "Plantain",
  "Cocoa"
];

const seasons = [
  {
    value: "wet",
    label: "Wet Season (April - October)",
  },
  {
    value: "dry",
    label: "Dry Season (November - March)",
  },
];

export function AddCropDialog({
  isOpen,
  onClose,
  onCropAdded,
}: AddCropDialogProps) {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [farms, setFarms] = useState<Farm[]>([]);

  const [isLoadingFarms, setIsLoadingFarms] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({

    farmId: "",

    cropType: "",

    customCrop: "",

    plantingDate: "",

    expectedYield: "",

    farmSize: "",

    season: "",
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD FARMS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchFarms() {

      try {

        setIsLoadingFarms(true);

        const response =
          await getFarms();

        setFarms(
          response.farms ?? []
        );

      } catch (error) {

        toast.error(
          "Failed to load farms"
        );

      } finally {

        setIsLoadingFarms(false);
      }
    }

    if (isOpen) {

      fetchFarms();
    }

  }, [isOpen]);

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const finalCropType =
      formData.cropType === "custom"
        ? formData.customCrop
        : formData.cropType;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !formData.farmId ||
      !finalCropType ||
      !formData.plantingDate ||
      !formData.season
    ) {

      toast.error(
        "Please fill in all required fields"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE CROP
    |--------------------------------------------------------------------------
    */

    try {

      setIsSubmitting(true);

      const response =
        await createCropCycle({

          farm_id:
            formData.farmId,

          crop_name:
            finalCropType,

          season:
            formData.season,

          planting_date:
            formData.plantingDate,

          expected_yield_kg_per_hectare:
            formData.expectedYield
              ? Number(
                  formData.expectedYield
                )
              : null,

          expected_area_hectares:
            formData.farmSize
              ? Number(
                  formData.farmSize
                )
              : null,
        });

      toast.success(
        `${finalCropType} added successfully`
      );

      /*
      |--------------------------------------------------------------------------
      | CALLBACK
      |--------------------------------------------------------------------------
      */

      if (onCropAdded) {

        onCropAdded(
          response.crop_cycle
        );
      }

      /*
      |--------------------------------------------------------------------------
      | RESET
      |--------------------------------------------------------------------------
      */

      setFormData({

        farmId: "",

        cropType: "",

        customCrop: "",

        plantingDate: "",

        expectedYield: "",

        farmSize: "",

        season: "",
      });

      onClose();

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "Failed to add crop"
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Crop for Planting Advisory"
      subtitle="Create a new crop cycle"
      icon={
        <Sprout className="h-6 w-6 text-emerald-400" />
      }
      maxWidth="max-w-2xl"
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* FARM SELECT */}

        <div>

          <Label className="mb-2 flex items-center gap-2 text-slate-300">

            <Tractor className="h-4 w-4 text-emerald-400" />

            Select Farm *

          </Label>

          <select
            value={formData.farmId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                farmId: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          >

            <option value="">
              {isLoadingFarms
                ? "Loading farms..."
                : "Select a farm"}
            </option>

            {farms.map((farm) => (

              <option
                key={farm.id}
                value={farm.id}
              >
                {farm.name}
              </option>
            ))}

          </select>
        </div>

        {/* Crop Type */}

        <div>

          <Label className="mb-3 block text-slate-300">

            Select Crop Type *

          </Label>

          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">

            {cropTypes.map((crop) => (

              <button
                key={crop}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    cropType: crop,
                  }))
                }
                className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                  formData.cropType === crop
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-slate-700 bg-slate-800/30 text-white hover:border-slate-600"
                }`}
              >
                {crop}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  cropType: "custom",
                }))
              }
              className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                formData.cropType === "custom"
                  ? "border-purple-500 bg-purple-500/20 text-purple-400"
                  : "border-slate-700 bg-slate-800/30 text-white hover:border-slate-600"
              }`}
            >
              Other/Custom
            </button>

          </div>

          {formData.cropType === "custom" && (

            <Input
              required
              value={formData.customCrop}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customCrop: e.target.value,
                }))
              }
              placeholder="Enter custom crop name"
              className="border-slate-700 bg-slate-800/50 text-white"
            />
          )}
        </div>

        {/* Season */}

        <div>

          <Label className="mb-3 block text-slate-300">

            Planting Season *

          </Label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {seasons.map((season) => (

              <button
                key={season.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    season: season.value,
                  }))
                }
                className={`rounded-xl border-2 p-4 transition-all ${
                  formData.season === season.value
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-slate-700 bg-slate-800/30 text-white hover:border-slate-600"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {season.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Planting Date */}

        <div>

          <Label className="mb-2 flex items-center gap-2 text-slate-300">

            <Calendar className="h-4 w-4 text-emerald-400" />

            Planned Planting Date *

          </Label>

          <Input
            required
            type="date"
            value={formData.plantingDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                plantingDate: e.target.value,
              }))
            }
            className="border-slate-700 bg-slate-800/50 text-white"
          />
        </div>

        {/* Optional Fields */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div>

            <Label className="mb-2 text-slate-300">
              Farm Area (ha)
            </Label>

            <Input
              value={formData.farmSize}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  farmSize: e.target.value,
                }))
              }
              placeholder="e.g. 5"
              className="border-slate-700 bg-slate-800/50 text-white"
            />
          </div>

          <div>

            <Label className="mb-2 text-slate-300">
              Expected Yield (kg/ha)
            </Label>

            <Input
              value={formData.expectedYield}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedYield: e.target.value,
                }))
              }
              placeholder="e.g. 2000"
              className="border-slate-700 bg-slate-800/50 text-white"
            />
          </div>
        </div>

        {/* INFO */}

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">

          <p className="text-sm text-blue-300">

            💡 After adding this crop,
            AgroShield AI will generate
            planting recommendations based
            on weather, soil intelligence,
            and climate conditions.

          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-4 border-t border-slate-800 pt-4">

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >

            <Save className="mr-2 h-5 w-5" />

            {isSubmitting
              ? "Saving..."
              : "Get Planting Advisory"}

          </Button>

          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            Cancel
          </Button>

        </div>

      </form>

    </BaseModal>
  );
}