import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";
import {Bar, BarChart, XAxis, YAxis} from "recharts";
import {useTrackingStats} from "@/hooks/use-tracking-stats";

export function TrackingChart() {
  const stats = useTrackingStats();

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
  ];

  const chartConfig = {
    value: {
      label: "Trackers",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const total = Object.values(stats).reduce(
    (sum, val) => sum + (typeof val === "number" ? val : 0),
    0
  );

  return (
    <div className="pb-10 pt-4">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Tracking Detection Overview</h2>
        <p className="text-sm text-muted-foreground">
          Total trackers detected: {total}
        </p>
      </div>
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
    </div>
  );
}
