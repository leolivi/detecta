import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";
import {Bar, BarChart, XAxis, YAxis} from "recharts";
import {useTrackingStats} from "@/hooks/use-tracking-stats";
import {ChartAlert} from "../alert/chart-alert";
import {useState} from "react";
import {getTotalTrackers} from "@/utils/total-trackers";

export function TrackingChart() {
  const stats = useTrackingStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chartData = [
    {
      name: "Network",
      value: stats.networkRequests,
      fill: "var(--chart-1)",
    },
    {
      name: "URL Params",
      value: stats.urlParameters,
      fill: "var(--chart-2)",
    },
    {
      name: "Pixels",
      value: stats.pixels,
      fill: "var(--chart-3)",
    },
    {
      name: "iFrames",
      value: stats.iframes,
      fill: "var(--chart-4)",
    },
    {
      name: "Scripts",
      value: stats.scripts,
      fill: "var(--chart-5)",
    },
    {
      name: "Widgets",
      value: stats.widgets,
      fill: "var(--chart-6)",
    },
    {
      name: "Click Tracking",
      value: stats.links,
      fill: "var(--chart-7)",
    },
  ];

  const chartConfig = {
    value: {
      label: "Trackers",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const total = getTotalTrackers(stats);

  const shouldShowAlert = !stats.hasData || stats.isStale;

  return (
    <div className="pb-10 pt-4">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Embedded Tracking Overview</h2>
        {!shouldShowAlert && (
          <p className="text-sm text-muted-foreground">
            Total number of embedded trackers detected: {total}
          </p>
        )}
        {stats.age && !stats.isStale && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {Math.floor(stats.age / 1000)}s ago
          </p>
        )}
      </div>

      {shouldShowAlert && (
        <ChartAlert
          hasData={stats.hasData}
          isStale={stats.isStale}
          age={stats.age}
          isRefreshing={isRefreshing}
          onRefresh={setIsRefreshing}
        />
      )}
      {stats.hasData && (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <Bar dataKey="value" radius={8} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
