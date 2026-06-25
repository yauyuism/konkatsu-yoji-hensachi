"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

export type FatigueRadarDatum = {
  label: string;
  score: number;
};

type FatigueReasonRadarChartProps = {
  data: FatigueRadarDatum[];
  height?: number;
};

export function FatigueReasonRadarChart({ data, height = 300 }: FatigueReasonRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="rgba(63,52,46,0.14)" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <PolarAngleAxis dataKey="label" tick={{ fill: "#6B625D", fontSize: 12, fontWeight: 800 }} />
        <Radar
          name="score"
          dataKey="score"
          stroke="#C98278"
          fill="#C98278"
          fillOpacity={0.2}
          strokeWidth={3}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
