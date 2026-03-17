"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { OPTIMAL_ZONES, WEIGHT_JUDGMENT_META, type Situation, type WeightJudgment } from "@/data/weight";

type WeightComparisonProps = {
  situation: Situation;
  totalWeight: number;
  partnerWeight: number;
  judgment: WeightJudgment;
};

export function WeightComparison({ situation, totalWeight, partnerWeight, judgment }: WeightComparisonProps) {
  const zone = OPTIMAL_ZONES[situation];
  const data = [
    { name: "あなた", weight: totalWeight, color: "#3B82F6" },
    { name: "相手", weight: partnerWeight, color: "#6B7280" },
  ];
  const chartMax = Math.max(zone.veryHeavyThreshold + 0.6, totalWeight + 0.6, partnerWeight + 0.6);
  const diff = totalWeight - partnerWeight;
  const diffLabel = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <h2 className="text-2xl font-black text-[var(--text-main)]">2人の重量比較</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
        緑の帯は、この関係での適正ゾーン。そこからどれだけ離れているかを見ます。
      </p>

      <div className="mt-5 h-[260px] w-full rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 18, left: 8, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(26,26,26,0.08)" />
            <XAxis
              type="number"
              domain={[0, chartMax]}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}kg`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={56}
              tick={{ fill: "#1A1A1A", fontSize: 13, fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceArea x1={zone.min} x2={zone.max} fill="rgba(16,185,129,0.12)" />
            <Bar dataKey="weight" radius={[999, 999, 999, 999]} barSize={28}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.2rem] bg-[rgba(248,247,244,0.9)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">あなた</p>
          <p className="font-numeric mt-2 text-2xl font-black text-[var(--text-main)]">{totalWeight.toFixed(1)}kg</p>
        </div>
        <div className="rounded-[1.2rem] bg-[rgba(248,247,244,0.9)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">相手</p>
          <p className="font-numeric mt-2 text-2xl font-black text-[var(--text-main)]">{partnerWeight.toFixed(1)}kg</p>
        </div>
        <div className="rounded-[1.2rem] bg-[rgba(16,185,129,0.08)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[#047857]">重量差</p>
          <p className="font-numeric mt-2 text-2xl font-black text-[#047857]">{diffLabel}kg</p>
        </div>
      </div>
    </section>
  );
}
