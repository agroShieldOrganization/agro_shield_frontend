import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sprout, Save, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { createFarm } from "../../services/FarmServices/FarmService";
import { getCurrentLocation } from "../utilities/GetCoordinates";


export function AddFarm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    latitude: "",
    longitude: "",
    farmSize: "",
    cropType: ""
  });

  const [isSubmitting, setIsSubmitting] =
  useState(false);


      // Get the Location
      const handleGetCurrentLocation =
      async () => {

        try {

          const location =
            await getCurrentLocation();

          setFormData((prev) => ({
            ...prev,

            latitude:
              location.latitude,

            longitude:
              location.longitude,
          }));

        } catch (error) {

          console.error(error);
        }
    };

    const handleSubmit = async (
              e: React.FormEvent
            ) => {

              e.preventDefault();

              /*
              |--------------------------------------------------------------------------
              | VALIDATION
              |--------------------------------------------------------------------------
              */

              if (
                !formData.farmName ||
                !formData.location ||
                !formData.latitude ||
                !formData.longitude
              ) {

                toast.error(
                  "Please fill in all required fields"
                );

                return;
              }

              const lat = parseFloat(
                formData.latitude
              );

              const lng = parseFloat(
                formData.longitude
              );

              if (
                isNaN(lat) ||
                isNaN(lng)
              ) {

                toast.error(
                  "Please enter valid GPS coordinates"
                );

                return;
              }

              if (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
              ) {

                toast.error(
                  "GPS coordinates are out of range"
                );

                return;
              }

              /*
              |--------------------------------------------------------------------------
              | API REQUEST
              |--------------------------------------------------------------------------
              */

              try {

                setIsSubmitting(true);

                await createFarm({

                  name:
                    formData.farmName,

                  location_name:
                    formData.location,

                  latitude: lat,

                  longitude: lng,

                  size_hectares:
                    formData.farmSize
                      ? Number(formData.farmSize)
                      : null,

                  primary_crop_name:
                    formData.cropType || null,

                  country: "Nigeria",
                });

                toast.success(
                  `Farm "${formData.farmName}" added successfully!`
                );

                navigate("/my-farms");

              } catch (error: any) {

                toast.error(
                  error.response?.data?.message ||
                  "Failed to create farm"
                );

              } finally {

                setIsSubmitting(false);
              }
            };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
          Add New Farm
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Register a new farm to start tracking climate data and recommendations
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Name */}
          <div>
            <Label className="text-slate-300 mb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              Farm Name *
            </Label>
            <Input
              required
              value={formData.farmName}
              onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
              placeholder="e.g., Kaduna Valley Farm"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-slate-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Location/Address *
            </Label>
            <Input
              required
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Kaduna State, Nigeria"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500 mt-1">Enter the city, state, or region</p>
          </div>

          {/* GPS Coordinates */}
          <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-blue-300 font-semibold">GPS Coordinates *</Label>
              <Button
                type="button"
                onClick={handleGetCurrentLocation}
                variant="outline"
                size="sm"
                className="border-blue-500/50 hover:bg-blue-500/20 text-blue-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 text-sm">Latitude</Label>
                <Input
                  required
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., 10.5105"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Range: -90 to 90</p>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 text-sm">Longitude</Label>
                <Input
                  required
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 7.4165"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Range: -180 to 180</p>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 mb-2">Farm Size (Optional)</Label>
              <Input
                value={formData.farmSize}
                onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                placeholder="e.g., 12 hectares"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2">Primary Crop (Optional)</Label>
              <Input
                value={formData.cropType}
                onChange={(e) => setFormData(prev => ({ ...prev, cropType: e.target.value }))}
                placeholder="e.g., Maize"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting
              ? "Saving..."
              : "Add Farm"}
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/my-farms")}
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Help Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-3">How to get GPS Coordinates</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-purple-400">1</span>
            <span>Click "Use Current Location" button if you're at the farm</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-purple-400">2</span>
            <span>Or use Google Maps: Right-click on your farm location and copy coordinates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-purple-400">3</span>
            <span>Paste the numbers into Latitude and Longitude fields</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
