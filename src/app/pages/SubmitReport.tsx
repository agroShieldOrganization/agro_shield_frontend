import { motion } from "motion/react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  AlertTriangle,

  Send,

  X,

  MapPin,

  Image as ImageIcon,

} from "lucide-react";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import { Textarea } from "../components/ui/textarea";

import { toast } from "sonner";

import {

  createIncidentReport,

  generateUploadUrl,

  uploadFileToS3,

  saveFileMetadata,

} from "../../services/IncidentReportService/IncidentReportService";

const incidentTypes = [

  {
    value: "flooding",
    label: "Flooding",
    color: "blue",
  },

  {
    value: "pest",
    label: "Pest Outbreak",
    color: "orange",
  },

  {
    value: "disease",
    label: "Crop Disease",
    color: "red",
  },

  {
    value: "drought",
    label: "Drought",
    color: "yellow",
  },

  {
    value: "fire",
    label: "Bushfire",
    color: "rose",
  },

  {
    value: "erosion",
    label: "Soil Erosion",
    color: "purple",
  },

  {
    value: "other",
    label: "Other",
    color: "slate",
  },
];

const severityLevels = [

  {
    value: "low",
    label: "Low",
    color: "emerald",
  },

  {
    value: "medium",
    label: "Medium",
    color: "orange",
  },

  {
    value: "high",
    label: "High",
    color: "red",
  },
];

export function SubmitReport() {

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [formData, setFormData] =
    useState({

      incidentType: "",

      severity: "",

      location: "",

      latitude: "",

      longitude: "",

      description: "",

      affectedArea: "",

      contactPhone: "",
    });

  /*
  |--------------------------------------------------------------------------
  | FILE VALIDATION
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const files =
      Array.from(
        e.target.files ?? []
      );

    const allowedTypes = [

      "image/jpeg",

      "image/png",

      "image/jpg",
    ];

    const maxSize =
      500 * 1024;

    const validFiles =
      files.filter((file) => {

        if (
          !allowedTypes.includes(
            file.type
          )
        ) {

          toast.error(
            `${file.name} is not a valid image`
          );

          return false;
        }

        if (
          file.size > maxSize
        ) {

          toast.error(
            `${file.name} exceeds 500KB`
          );

          return false;
        }

        return true;
      });

    setSelectedFiles(validFiles);
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (

      !formData.incidentType ||

      !formData.severity ||

      !formData.location ||

      !formData.description
    ) {

      toast.error(
        "Please fill in all required fields"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE COORDINATES
    |--------------------------------------------------------------------------
    */

    if (
      formData.latitude &&
      formData.longitude
    ) {

      const lat =
        parseFloat(
          formData.latitude
        );

      const lng =
        parseFloat(
          formData.longitude
        );

      if (

        isNaN(lat) ||

        isNaN(lng) ||

        lat < -90 ||

        lat > 90 ||

        lng < -180 ||

        lng > 180
      ) {

        toast.error(
          "Invalid GPS coordinates"
        );

        return;
      }
    }

    try {

      setIsSubmitting(true);

      /*
      |--------------------------------------------------------------------------
      | CREATE REPORT
      |--------------------------------------------------------------------------
      */

      const response =
        await createIncidentReport({

          incident_type:
            formData.incidentType,

          severity:
            formData.severity,

          location_name:
            formData.location,

          latitude:
            formData.latitude
              ? Number(
                  formData.latitude
                )
              : null,

          longitude:
            formData.longitude
              ? Number(
                  formData.longitude
                )
              : null,

          description:
            formData.description,

          affected_area_hectares:
            formData.affectedArea
              ? Number(
                  formData.affectedArea
                )
              : null,

          contact_phone:
            formData.contactPhone,

          public_visibility:
            "community",
        });

      const report =
        response.report;

      // Guard against incomplete create responses before we start uploading
      // files that must later be linked back to the new incident report.
      if (!report?.id) {
        throw new Error(
          "Incident report was created without a valid report ID."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FILE UPLOADS
      |--------------------------------------------------------------------------
      */

      for (
        const file
        of selectedFiles
      ) {

        /*
        |--------------------------------------------------------------------------
        | GENERATE PRESIGNED URL
        |--------------------------------------------------------------------------
        */

        const uploadData =
          await generateUploadUrl({

            file_name:
              file.name,

            mime_type:
              file.type ||
              "application/octet-stream",

            size_bytes:
              file.size,
          });

        /*
        |--------------------------------------------------------------------------
        | DIRECT S3 UPLOAD
        |--------------------------------------------------------------------------
        */

        await uploadFileToS3(

          uploadData.upload_url,

          file,

          uploadData.headers
        );
        /*
        |--------------------------------------------------------------------------
        | STORE FILE METADATA
        |--------------------------------------------------------------------------
        */

        await saveFileMetadata({

          incident_report_id:
            report.id,

          original_name:
            file.name,

          stored_name:
            uploadData.stored_name,

          mime_type:
            file.type ||
            "application/octet-stream",

          size_bytes:
            file.size,

          path:
            uploadData.path,
        });
      }

      toast.success(
        "Incident report submitted successfully!"
      );

      setTimeout(() => {

        navigate(
          "/community-reports"
        );

      }, 1500);

    } catch (error) {

      console.error(error);

      // Surface the real upload/backend error to make S3 failures easier
      // to diagnose during report submission.
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit report";

      toast.error(
        message
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GEOLOCATION
  |--------------------------------------------------------------------------
  */

  const handleGetCurrentLocation =
    () => {

      if (
        "geolocation" in navigator
      ) {

        toast.info(
          "Getting your location..."
        );

        navigator.geolocation.getCurrentPosition(

          (position) => {

            setFormData(
              (prev) => ({

                ...prev,

                latitude:
                  position.coords.latitude.toFixed(
                    6
                  ),

                longitude:
                  position.coords.longitude.toFixed(
                    6
                  ),
              })
            );

            toast.success(
              "Location captured successfully!"
            );
          },

          (error) => {

            toast.error(
              "Unable to get location"
            );

            console.error(error);
          }
        );

      } else {

        toast.error(
          "Geolocation not supported"
        );
      }
    };

  return (

    <div className="space-y-6 max-w-4xl mx-auto">

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
      >

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">

          Submit Incident Report

        </h1>

        <p className="text-sm md:text-base text-slate-400">

          Help your community by reporting agricultural incidents and threats

        </p>

      </motion.div>

      {/* ALERT */}

      <motion.div
        initial={{
          y: -20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.1,
        }}
        className="
          bg-gradient-to-r
          from-orange-500/20
          to-amber-500/20
          border
          border-orange-500/50
          rounded-2xl
          p-6
        "
      >

        <div className="flex items-start gap-4">

          <div className="p-3 rounded-xl bg-orange-500/20">

            <AlertTriangle className="w-6 h-6 text-orange-400" />

          </div>

          <div className="flex-1">

            <h3 className="text-lg font-bold text-white mb-1">

              Community Alert System

            </h3>

            <p className="text-sm text-slate-300">

              Your report helps other farmers stay informed and prepared.

            </p>

          </div>

        </div>

      </motion.div>

      {/* FORM */}

      <motion.div
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.2,
        }}
        className="
          bg-slate-900/50
          backdrop-blur-sm
          border
          border-slate-800
          rounded-2xl
          p-8
        "
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* INCIDENT TYPE */}

          <div>

            <Label className="text-slate-300 mb-3 block">

              Incident Type *

            </Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {incidentTypes.map((type) => (

                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({

                      ...prev,

                      incidentType:
                        type.value,
                    }))
                  }
                  className={`
                    p-4
                    rounded-xl
                    border-2
                    transition-all

                    ${
                      formData.incidentType ===
                      type.value

                        ? "border-emerald-500 bg-emerald-500/20"

                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }
                  `}
                >

                  <span className="text-sm font-semibold text-white">

                    {type.label}

                  </span>

                </button>
              ))}
            </div>
          </div>

          {/* SEVERITY */}

          <div>

            <Label className="text-slate-300 mb-3 block">

              Severity Level *

            </Label>

            <div className="grid grid-cols-3 gap-3">

              {severityLevels.map((level) => (

                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({

                      ...prev,

                      severity:
                        level.value,
                    }))
                  }
                  className={`
                    p-4
                    rounded-xl
                    border-2
                    transition-all

                    ${
                      formData.severity ===
                      level.value

                        ? "border-red-500 bg-red-500/20"

                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }
                  `}
                >

                  <span className="text-sm font-semibold text-white">

                    {level.label}

                  </span>

                </button>
              ))}
            </div>
          </div>

          {/* LOCATION */}

          <div>

            <Label className="text-slate-300 mb-2 flex items-center gap-2">

              <MapPin className="w-4 h-4 text-blue-400" />

              Location *

            </Label>

            <Input
              required
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({

                  ...prev,

                  location:
                    e.target.value,
                }))
              }
              placeholder="e.g. Benue River Basin"
              className="
                bg-slate-800/50
                border-slate-700
                text-white
              "
            />

          </div>

          {/* GPS */}

          <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">

            <div className="flex items-center justify-between mb-4">

              <Label className="text-blue-300 font-semibold">

                GPS Coordinates

              </Label>

              <Button
                type="button"
                onClick={
                  handleGetCurrentLocation
                }
                variant="outline"
                size="sm"
                className="
                  border-blue-500/50
                  hover:bg-blue-500/20
                  text-blue-300
                "
              >

                <MapPin className="w-4 h-4 mr-2" />

                Use Current Location

              </Button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({

                    ...prev,

                    latitude:
                      e.target.value,
                  }))
                }
                placeholder="Latitude"
                className="
                  bg-slate-800/50
                  border-slate-700
                  text-white
                "
              />

              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({

                    ...prev,

                    longitude:
                      e.target.value,
                  }))
                }
                placeholder="Longitude"
                className="
                  bg-slate-800/50
                  border-slate-700
                  text-white
                "
              />

            </div>

          </div>

          {/* DESCRIPTION */}

          <div>

            <Label className="text-slate-300 mb-2">

              Description *

            </Label>

            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({

                  ...prev,

                  description:
                    e.target.value,
                }))
              }
              rows={6}
              placeholder="
                Describe the incident...
              "
              className="
                bg-slate-800/50
                border-slate-700
                text-white
                resize-none
              "
            />

          </div>

          {/* EXTRA */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              value={formData.affectedArea}
              onChange={(e) =>
                setFormData((prev) => ({

                  ...prev,

                  affectedArea:
                    e.target.value,
                }))
              }
              placeholder="Affected area (hectares)"
              className="
                bg-slate-800/50
                border-slate-700
                text-white
              "
            />

            <Input
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData((prev) => ({

                  ...prev,

                  contactPhone:
                    e.target.value,
                }))
              }
              placeholder="Contact phone"
              className="
                bg-slate-800/50
                border-slate-700
                text-white
              "
            />

          </div>

          {/* FILES */}

          <div className="
            p-6
            rounded-xl
            border-2
            border-dashed
            border-slate-700
            bg-slate-800/30
          ">

            <div className="text-center mb-4">

              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />

              <p className="text-sm text-slate-300 mb-1">

                Upload Incident Images

              </p>

              <p className="text-xs text-slate-500">

                JPG, JPEG, PNG only — max 500KB

              </p>

            </div>

            <Input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="
                bg-slate-800/50
                border-slate-700
                text-white
              "
            />

            {selectedFiles.length > 0 && (

              <div className="mt-4 space-y-2">

                {selectedFiles.map(
                  (file, index) => (

                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        bg-slate-900/50
                        p-3
                      "
                    >

                      <span className="text-sm text-slate-300">

                        {file.name}

                      </span>

                      <span className="text-xs text-slate-500">

                        {(file.size / 1024).toFixed(1)} KB

                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* ACTIONS */}

          <div className="
            flex
            items-center
            gap-4
            pt-6
            border-t
            border-slate-700
          ">

            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                flex-1
                bg-gradient-to-r
                from-orange-500
                to-amber-600
                hover:from-orange-600
                hover:to-amber-700
              "
            >

              <Send className="w-5 h-5 mr-2" />

              {isSubmitting
                ? "Submitting..."
                : "Submit Report"}

            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/community-reports"
                )
              }
              variant="outline"
              className="
                border-slate-700
                hover:bg-slate-800
              "
            >

              <X className="w-5 h-5 mr-2" />

              Cancel

            </Button>

          </div>

        </form>

      </motion.div>

    </div>
  );
}
