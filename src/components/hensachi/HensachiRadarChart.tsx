"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

import type { HensachiAxisInfo } from "@/lib/hensachi";

type HensachiRadarChartProps = {
  axes: HensachiAxisInfo[];
};

export function HensachiRadarChart({ axes }: HensachiRadarChartProps) {
  const data = axes.map((axis) => ({
    axis: axis.label,
    value: axis.hensachi,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarRadiusAxis domain={[25, 80]} tick={false} axisLine={false} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 13, fill: "#6B7280" }} />
        <Radar
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.15}
          strokeWidth={2}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
