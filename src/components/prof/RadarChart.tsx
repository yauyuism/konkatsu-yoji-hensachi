"use client";

import dynamic from "next/dynamic";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer } from "recharts";

import { profAxisLabels, profAxisOrder, type ScoreSet } from "@/lib/prof";

type RadarChartProps = {
  scores: ScoreSet;
};

function RadarChartInner({ scores }: RadarChartProps) {
  const data = profAxisOrder.map((key) => ({
    subject: profAxisLabels[key],
    score: scores[key],
    fullMark: 100,
  }));

  return (
    <div className="h-[360px] w-full sm:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="76%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6B7280", fontSize: 14, fontWeight: 700 }}
          />
          <Radar
            name="score"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.16}
            strokeWidth={3}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const ClientOnlyRadarChart = dynamic(() => Promise.resolve(RadarChartInner), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-[1.5rem] bg-[rgba(59,130,246,0.06)] sm:h-[420px]" />,
});

export function RadarChart(props: RadarChartProps) {
  return <ClientOnlyRadarChart {...props} />;
}
