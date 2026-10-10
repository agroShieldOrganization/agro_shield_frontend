import { motion } from "motion/react";

import {
  Flame,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Trees,
  ShieldAlert,
  MapPinned,
  CloudSun,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import {
  Badge,
} from "../ui/badge";

import {
  Button,
} from "../ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { useMemo, useState } from "react";

export function FireAnalyticsLayer() {

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [selectedFarm, setSelectedFarm] =
    useState("north-farm");

  /*
  |--------------------------------------------------------------------------
  | MOCK DATA
  |--------------------------------------------------------------------------
  |
  | Replace with Tomorrow.io fire/weather API
  |
  */

  const fireData = useMemo(() => ({

    fireRiskScore: 72,

    temperature: 39,

    humidity: 18,

    windSpeed: 24,

    vegetationDryness: "High",

    nextCriticalWindow:
      "Tomorrow 2PM - 5PM",

    smokeRisk: "Moderate",

  }), []);

  /*
  |--------------------------------------------------------------------------
  | RISK COLOR
  |--------------------------------------------------------------------------
  */

  const riskColor =
    fireData.fireRiskScore >= 70
      ? "text-red-400"
      : fireData.fireRiskScore >= 50
      ? "text-orange-400"
      : "text-yellow-300";

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >

        <h1 className="text-3xl font-bold text-white">

          Fire Risk Intelligence

        </h1>

        <p className="mt-2 text-slate-400">

          Monitor wildfire risks, dangerous
          environmental conditions, and fire weather
          patterns affecting agricultural operations.

        </p>

      </motion.div>

      {/* TOP GRID */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

        {/* FARM SELECTOR */}

        <Card className="border-slate-800 bg-slate-900/55">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <MapPinned className="h-5 w-5 text-orange-300" />

              Farm

            </CardTitle>

          </CardHeader>

          <CardContent>

            <Select
              value={selectedFarm}
              onValueChange={setSelectedFarm}
            >

              <SelectTrigger className="border-slate-700 bg-slate-950 text-white">

                <SelectValue />

              </SelectTrigger>

              <SelectContent className="border-slate-700 bg-slate-950 text-white">

                <SelectItem value="north-farm">
                  North Farm
                </SelectItem>

                <SelectItem value="east-sector">
                  East Sector
                </SelectItem>

                <SelectItem value="rice-valley">
                  Rice Valley
                </SelectItem>

              </SelectContent>

            </Select>

          </CardContent>

        </Card>

        {/* FIRE RISK SCORE */}

        <Card className="border-red-500/20 bg-red-500/10">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <Flame className="h-5 w-5 text-red-400" />

              Fire Risk Score

            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className={`text-5xl font-bold ${riskColor}`}>

              {fireData.fireRiskScore}

            </div>

            <Badge className="mt-3 border-red-500/20 bg-red-500/10 text-red-300">

              High Risk

            </Badge>

          </CardContent>

        </Card>

        {/* CRITICAL WINDOW */}

        <Card className="border-orange-500/20 bg-orange-500/10">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <AlertTriangle className="h-5 w-5 text-orange-300" />

              Critical Window

            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="text-2xl font-bold text-orange-300">

              {fireData.nextCriticalWindow}

            </div>

            <p className="mt-2 text-sm text-slate-300">

              Peak fire weather conditions expected.

            </p>

          </CardContent>

        </Card>

        {/* VEGETATION DRYNESS */}

        <Card className="border-yellow-500/20 bg-yellow-500/10">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <Trees className="h-5 w-5 text-yellow-300" />

              Vegetation Dryness

            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold text-yellow-300">

              {fireData.vegetationDryness}

            </div>

            <p className="mt-2 text-sm text-slate-300">

              Dry crop residue detected.

            </p>

          </CardContent>

        </Card>

      </div>

      {/* WEATHER DRIVERS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* TEMPERATURE */}

        <Card className="border-slate-800 bg-slate-900/55">

          <CardContent className="pt-6">

            <div className="flex items-center gap-3">

              <Thermometer className="h-6 w-6 text-red-400" />

              <div>

                <div className="text-sm text-slate-400">
                  Temperature
                </div>

                <div className="text-3xl font-bold text-white">
                  {fireData.temperature}°C
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* HUMIDITY */}

        <Card className="border-slate-800 bg-slate-900/55">

          <CardContent className="pt-6">

            <div className="flex items-center gap-3">

              <Droplets className="h-6 w-6 text-cyan-300" />

              <div>

                <div className="text-sm text-slate-400">
                  Humidity
                </div>

                <div className="text-3xl font-bold text-white">
                  {fireData.humidity}%
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* WIND */}

        <Card className="border-slate-800 bg-slate-900/55">

          <CardContent className="pt-6">

            <div className="flex items-center gap-3">

              <Wind className="h-6 w-6 text-slate-300" />

              <div>

                <div className="text-sm text-slate-400">
                  Wind Speed
                </div>

                <div className="text-3xl font-bold text-white">
                  {fireData.windSpeed} km/h
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* SMOKE RISK */}

        <Card className="border-slate-800 bg-slate-900/55">

          <CardContent className="pt-6">

            <div className="flex items-center gap-3">

              <CloudSun className="h-6 w-6 text-orange-300" />

              <div>

                <div className="text-sm text-slate-400">
                  Smoke Risk
                </div>

                <div className="text-3xl font-bold text-white">
                  {fireData.smokeRisk}
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">

        {/* LEFT */}

        <div className="space-y-6 xl:col-span-3">

          {/* FIRE TREND CHART */}

          <Card className="border-slate-800 bg-slate-900/55">

            <CardHeader>

              <CardTitle className="text-white">

                Fire Risk Trend Analytics

              </CardTitle>

              <CardDescription>

                Fire weather conditions and wildfire risk trends.

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50">

                <div className="text-center">

                  <Flame className="mx-auto mb-4 h-12 w-12 text-red-400" />

                  <div className="text-lg font-medium text-white">

                    Fire Risk Chart Placeholder

                  </div>

                  <p className="mt-2 text-sm text-slate-400">

                    Tomorrow.io fire analytics chart
                    renders here.

                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

          {/* FIRE ADVISORY */}

          <Card className="border-red-500/20 bg-red-500/10">

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-white">

                <ShieldAlert className="h-5 w-5 text-red-400" />

                Emergency Fire Advisory

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4 text-slate-300">

              <div className="rounded-2xl border border-red-500/20 bg-slate-950/40 p-4">

                Avoid open burning and machinery
                operations during peak afternoon heat.

              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-slate-950/40 p-4">

                Inspect irrigation channels and firebreaks
                around dry vegetation zones.

              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-slate-950/40 p-4">

                Strong winds may accelerate fire spread
                across exposed crop areas.

              </div>

            </CardContent>

          </Card>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* FIRE FORECAST */}

          <Card className="border-slate-800 bg-slate-900/55">

            <CardHeader>

              <CardTitle className="text-white">

                7-Day Fire Forecast

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-3">

              {[
                {
                  day: "Monday",
                  risk: "Moderate",
                  color: "text-yellow-300",
                },
                {
                  day: "Tuesday",
                  risk: "High",
                  color: "text-orange-300",
                },
                {
                  day: "Wednesday",
                  risk: "Extreme",
                  color: "text-red-400",
                },
              ].map((forecast) => (

                <div
                  key={forecast.day}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                >

                  <div className="text-white">

                    {forecast.day}

                  </div>

                  <div className={forecast.color}>

                    {forecast.risk}

                  </div>

                </div>

              ))}

            </CardContent>

          </Card>

          {/* RESPONSE BUTTON */}

          <Card className="border-slate-800 bg-slate-900/55">

            <CardHeader>

              <CardTitle className="text-white">

                Mitigation Actions

              </CardTitle>

            </CardHeader>

            <CardContent>

              <Button className="w-full bg-red-500 hover:bg-red-600">

                Generate Fire Mitigation Plan

              </Button>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
}