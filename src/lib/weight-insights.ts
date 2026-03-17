import type { WeightFactorKey, WeightJudgment } from "@/data/weight";
import { getSortedFactors } from "@/lib/weight-calculator";
import type { WeightBreakdown, WeightReplyExample, WeightResult } from "@/lib/weight-types";

const FACTOR_LABELS: Record<WeightFactorKey, string> = {
  textRatio: "文量バランス",
  questionDensity: "質問密度",
  emojiGap: "絵文字温度差",
  topicInitRate: "話題起点率",
  lengthVariance: "メッセージ長SD",
};

type CompactBreakdownItem = {
  key: string;
  name: string;
  weight: number;
  color: string;
};

type WeightNarrative = {
  explanation: string;
  improvement: string;
  example: WeightReplyExample | null;
};

function formatQuestionRate(value: number) {
  return `${Math.round(value * 100)}%`;
}

function buildHeavyExplanation(result: WeightResult) {
  const factors = getSortedFactors(result.breakdown).filter((factor) => factor.weight >= 0.1);
  const fragments: string[] = [];

  for (const factor of factors.slice(0, 2)) {
    switch (factor.key) {
      case "questionDensity":
        fragments.push(`質問が入る頻度が高く、${formatQuestionRate(result.breakdown.questionDensity.value)}のメッセージで相手にボールを投げています。`);
        break;
      case "emojiGap":
        fragments.push(`絵文字が相手より1通あたり${result.breakdown.emojiGap.value.toFixed(1)}個多く、テンション差が見えやすい状態です。`);
        break;
      case "textRatio":
        fragments.push(`文量は相手の${result.breakdown.textRatio.value.toFixed(1)}倍で、情報量の差がそのまま重さになっています。`);
        break;
      case "topicInitRate":
        fragments.push(`新しい話題の${Math.round(result.breakdown.topicInitRate.value * 100)}%を自分から出していて、会話を引っ張り続けています。`);
        break;
      case "lengthVariance":
        fragments.push(`短文と長文の差が大きく、急に熱量が上がったように見えやすいです。`);
        break;
      default:
        break;
    }
  }

  if (fragments.length === 0) {
    fragments.push("返し方の温度差が積み重なって、相手からは少し圧のある会話に見えやすい状態です。");
  }

  return fragments.join("").slice(0, 250);
}

function buildBalancedExplanation(result: WeightResult) {
  const diffText = Math.abs(result.weightDiff) < 0.3
    ? "相手との温度差も小さめです。"
    : result.weightDiff > 0
      ? "少しあなたの熱量が高いものの、まだ自然な範囲に収まっています。"
      : "相手のほうが少し前のめりですが、会話としては無理がありません。";

  return `文量・質問・絵文字のバランスが大きく崩れておらず、この関係ではちょうどいい重さです。${diffText}今のペースを崩さなければ、会話の空気感は保ちやすいです。`.slice(0, 250);
}

function buildLightExplanation(result: WeightResult) {
  const fragments: string[] = [];

  if (result.breakdown.textRatio.value < 1) {
    fragments.push(`文量は相手の${result.breakdown.textRatio.value.toFixed(1)}倍で控えめです。`);
  }
  if (result.breakdown.questionDensity.value < 0.15) {
    fragments.push("質問が少なく、会話を広げるボールが相手任せになっています。");
  }
  if (result.weightDiff < -0.8) {
    fragments.push(`相手のほうが${Math.abs(result.weightDiff).toFixed(1)}kg重く、会話を回してくれている状態です。`);
  }

  if (fragments.length === 0) {
    fragments.push("反応がかなりあっさりして見えやすく、相手からは温度が読み取りづらい状態です。");
  }

  return fragments.join("").slice(0, 250);
}

function buildHeavyImprovement(result: WeightResult) {
  switch (result.topFactor.key) {
    case "questionDensity":
      return "質問は2通に1回くらいまで減らして、その間に自分の情報をひとつ挟んでみてください。聞く→話すの往復にすると、面接のような圧が消えて会話のテンポが自然になります。";
    case "emojiGap":
      return "絵文字は相手と同じ数か、ひとつ少ないくらいに揃えてみてください。文章の内容を変えなくても、温度差だけで受け取られ方はかなり落ち着きます。";
    case "textRatio":
      return "相手の文量を超えないくらいで止めて、1通を2文前後に収めてみてください。情報を足すより、返しやすい余白を残したほうが会話の圧は下がります。";
    case "topicInitRate":
      return "新しい話題を足す前に、相手が返してくれた話をもう1ターンだけ広げてみてください。自分から話題を出す回数を半分にするだけで、追い立てる感じが薄まります。";
    case "lengthVariance":
      return "急に長文を送る前に、一度2文まで削ってみてください。毎回の長さを近づけるだけで、本気度の振れ幅が落ち着いて読みやすくなります。";
    default:
      return "ひとつの返しに情報を詰め込みすぎず、相手が返しやすい余白を残してみてください。温度を半歩だけ引くと、全体の印象がかなり自然になります。";
  }
}

function buildLightImprovement(result: WeightResult) {
  if (result.breakdown.questionDensity.value < 0.15) {
    return "相手の話に返したあと、一言だけ自分の情報か質問を足してみてください。「そうなんだ」で終わらず、もう半歩だけ広げると会話のキャッチボールが生まれます。";
  }

  return "短い相づちで終わらせず、相手の話題に乗りながら自分のことを一言だけ足してみてください。返信の長さを少し合わせるだけでも、興味のある印象に変わります。";
}

function buildBalancedImprovement() {
  return "今のペースをそのまま維持して、急に質問量や文量だけを増やさないようにしてみてください。バランスが取れている会話は、少し崩すだけでも重さが跳ねやすいです。";
}

function buildHeavyExample(topKey: WeightFactorKey): WeightReplyExample {
  switch (topKey) {
    case "questionDensity":
      return {
        before: "何のお仕事されてるんですか？😊",
        after: "自分はWeb系の仕事してるんですけど、〇〇さんはどんなお仕事ですか？",
        reason: "質問の前に自分の情報を置くと、面接感が消える。",
      };
    case "emojiGap":
      return {
        before: "おつかれさまです〜！😊✨今日は何してました？",
        after: "おつかれさまです。今日は何してました？",
        reason: "絵文字を相手に寄せるだけで温度差が縮まる。",
      };
    case "textRatio":
      return {
        before: "今日は仕事がバタバタで…そのあと友達と会って…すごく疲れました笑",
        after: "今日は仕事が立て込んでました。今やっと落ち着いたところです。",
        reason: "1通を短くすると、返しやすい余白が残る。",
      };
    case "topicInitRate":
      return {
        before: "そういえば旅行好きですか？あとカフェとかも行きます？",
        after: "その映画いいですね。どのシーンが一番印象に残りました？",
        reason: "今の話題を1ターン広げると追い立て感が出ない。",
      };
    case "lengthVariance":
      return {
        before: "急に長文ごめんなんだけど、今日話しててすごく楽しくて…",
        after: "今日話せて楽しかったです。また続き聞かせてください。",
        reason: "長さをそろえると、本気度の急上昇が和らぐ。",
      };
    default:
      return {
        before: "休みの日って何してるんですか？😊",
        after: "自分は最近カフェ巡りしてます。休みの日は何してることが多いですか？",
        reason: "自分の話を先に置くと、質問が会話になる。",
      };
  }
}

function buildLightExample(): WeightReplyExample {
  return {
    before: "そうなんだ",
    after: "そうなんだ！自分も最近それ気になってました",
    reason: "短い相づちに一言足すだけで会話が続く。",
  };
}

function buildBalancedExample(): WeightReplyExample {
  return {
    before: "それいいですね",
    after: "それいいですね。自分も今度やってみたいです",
    reason: "今の自然さを保ちながら、温度を少しだけ返せる。",
  };
}

export function shouldShowImprovement(judgment: WeightJudgment) {
  return judgment === "heavy" || judgment === "very_heavy" || judgment === "light";
}

export function getCompactBreakdownItems(breakdown: WeightBreakdown): CompactBreakdownItem[] {
  const factors = getSortedFactors(breakdown)
    .filter((factor) => factor.weight >= 0.1)
    .map((factor) => ({
      key: factor.key,
      name: FACTOR_LABELS[factor.key],
      weight: factor.weight,
      color: "#3B82F6",
    }));

  return [
    ...factors,
    {
      key: "baseWeight",
      name: "基礎重量",
      weight: breakdown.baseWeight.weight,
      color: "#D1D5DB",
    },
  ];
}

export function buildWeightNarrative(
  result: WeightResult,
  overrides?: Partial<WeightNarrative> | null
): WeightNarrative {
  const fallback: WeightNarrative = {
    explanation:
      result.judgment === "balanced"
        ? buildBalancedExplanation(result)
        : result.judgment === "light"
          ? buildLightExplanation(result)
          : buildHeavyExplanation(result),
    improvement:
      result.judgment === "balanced"
        ? buildBalancedImprovement()
        : result.judgment === "light"
          ? buildLightImprovement(result)
          : buildHeavyImprovement(result),
    example:
      result.judgment === "balanced"
        ? buildBalancedExample()
        : result.judgment === "light"
          ? buildLightExample()
          : buildHeavyExample(result.topFactor.key),
  };

  return {
    explanation: overrides?.explanation?.trim() ? overrides.explanation.trim() : fallback.explanation,
    improvement: overrides?.improvement?.trim() ? overrides.improvement.trim() : fallback.improvement,
    example: overrides?.example ?? fallback.example,
  };
}
