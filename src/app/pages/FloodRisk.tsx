import { motion } from "motion/react";

import {
  AlertTriangle,
  Droplets,
  MapPin,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Badge } from "../components/ui/badge";

import { Progress } from "../components/ui/progress";

import {
  getFloodZones,
  type FloodZone,
} from "../../services/FloodZoneService/FloodZoneService";

/*
|--------------------------------------------------------------------------
| RISK CONFIG
|--------------------------------------------------------------------------
*/

const riskConfig = {

  critical: {

    label: "Critical",

    iconColor: "text-red-400",

    badgeBg:
      "bg-red-500/20 text-red-400 border-red-500/30",

    cardBg:
      "from-red-500/10 to-rose-500/10",

    border:
      "border-red-500/40",
  },

  high: {

    label: "High",

    iconColor: "text-orange-400",

    badgeBg:
      "bg-orange-500/20 text-orange-400 border-orange-500/30",

    cardBg:
      "from-orange-500/10 to-amber-500/10",

    border:
      "border-orange-500/40",
  },

  medium: {

    label: "Moderate",

    iconColor: "text-yellow-400",

    badgeBg:
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",

    cardBg:
      "from-yellow-500/10 to-amber-500/10",

    border:
      "border-yellow-500/40",
  },

  low: {

    label: "Low",

    iconColor: "text-emerald-400",

    badgeBg:
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",

    cardBg:
      "from-emerald-500/10 to-green-500/10",

    border:
      "border-emerald-500/40",
  },
} as const;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function evacuationStatusColor(
  status: string
): string {

  if (status === "Recommended") {
    return "text-red-400";
  }

  if (status === "Monitor") {
    return "text-orange-400";
  }

  return "text-emerald-400";
}

function formatUpdatedTime(
  date: string
) {

  return new Date(
    date
  ).toLocaleString();
}

/*
|--------------------------------------------------------------------------
| ZONE CARD
|--------------------------------------------------------------------------
*/

interface ZoneCardProps {

  zone: FloodZone;

  index: number;
}

function ZoneCard({
  zone,
  index,
}: ZoneCardProps) {

  const config =
    riskConfig[
      zone.risk_level
    ];

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
        delay:
          0.3 + index * 0.05,
      }}
      className={`
        rounded-2xl
        border
        p-4
        backdrop-blur-sm
        bg-gradient-to-br
        ${config.cardBg}
        ${config.border}
      `}
    >

      {/* HEADER */}

      <div className="mb-4 flex items-start justify-between">

        <div>

          <h3 className="text-lg font-bold text-white">

            {zone.location}

          </h3>

          <p className="text-sm text-slate-400">

            {zone.river ?? "River Basin"}

          </p>

        </div>

        <Badge
          className={config.badgeBg}
        >

          {config.label}

        </Badge>

      </div>

      {/* DISCHARGE */}

      <div className="mb-4">

        <p className="mb-2 text-sm text-slate-300">

          {zone.discharge_status}

        </p>

        <Progress
          value={
            zone.probability
          }
          className="h-2"
        />

        <div className="mt-2 flex items-center justify-between">

          <span className="text-xs text-slate-400">

            Flood Probability

          </span>

          <span className="text-sm font-bold text-white">

            {zone.probability}%

          </span>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">

          <div className="text-xs text-slate-400">

            Affected Farms

          </div>

          <div className="text-xl font-bold text-white">

            {zone.affected_farms}

          </div>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">

          <div className="text-xs text-slate-400">

            Total Farms

          </div>

          <div className="text-xl font-bold text-white">

            {zone.total_farms}

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-4 flex items-center justify-between">

        <div>

          <div className="text-xs text-slate-500">

            Evacuation

          </div>

          <div
            className={`text-sm font-semibold ${evacuationStatusColor(
              zone.evacuation_status
            )}`}
          >

            {zone.evacuation_status}

          </div>

        </div>

        <div className="text-right">

          <div className="text-xs text-slate-500">

            Updated

          </div>

          <div className="text-xs text-slate-300">

            {formatUpdatedTime(
              zone.last_updated
            )}

          </div>

        </div>

      </div>

    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export function FloodRisk() {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [
    floodZones,
    setFloodZones,
  ] = useState<FloodZone[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchFloodZones() {

      try {

        const response =
          await getFloodZones();

        setFloodZones(
          response.flood_zones ?? []
        );

      } catch (error) {

        console.error(
          "Failed to fetch flood zones",
          error
        );

      } finally {

        setIsLoading(false);
      }
    }

    fetchFloodZones();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | CRITICAL ZONE
  |--------------------------------------------------------------------------
  */

  const criticalZone =
    floodZones.find(
      (zone) =>
        zone.risk_level ===
        "critical"
    );

  /*
  |--------------------------------------------------------------------------
  | SUMMARY STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {

    return {

      highRiskZones:
        floodZones.filter(
          (z) =>
            z.risk_level ===
              "high" ||
            z.risk_level ===
              "critical"
        ).length,

      affectedFarms:
        floodZones.reduce(
          (sum, z) =>
            sum +
            z.affected_farms,
          0
        ),

      activeAlerts:
        floodZones.filter(
          (z) =>
            z.probability >= 40
        ).length,

      avgProbability:

        floodZones.length > 0

          ? Math.round(

              floodZones.reduce(
                (sum, z) =>
                  sum +
                  z.probability,
                0
              ) /
                floodZones.length
            )

          : 0,
    };

  }, [floodZones]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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
      >

        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">

          Flood Risk Assessment

        </h1>

        <p className="text-sm text-slate-400 md:text-base">

          Real-time flood monitoring and river basin intelligence.

        </p>

      </motion.div>

      {/* ALERT BANNER */}

      {criticalZone && (

        <motion.div
          initial={{
            y: -20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          className="
            rounded-2xl
            border
            border-red-500/50
            bg-gradient-to-r
            from-red-500/20
            to-orange-500/20
            p-5
          "
        >

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-red-500/20 p-3">

              <AlertTriangle className="h-5 w-5 text-red-400" />

            </div>

            <div>

              <h3 className="mb-2 text-lg font-bold text-white">

                Critical Flood Alert

              </h3>

              <p className="text-sm text-slate-300">

                {criticalZone.location}
                {" "}
                is experiencing severe flood risk conditions.

              </p>

            </div>

          </div>

        </motion.div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        {[
          {
            label:
              "High Risk Zones",

            value:
              stats.highRiskZones,

            icon:
              AlertTriangle,
          },

          {
            label:
              "Affected Farms",

            value:
              stats.affectedFarms,

            icon:
              MapPin,
          },

          {
            label:
              "Average Risk",

            value:
              `${stats.avgProbability}%`,

            icon:
              Droplets,
          },

          {
            label:
              "Active Alerts",

            value:
              stats.activeAlerts,

            icon:
              TrendingUp,
          },
        ].map(
          (
            item,
            index
          ) => (

            <motion.div
              key={item.label}
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
                  0.2 +
                  index * 0.05,
              }}
              className="
                rounded-2xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="text-2xl font-bold text-white">

                    {item.value}

                  </div>

                  <div className="text-xs text-slate-400">

                    {item.label}

                  </div>

                </div>

                <item.icon className="h-5 w-5 text-emerald-400" />

              </div>

            </motion.div>
          )
        )}

      </div>

      {/* LOADING */}

      {isLoading && (

        <div className="py-16 text-center text-slate-400">

          Loading flood intelligence...

        </div>
      )}

      {/* EMPTY */}

      {!isLoading &&
        floodZones.length === 0 && (

          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-10 text-center">

            <p className="text-slate-400">

              No flood zone data available yet.

            </p>

          </div>
        )}

      {/* GRID */}

      {!isLoading &&
        floodZones.length > 0 && (

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {floodZones.map(
              (
                zone,
                index
              ) => (

                <ZoneCard
                  key={
                    zone.location
                  }
                  zone={zone}
                  index={index}
                />
              )
            )}

          </div>
        )}

    </div>
  );
}