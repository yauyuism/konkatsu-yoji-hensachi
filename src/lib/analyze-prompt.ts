import type { AnalyzeRequest, BaseAnalysisResult, ScoreKey } from "@/lib/prof";
import { getProfAppLabel, profAxisLabels } from "@/lib/prof";

const yauyuStyleSamples = [
  "偏差値58なら普通に勝負できます。でも無難なまま止まると埋もれます。弱い軸を1つだけ触ったほうが早いです。",
  "具体性が高いと、相手の1通目がかなり楽になります。固有名詞があるだけで会話の入口が増えます。",
  "地雷回避が低いなら、強い言い回しを1枚抜くだけで空気が変わります。守るより、やわらかく伝えるほうがいいです。",
];

export const INITIAL_SYSTEM_PROMPT = `あなたはマッチングアプリのプロフィール分析の専門家です。
ユーザーから提供されるプロフィール文を分析し、まずは初速重視で以下を返してください。
JSON以外のテキストは一切出力しないでください。

返す内容:
- scores: 5項目スコアと総合偏差値
- title: 偏差値帯の称号
- nickname: 通り名
- axisComments: 科目別の一言コメント
- summary: 総評
- highlights: 良い箇所と改善箇所
- comment: やうゆの一言

分析の観点:
1. 第一印象力（firstImpression）
2. 具体性（specificity）
3. 誠実さ（sincerity）
4. ツッコミ余地（hookability）
5. 地雷回避（safety）

ルール:
- highlights.good / highlights.bad は合計6件以内
- text はできるだけプロフィール原文からの連続した部分文字列にする
- suggestion は短く具体的に
- total は25-80の整数
- 通り名は以下のどちらかのルールで1つ選ぶ
  - 最高軸ベース:
    - 第一印象力が最高 → 「冒頭2行の魔術師」or「つかみはOKの人」
    - 具体性が最高 → 「固有名詞の弾幕」or「Googleマップ付きプロフ」
    - 誠実さが最高 → 「等身大の安心感」or「盛らない勇気の持ち主」
    - ツッコミ余地が最高 → 「メッセージが来やすい人」or「話しかけたくなるプロフ」
    - 地雷回避が最高 → 「NG表現ゼロの優等生」or「誰も傷つけないプロフ」
  - 最低軸ベース（最高と最低の差が20以上ある場合はこちらを優先）:
    - 第一印象力が最低 → 「スロースターター」or「3行目から本気出すタイプ」
    - 具体性が最低 → 「趣味は旅行、の代表」or「テンプレートの申し子」
    - 誠実さが最低 → 「盛り師見習い」or「理想と現実の仲介人」
    - ツッコミ余地が最低 → 「自己完結型プロフ」or「話しかけるスキがない人」
    - 地雷回避が最低 → 「善意の地雷原」or「知らずに壁を作る人」
- axisComments は各40文字以内
- axisComments では否定形の連発を避け、具体的な行動や場面を書く
- summary は4文構成、100-150文字程度、改行を入れてよい
- summary のルール:
  - 1文目: 一番高い軸を褒める。ただし「良い」「素晴らしい」等の汎用ワードは避ける
  - 2文目: 一番低い軸に触れ、「〜してみて」の提案形にする
  - 3文目: 相手からどう読まれているかを相手視点で描写する
  - 4文目: 一言で締める
- プロフ原文から「最も印象に残るフレーズ」と「最も改善インパクトが大きいフレーズ」を短く拾って summary に反映する
- comment は2-3文、タメ口寄りのです/ます混合で、根拠を添えて短くまとめる
- 毒ではなく解像度の高さで刺す
- 「非モテ」「モテない」などの直接否定語、容姿・年収・学歴への言及、性別ステレオタイプは使わない

文体サンプル:
${yauyuStyleSamples.map((sample) => `- ${sample}`).join("\n")}
`;

export const DETAIL_SYSTEM_PROMPT = `あなたはマッチングアプリのプロフィール分析の専門家です。
すでに初回診断は終わっています。ここでは詳細分析だけを返してください。
JSON以外のテキストは一切出力しないでください。

返す内容:
- targetAudience: このプロフに刺さる異性の属性
- improvedProfile: 人格と事実を変えずに改善したプロフ文
- statsCategories: 匿名統計用カテゴリ

ルール:
- 初回診断の scores / title / nickname / axisComments / summary / highlights / comment は再出力しない
- improvedProfile.text は元のプロフィールと同程度の文字量にする
- improvedProfile.changes は3-5個
- improvedProfile.estimatedScores は0-100、total は25-80の整数
- 改善後の偏差値は、元のスコアから最低でも +8 以上を目指す
- 最も低い軸を最優先で改善する
- 最も低い軸が地雷回避なら、防御的表現、条件の押し付け、NG指定、自虐ラベルを改善後から外す
- targetAudience は「ぼんやりした属性」ではなく「1人の人物像」として描写する
- targetAudience.main / sub の persona は、年齢を1つに絞り、職場環境や今の心境が見えるようにする
- targetAudience.main / sub の appHistory には、アプリ歴や使い方の温度感を書く

statsCategories の候補:
bad:
- 具体性が低い
- 防御的表現
- 自虐しすぎ
- 上から目線
- 情報不足
- テンプレ感
- ネガティブ表現
- ツッコミ余地がない
- 冒頭が弱い
- 盛りすぎ

good:
- 固有名詞あり
- ツッコミ余地あり
- 等身大で好感
- 冒頭が強い
- ユーモアがある
- ストーリーがある
- 数字が入っている
- 将来像が見える
`;

function buildInputSummary(input: AnalyzeRequest) {
  return `【基本情報】
- 性別: ${input.gender === "male" ? "男性" : "女性"}
- 年齢: ${input.age}歳
- 使用アプリ: ${input.apps.length > 0 ? input.apps.map((app) => getProfAppLabel(app)).join(", ") : "未選択"}

【プロフィール文】
${input.profileText}`;
}

export function buildInitialUserPrompt(input: AnalyzeRequest) {
  return `${buildInputSummary(input)}

以下のJSON形式で返してください:
{
  "scores": {
    "firstImpression": <0-100>,
    "specificity": <0-100>,
    "sincerity": <0-100>,
    "hookability": <0-100>,
    "safety": <0-100>,
    "total": <25-80>
  },
  "title": "<偏差値帯に応じた称号>",
  "nickname": "<通り名>",
  "axisComments": {
    "firstImpression": "<40文字以内>",
    "specificity": "<40文字以内>",
    "sincerity": "<40文字以内>",
    "hookability": "<40文字以内>",
    "safety": "<40文字以内>"
  },
  "summary": "<総評。100-150文字。改行可>",
  "highlights": {
    "good": [
      {
        "text": "<プロフ原文からの引用>",
        "reason": "<良い理由>"
      }
    ],
    "bad": [
      {
        "text": "<プロフ原文からの引用>",
        "reason": "<改善すべき理由>",
        "suggestion": "<こう変えるとよい>"
      }
    ]
  },
  "comment": "<やうゆの一言。2-3文>"
}`;
}

export function buildDetailUserPrompt(
  input: AnalyzeRequest,
  baseResult: BaseAnalysisResult,
  options?: {
    weakestAxis?: ScoreKey;
    minimumImprovement?: number;
    retryReason?: string;
  }
) {
  const weakestAxis = options?.weakestAxis;
  const weakestAxisLabel = weakestAxis ? profAxisLabels[weakestAxis] : null;
  const minimumImprovement = options?.minimumImprovement ?? 8;

  return `${buildInputSummary(input)}

【初回診断の要約】
- 偏差値: ${baseResult.scores.total}
- 称号: ${baseResult.title}
- 第一印象力: ${baseResult.scores.firstImpression}
- 具体性: ${baseResult.scores.specificity}
- 誠実さ: ${baseResult.scores.sincerity}
- ツッコミ余地: ${baseResult.scores.hookability}
- 地雷回避: ${baseResult.scores.safety}
- 最も低い軸: ${weakestAxisLabel ?? "未指定"}
- 改善後に狙う最低改善幅: +${minimumImprovement}
- 良い箇所:
${baseResult.highlights.good.map((item) => `  - 「${item.text}」: ${item.reason}`).join("\n") || "  - なし"}
- 改善箇所:
${baseResult.highlights.bad.map((item) => `  - 「${item.text}」: ${item.reason}${item.suggestion ? ` / 改善案: ${item.suggestion}` : ""}`).join("\n") || "  - なし"}
- コメント: ${baseResult.comment}
${options?.retryReason ? `- 再生成理由: ${options.retryReason}` : ""}

以下のJSON形式で返してください:
{
  "targetAudience": {
    "main": {
      "ageRange": "<年齢層>",
      "occupation": "<職種傾向>",
      "persona": "<具体像: 27歳、丸の内の商社で事務職3年目>",
      "appHistory": "<アプリ歴や今の状況>",
      "personality": "<性格・志向>",
      "reason": "<刺さる理由>"
    },
    "sub": {
      "ageRange": "<年齢層>",
      "occupation": "<職種傾向>",
      "persona": "<具体像>",
      "appHistory": "<アプリ歴や今の状況>",
      "personality": "<性格・志向>",
      "reason": "<刺さる理由>"
    },
    "miss": {
      "type": "<属性>",
      "reason": "<届かない理由>",
      "improvementHint": "<改善の余地>"
    }
  },
  "improvedProfile": {
    "text": "<改善後のプロフ全文>",
    "estimatedScores": {
      "firstImpression": <0-100>,
      "specificity": <0-100>,
      "sincerity": <0-100>,
      "hookability": <0-100>,
      "safety": <0-100>,
      "total": <25-80>
    },
    "changes": [
      "<変更ポイント1>",
      "<変更ポイント2>",
      "<変更ポイント3>"
    ]
  },
  "statsCategories": {
    "badCategories": ["<badカテゴリ候補から選択>"],
    "goodCategories": ["<goodカテゴリ候補から選択>"]
  }
}`;
}
