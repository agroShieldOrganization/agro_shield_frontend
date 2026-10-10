import type { ReactElement } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import { FloodLayer } from "../components/climate/FloodLayer";
import { RainfallLayer } from "../components/climate/RainfallLayer";
import { FireAnalyticsLayer } from "../components/climate/FireAnalyticsLayer";
import { SoilAnalyticsLayer } from "../components/climate/SoilAnalyticsLayer";

export function ClimateIntelligence(): ReactElement {

  return (
    <div className="size-full overflow-auto bg-slate-950 px-3 py-6 sm:px-4 lg:px-5">
      {/* Keep a small gutter near the sidebar instead of centering the entire
      page inside a wide max-width container. */}
      <div className="w-full">
        <Tabs defaultValue="flood" className="w-full space-y-6">
          {/* TABS NAVIGATION */}
          <div className="w-full border-b border-slate-800/50">
            <TabsList className="inline-flex h-auto w-full max-w-full justify-start gap-1 overflow-x-auto rounded-none border-0 bg-transparent p-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
              <TabsTrigger
                value="overview"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-emerald-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-emerald-400
                  data-[state=active]:shadow-none
                "
              >
                Overview
              </TabsTrigger>

              <TabsTrigger
                value="flood"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-cyan-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-cyan-400
                  data-[state=active]:shadow-none
                "
              >
                Flood Prediction
              </TabsTrigger>

              <TabsTrigger
                value="rainfall"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-blue-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-blue-400
                  data-[state=active]:shadow-none
                "
              >
                Rainfall Analytics
              </TabsTrigger>

              <TabsTrigger
                value="fire"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-orange-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-orange-400
                  data-[state=active]:shadow-none
                "
              >
                Fire Analytics
              </TabsTrigger>

              <TabsTrigger
                value="soil"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-amber-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-amber-400
                  data-[state=active]:shadow-none
                "
              >
                Soil Analytics
              </TabsTrigger>

              <TabsTrigger
                value="air"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-violet-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-violet-400
                  data-[state=active]:shadow-none
                "
              >
                Air Quality
              </TabsTrigger>

              <TabsTrigger
                value="weather"
                className="
                  relative
                  rounded-t-lg
                  border-b-2
                  border-transparent
                  bg-transparent
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-slate-800/30
                  hover:text-slate-200
                  data-[state=active]:border-sky-500
                  data-[state=active]:bg-slate-800/50
                  data-[state=active]:text-sky-400
                  data-[state=active]:shadow-none
                "
              >
                Weather Forecast
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT PANELS */}
          <TabsContent value="overview" className="mt-0">
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-8 backdrop-blur-sm">
              <p className="text-slate-400">Climate overview dashboard coming soon.</p>
            </div>
          </TabsContent>

           <TabsContent value="soil" className="mt-0">
            <SoilAnalyticsLayer />
          </TabsContent>

          <TabsContent value="rainfall" className="mt-0">
            <RainfallLayer />
          </TabsContent>

          <TabsContent value="flood" className="mt-0">
            <FloodLayer />
          </TabsContent>          

          <TabsContent value="fire" className="mt-0">
            <FireAnalyticsLayer />
          </TabsContent>

         

          <TabsContent value="air" className="mt-0">
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-8 backdrop-blur-sm">
              <p className="text-slate-400">Air quality analytics coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="weather" className="mt-0">
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-8 backdrop-blur-sm">
              <p className="text-slate-400">Weather forecast dashboard coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
