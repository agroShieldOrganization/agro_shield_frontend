import { motion } from "motion/react";

import {

  MapPin,

  AlertCircle,

  Flame,

  Bug,

  CloudRain,

  Waves,

  Filter,

} from "lucide-react";

import {

  useMemo,

  useState,

} from "react";

import { Badge } from "./ui/badge";

import { ScrollArea } from "./ui/scroll-area";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "./ui/select";

import type {

  IncidentReport,

} from "../../services/IncidentReportService/IncidentReportService";

interface AlertFeedProps {

  reports: IncidentReport[];
}

/*
|--------------------------------------------------------------------------
| TYPE CONFIGURATION
|--------------------------------------------------------------------------
*/

const typeConfig = {

  flooding: {

    icon: Waves,

    color: "text-blue-400",

    bg: "bg-blue-500/10",

    label: "Flooding",
  },

  pest: {

    icon: Bug,

    color: "text-orange-400",

    bg: "bg-orange-500/10",

    label: "Pest Outbreak",
  },

  fire: {

    icon: Flame,

    color: "text-red-400",

    bg: "bg-red-500/10",

    label: "Bushfire",
  },

  drought: {

    icon: CloudRain,

    color: "text-yellow-400",

    bg: "bg-yellow-500/10",

    label: "Drought",
  },

  disease: {

    icon: AlertCircle,

    color: "text-rose-400",

    bg: "bg-rose-500/10",

    label: "Crop Disease",
  },

  erosion: {

    icon: AlertCircle,

    color: "text-purple-400",

    bg: "bg-purple-500/10",

    label: "Soil Erosion",
  },

  other: {

    icon: AlertCircle,

    color: "text-slate-400",

    bg: "bg-slate-500/10",

    label: "Other",
  },
};

const severityColors = {

  low:
    "text-green-400 border-green-500/30",

  medium:
    "text-orange-400 border-orange-500/30",

  high:
    "text-red-400 border-red-500/30",
};

/*
|--------------------------------------------------------------------------
| RELATIVE TIME FORMATTER
|--------------------------------------------------------------------------
*/

function formatRelativeTime(
  dateString: string
) {

  const date =
    new Date(dateString);

  const now =
    new Date();

  const diffMs =
    now.getTime() -
    date.getTime();

  const diffMinutes =
    Math.floor(
      diffMs / 60000
    );

  const diffHours =
    Math.floor(
      diffMinutes / 60
    );

  const diffDays =
    Math.floor(
      diffHours / 24
    );

  if (diffMinutes < 60) {

    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {

    return `${diffHours} hrs ago`;
  }

  return `${diffDays} days ago`;
}

export function AlertFeed({

  reports,

}: AlertFeedProps) {

  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const [selectedType, setSelectedType] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | FILTERED REPORTS
  |--------------------------------------------------------------------------
  */

  const filteredReports =
    useMemo(() => {

      if (!reports || reports.length === 0) return [];

      if (
        selectedType === "all"
      ) {

        return reports;
      }

      return reports.filter(
        (report) =>

          report.incident_type ===
          selectedType
      );

    }, [
      reports,
      selectedType,
    ]);

  return (

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
        delay: 0.4,
      }}
      className="
        bg-slate-900/50
        backdrop-blur-sm
        border
        border-slate-800
        rounded-2xl
        p-6
      "
    >

      {/* HEADER */}

      <div className="mb-6">

        <div className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          <div>

            <div className="
              flex
              items-center
              gap-3
              mb-2
            ">

              <h3 className="
                text-lg
                font-bold
                text-white
              ">

                Community Reports

              </h3>

              <Badge
                variant="outline"
                className="
                  bg-orange-500/10
                  text-orange-400
                  border-orange-500/30
                "
              >

                {filteredReports?.length??0} Active

              </Badge>

            </div>

            <p className="
              text-sm
              text-slate-400
            ">

              Real-time incident feed from verified farmers

            </p>

          </div>

          {/* FILTER */}

          <div className="w-full lg:w-[260px]">

            <Select
              value={selectedType}
              onValueChange={
                setSelectedType
              }
            >

              <SelectTrigger
                className="
                  bg-slate-800/50
                  border-slate-700
                  text-white
                "
              >

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <Filter className="
                    w-4
                    h-4
                    text-emerald-400
                  " />

                  <SelectValue
                    placeholder="Filter reports"
                  />

                </div>

              </SelectTrigger>

              <SelectContent
                className="
                  bg-slate-900
                  border-slate-700
                  text-white
                "
              >

                <SelectItem value="all">

                  All Incidents

                </SelectItem>

                <SelectItem value="flooding">

                  Flooding

                </SelectItem>

                <SelectItem value="pest">

                  Pest Outbreak

                </SelectItem>

                <SelectItem value="disease">

                  Crop Disease

                </SelectItem>

                <SelectItem value="drought">

                  Drought

                </SelectItem>

                <SelectItem value="fire">

                  Bushfire

                </SelectItem>

                <SelectItem value="erosion">

                  Soil Erosion

                </SelectItem>

              </SelectContent>

            </Select>

          </div>

        </div>

      </div>

      {/* EMPTY STATE */}

      {filteredReports.length === 0 && (

        <div className="
          py-20
          text-center
        ">

          <AlertCircle
            className="
              w-14
              h-14
              text-slate-600
              mx-auto
              mb-4
            "
          />

          <h3 className="
            text-lg
            font-semibold
            text-white
            mb-2
          ">

            No reports found

          </h3>

          <p className="
            text-slate-400
            text-sm
          ">

            No incident reports available for this category.

          </p>

        </div>
      )}

      {/* REPORT GRID */}

      {filteredReports.length > 0 && (

        <ScrollArea className="h-[550px]">

          <div className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
            2xl:grid-cols-3
          ">

            {filteredReports.map(
              (
                report,
                index
              ) => {

                const config =
                  typeConfig[
                    report.incident_type as keyof typeof typeConfig
                  ] ||
                  typeConfig.other;

                const Icon =
                  config.icon;

                return (

                  <motion.div
                    key={report.id}
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
                        0.5 +
                        index * 0.05,
                    }}
                    whileHover={{
                      scale: 1.02,
                    }}
                    className={`
                      p-5
                      rounded-2xl
                      border
                      border-slate-700
                      ${config.bg}
                      cursor-pointer
                      group
                    `}
                  >

                    <div className="
                      flex
                      items-start
                      gap-4
                    ">

                      {/* ICON */}

                      <div className={`
                        p-3
                        rounded-xl
                        bg-slate-900/50
                        ${config.color}
                        group-hover:scale-110
                        transition-transform
                      `}>

                        <Icon className="
                          w-5
                          h-5
                        " />

                      </div>

                      {/* CONTENT */}

                      <div className="
                        flex-1
                        min-w-0
                      ">

                        {/* TOP */}

                        <div className="
                          flex
                          items-start
                          justify-between
                          gap-2
                          mb-2
                        ">

                          <span className={`
                            text-xs
                            font-semibold
                            ${config.color}
                          `}>

                            {config.label}

                          </span>

                          <Badge
                            variant="outline"
                            className={`
                              text-xs
                              shrink-0
                              ${
                                severityColors[
                                  report.severity as keyof typeof severityColors
                                ]
                              }
                            `}
                          >

                            {report.severity}

                          </Badge>

                        </div>

                        {/* TITLE */}

                        <h4 className="
                          text-sm
                          font-semibold
                          text-white
                          mb-2
                          line-clamp-2
                        ">

                          {report.title ||
                            report.description}

                        </h4>

                        {/* LOCATION */}

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-slate-400
                          mb-3
                        ">

                          <MapPin className="
                            w-3
                            h-3
                          " />

                          <span>

                            {report.location_name}

                          </span>

                        </div>

                        {/* DESCRIPTION */}

                        <p className="
                          text-xs
                          text-slate-500
                          line-clamp-3
                          mb-4
                        ">

                          {report.description}

                        </p>

                        {/* FOOTER */}

                        <div className="
                          flex
                          items-center
                          justify-between
                          text-xs
                        ">

                          <span className="
                            text-slate-500
                          ">

                            {
                              formatRelativeTime(
                                report.created_at
                              )
                            }

                          </span>

                          <span className="
                            text-emerald-400
                          ">

                            {
                              report.files?.length || 0
                            } files

                          </span>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>

        </ScrollArea>
      )}

    </motion.div>
  );
}