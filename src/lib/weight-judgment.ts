import { OPTIMAL_ZONES, type Situation, type WeightJudgment } from "@/data/weight";

export function getJudgment(weight: number, situation: Situation): WeightJudgment {
  const zone = OPTIMAL_ZONES[situation];

  if (weight < zone.min) {
    return "light";
  }
  if (weight <= zone.max) {
    return "balanced";
  }
  if (weight <= zone.veryHeavyThreshold) {
    return "heavy";
  }

  return "very_heavy";
}
