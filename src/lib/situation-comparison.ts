import { SITUATION_COMPARISON_MAP, WEIGHT_JUDGMENT_META, getSituationOption, type Situation } from "@/data/weight";
import { getJudgment } from "@/lib/weight-judgment";
import type { WeightSituationComparison } from "@/lib/weight-types";

export function getSituationComparison(weight: number, currentSituation: Situation): WeightSituationComparison[] {
  const targets = SITUATION_COMPARISON_MAP[currentSituation] ?? [];

  return targets.map((target) => {
    const judgment = getJudgment(weight, target);
    const option = getSituationOption(target);

    return {
      situation: target,
      label: option.label,
      judgment,
      judgmentLabel: WEIGHT_JUDGMENT_META[judgment].label,
    };
  });
}
