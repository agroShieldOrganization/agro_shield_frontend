import { motion } from "motion/react";

import {

  MapPin,

  Users,

  TrendingUp,

  AlertCircle,

  Loader2,

} from "lucide-react";

import {

  useEffect,

  useMemo,

  useState,

} from "react";

import { AlertFeed } from "../components/AlertFeed";

import {

  getIncidentReports,

  type IncidentReport,

} from "../../services/IncidentReportService/IncidentReportService";

export function CommunityReports() {

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [reports, setReports] =
    useState<IncidentReport[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH REPORTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchReports() {

      try {

        const response =
          await getIncidentReports();

        setReports(
          response.reports?.data ?? []
        );

      } catch (error) {

        console.error(
          "Failed to fetch reports",
          error
        );

      } finally {

        setLoading(false);
      }
    }

    fetchReports();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY STATS
  |--------------------------------------------------------------------------
  */

  const summary =
    useMemo(() => {

      const totalReports =
        reports.length;

      const activeIncidents =
        reports.filter(
          (report) =>
            report.verification_status !==
            "rejected"
        ).length;

      const contributingFarmers =
        new Set(

          reports
            .filter(
              (report) =>
                report.reporter?.id
            )
            .map(
              (report) =>
                report.reporter?.id
            )
        ).size;

      const locationsCovered =
        new Set(

          reports.map(
            (report) =>
              report.location_name
          )
        ).size;

      return {

        totalReports,

        activeIncidents,

        contributingFarmers,

        locationsCovered,
      };

    }, [reports]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORY COUNTS
  |--------------------------------------------------------------------------
  */

  const categoryStats =
    useMemo(() => {

      const categories = [

        "flooding",

        "pest",

        "disease",

        "drought",

        "fire",

        "erosion",
      ];

      return categories.map(
        (category) => ({

          category,

          count:
            reports.filter(
              (report) =>
                report.incident_type ===
                category
            ).length,
        })
      );

    }, [reports]);

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="
        flex
        items-center
        justify-center
        h-[70vh]
      ">

        <Loader2 className="
          w-10
          h-10
          animate-spin
          text-emerald-400
        " />

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
      >

        <h1 className="
          text-2xl
          md:text-3xl
          lg:text-4xl
          font-bold
          text-white
          mb-2
        ">

          Community Reports

        </h1>

        <p className="
          text-sm
          md:text-base
          text-slate-400
        ">

          Crowdsourced incident reports from farmers across Nigeria

        </p>

      </motion.div>

      {/* SUMMARY CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        {[
          {
            label: "Total Reports",
            value: summary.totalReports,
            icon: AlertCircle,
            color: "blue",
          },

          {
            label: "Active Incidents",
            value: summary.activeIncidents,
            icon: TrendingUp,
            color: "orange",
          },

          {
            label: "Contributing Farmers",
            value: summary.contributingFarmers,
            icon: Users,
            color: "emerald",
          },

          {
            label: "Locations Covered",
            value: summary.locationsCovered,
            icon: MapPin,
            color: "purple",
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
            className={`
              bg-gradient-to-br
              from-${item.color}-500/10
              to-${item.color}-600/10
              backdrop-blur-sm
              border
              border-${item.color}-500/30
              rounded-2xl
              p-6
            `}
          >

            <div className="
              flex
              items-start
              justify-between
              mb-3
            ">

              <div className={`
                p-3
                rounded-xl
                bg-${item.color}-500/10
              `}>

                <item.icon
                  className={`
                    w-6
                    h-6
                    text-${item.color}-400
                  `}
                />

              </div>

            </div>

            <div className="
              text-3xl
              font-bold
              text-white
              mb-1
            ">

              {item.value}

            </div>

            <div className="
              text-sm
              text-slate-400
            ">

              {item.label}

            </div>

          </motion.div>
        ))}

      </div>

      {/* ALERT FEED */}

      <AlertFeed reports={reports} />

      {/* REPORT CATEGORIES */}

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
          delay: 0.3,
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

        <h3 className="
          text-lg
          font-bold
          text-white
          mb-4
        ">

          Report Categories

        </h3>

        <div className="
          grid
          grid-cols-2
          md:grid-cols-3
          xl:grid-cols-6
          gap-4
        ">

          {categoryStats.map(
            (item, index) => (

              <motion.div
                key={index}
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay:
                    0.4 + index * 0.05,
                }}
                className="
                  p-4
                  rounded-xl
                  bg-slate-800/40
                  border
                  border-slate-700
                  text-center
                  hover:scale-105
                  transition-transform
                "
              >

                <div className="
                  text-3xl
                  font-bold
                  text-emerald-400
                  mb-1
                ">

                  {item.count}

                </div>

                <div className="
                  text-sm
                  text-slate-300
                  capitalize
                ">

                  {item.category}

                </div>

              </motion.div>
            )
          )}

        </div>

      </motion.div>

    </div>
  );
}