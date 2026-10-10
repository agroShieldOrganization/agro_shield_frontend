import { useMemo } from "react";

import { AlertTriangle } from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface ChartPoint {

  date: string;

  label: string;

  [key: string]:
    | string
    | number
    | null;
}

interface SeriesDescriptor {

  key: string;

  label: string;

  color: string;
}

interface RiskMapProps {

  chartData?: ChartPoint[];

  series?: SeriesDescriptor[];

  metricLabel?: string;

  metricUnit?: string;

  emptyMessage?: string;

  highlightedFarmId?: string | null;
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatYAxisValue(
  value: number,
  unit: string
) {

  if (!Number.isFinite(value)) {
    return "-";
  }

  const formatted =
    value >= 100
      ? value.toFixed(0)
      : value.toFixed(1);

  return unit
    ? `${formatted}${unit}`
    : formatted;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function RiskMap({
  chartData = [],
  series = [],
  metricLabel = "farm trends",
  metricUnit = "",
  emptyMessage = "No farm trend data is available for this view yet.",
  highlightedFarmId,
}: RiskMapProps) {

  // Build the chart palette dynamically so every farm line keeps a stable
  // label/color pairing inside the shared chart primitives.
  const chartConfig =
    useMemo(
      () =>
        Object.fromEntries(
          series.map((item) => [
            item.key,
            {
              label:
                item.label,
              color:
                item.color,
            },
          ])
        ),
      [series]
    );

  if (
    chartData.length === 0 ||
    series.length === 0
  ) {
    return (
      <div className="flex h-[720px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60 p-8">
        <div className="max-w-md space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            No chart data to display
          </h3>
          <p className="text-sm text-slate-400">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-2 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Farm Trend Comparison
          </h3>
          <p className="text-sm text-slate-400">
            Each line represents one farm for {metricLabel.toLowerCase()}.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Unit: {metricUnit || "value"}
        </div>
      </div>

      {/* The old map surface is now a full-width line chart so the new
      backend time-series payload can drive farm-to-farm comparisons. */}
      <ChartContainer
        config={chartConfig}
        className="h-[640px] w-full"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 12,
            right: 24,
            left: 8,
            bottom: 8,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.16)"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            width={86}
            tickFormatter={(value) =>
              formatYAxisValue(
                Number(value),
                metricUnit
              )
            }
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) =>
                  value
                    ? `Date: ${value}`
                    : ""
                }
                formatter={(
                  value,
                  name
                ) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-slate-300">
                      {String(name)}
                    </span>
                    <span className="font-semibold text-white">
                      {formatYAxisValue(
                        Number(value),
                        metricUnit
                      )}
                    </span>
                  </div>
                )}
              />
            }
          />

          <ChartLegend
            verticalAlign="top"
            content={<ChartLegendContent />}
          />

          {series.map((item) => {

            const isHighlighted =
              !highlightedFarmId ||
              highlightedFarmId ===
                item.key;

            return (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={
                  isHighlighted
                    ? 3
                    : 1.75
                }
                dot={false}
                connectNulls
                activeDot={{
                  r: 4,
                }}
                opacity={
                  isHighlighted
                    ? 1
                    : 0.28
                }
              />
            );
          })}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
