import { motion } from "motion/react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  Layers,
  Filter,
} from "lucide-react";

import { RiskMap } from "../components/RiskMap";

import { Button } from "../components/ui/button";

import {
  getFarmMapData,
} from "../../services/GisService/GisService";

import {
  getFloodRisks,
} from "../../services/TomorrowIOServices/FloodRiskService";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Farm {

  id: string;

  name: string;

  latitude: number;

  longitude: number;

  status?: string;

  primary_crop_name?: string | null;

  location_name?: string | null;
}

interface FloodRisk {

  farm_id: string;

  flood_risk: number;

  risk_level: string;
}

/*
|--------------------------------------------------------------------------
| MAP LEGEND
|--------------------------------------------------------------------------
*/

const mapLegend = [

  {
    name: "Normal Farm Layer",

    description:
      "No flood risk detected",

    color: "bg-emerald-500",
  },

  {
    name: "Moderate Flood Risk",

    description:
      "Possible flooding conditions",

    color: "bg-blue-500 ",
  },

  {
    name: "High Flood Risk",

    description:
      "High probability of flooding",

    color: "bg-orange-500",
  },

  {
    name: "Inactive Farm",

    description:
      "Archived or inactive farm",

    color: "bg-slate-500",
  },
];

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function ClimateMap() {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [
    farms,
    setFarms,
  ] = useState<Farm[]>([]);

  const [
    floodRisks,
    setFloodRisks,
  ] = useState<FloodRisk[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH GIS DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchMapData() {

      try {

        setIsLoading(true);

        /*
        |--------------------------------------------------------------------------
        | FETCH FARMS
        |--------------------------------------------------------------------------
        */

        const farmResponse =
          await getFarmMapData();

        setFarms(
          farmResponse.farms ?? []
        );

        /*
        |--------------------------------------------------------------------------
        | FETCH FLOOD RISKS
        |--------------------------------------------------------------------------
        */

        const floodResponse =
          await getFloodRisks();

        setFloodRisks(
          floodResponse.flood_risks ?? []
        );

      } catch (error) {

        console.error(
          "Failed to fetch climate map data",
          error
        );

      } finally {

        setIsLoading(false);
      }
    }

    fetchMapData();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {

    const highRiskFarms =
      floodRisks.filter(
        (risk) =>
          risk.risk_level === "high"
      ).length;

    const mediumRiskFarms =
      floodRisks.filter(
        (risk) =>
          risk.risk_level === "medium"
      ).length;

    return {

      totalFarms:
        farms.length,

      activeFarms:
        farms.filter(
          (farm) =>
            farm.status === "active"
        ).length,

      mappedLocations:
        farms.length,

      highRiskFarms,

      mediumRiskFarms,
    };

  }, [farms, floodRisks]);

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

          Climate Intelligence Map

        </h1>

        <p className="text-sm text-slate-400 md:text-base">

          Real-time agricultural GIS intelligence
          powered by farm coordinates and climate analytics.

        </p>

      </motion.div>

      {/* CONTROLS */}

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
        className="flex flex-wrap items-center gap-4"
      >

        <Button className="bg-emerald-500 hover:bg-emerald-600">

          <Filter className="mr-2 h-4 w-4" />

          Filter Regions

        </Button>

        <Button
          variant="outline"
          className="border-slate-700 hover:border-emerald-500"
        >

          <Layers className="mr-2 h-4 w-4" />

          GIS Layers

        </Button>

        <Button
          variant="outline"
          className="border-slate-700 hover:border-emerald-500"
        >

          <MapPin className="mr-2 h-4 w-4" />

          Add Location

        </Button>

      </motion.div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">

        {/* MAP */}

        <div className="xl:col-span-3">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
            }}
          >

            {isLoading ? (

              <div className="flex h-[700px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/40">

                <div className="text-slate-400">

                  Loading climate intelligence map...

                </div>

              </div>

            ) : (

              <RiskMap
                farms={farms}
                floodRisks={floodRisks}
              />

            )}

          </motion.div>

        </div>

        {/* SIDEBAR */}

        <div className="space-y-6">

          {/* MAP LEGEND */}

          <motion.div
            initial={{
              x: 20,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/50
              p-6
              backdrop-blur-sm
            "
          >

            <h3 className="mb-4 text-lg font-bold text-white">

              Map Legend

            </h3>

            <div className="space-y-3">

              {mapLegend.map(
                (item, index) => (

                  <motion.div
                    key={index}
                    initial={{
                      x: 20,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                    }}
                    transition={{
                      delay:
                        0.4 +
                        index * 0.05,
                    }}
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-slate-700
                      bg-slate-800/30
                      p-4
                    "
                  >

                    <div
                      className={`mt-1 h-4 w-4 rounded-full ${item.color}`}
                    />

                    <div>

                      <h4 className="text-sm font-semibold text-white">

                        {item.name}

                      </h4>

                      <p className="text-xs text-slate-400">

                        {item.description}

                      </p>

                    </div>

                  </motion.div>
                )
              )}

            </div>

          </motion.div>

          {/* COVERAGE STATS */}

          <motion.div
            initial={{
              x: 20,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
            }}
            className="
              rounded-2xl
              border
              border-blue-500/30
              bg-gradient-to-br
              from-blue-500/10
              to-cyan-500/10
              p-6
              backdrop-blur-sm
            "
          >

            <h3 className="mb-4 text-lg font-bold text-white">

              Climate Coverage Stats

            </h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">

                  Total Farms

                </span>

                <span className="text-lg font-bold text-white">

                  {stats.totalFarms}

                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">

                  Active Farms

                </span>

                <span className="text-lg font-bold text-emerald-400">

                  {stats.activeFarms}

                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">

                  GIS Locations

                </span>

                <span className="text-lg font-bold text-blue-400">

                  {stats.mappedLocations}

                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">

                  High Flood Risk

                </span>

                <span className="text-lg font-bold text-cyan-400">

                  {stats.highRiskFarms}

                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">

                  Moderate Flood Risk

                </span>

                <span className="text-lg font-bold text-orange-400">

                  {stats.mediumRiskFarms}

                </span>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}