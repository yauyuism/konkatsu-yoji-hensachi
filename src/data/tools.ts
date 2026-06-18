import { getSpecOptionCountForGender } from "@/data/spec-options";

export type ToolCategory = "question" | "paste" | "number";

export type ToolId = "deaiFit" | "prof" | "weight" | "check" | "my9specs" | "conditions" | "market" | "hensachi" | "type";

export type ToolStatus = "live" | "coming_soon";

export interface Tool {
  id: ToolId;
  path: string;
  name: string;
  catch: string;
  description: string;
  homeName?: string;
  homeCatch?: string;
  homeDescription?: string;
  tags: string[];
  category: ToolCategory;
  cta: string;
  isNew: boolean;
  newUntil?: string;
  order: number;
  status: ToolStatus;
}

export const CATEGORY_ORDER: ToolCategory[] = ["question", "paste", "number"];

const MY9_SPECS_OPTION_COUNT = getSpecOptionCountForGender("male");

export const CATEGORIES = {
  paste: {
    label: "貼って分析",
    description: "スクショを貼ると、数字で現実が返ってくるツール",
  },
  number: {
    label: "数字で確認",
    description: "数字を入れると、信じたくない事実が統計で返ってくるツール",
  },
  question: {
    label: "質問で診断",
    description: "質問に答えるだけで、恋愛や婚活の癖を言語化するツール",
  },
} as const satisfies Record<ToolCategory, { label: string; description: string }>;

export const TOOLS: Tool[] = [
  {
    id: "deaiFit",
    path: "/diagnoses/deai-fit",
    name: "自分に合う出会い方診断",
    catch: "普通の婚活に、自分を合わせなくていい",
    description: "マッチングアプリ、結婚相談所、紹介、SNS、外飲み、趣味の場。あなたの恋愛スタイルに合う出会い方を診断します。",
    homeCatch: "あなたに合う出会い方、どこにある？",
    homeDescription: "条件検索、関係性、生活圏、価値観発信、併用設計の5タイプから、自分に合う会い方を整理します。",
    tags: ["約2分", "10問", "アイカタ監修"],
    category: "question",
    cta: "診断する →",
    isNew: true,
    newUntil: "2026-12-31",
    order: 0,
    status: "live",
  },
  {
    id: "prof",
    path: "/prof",
    name: "プロフ偏差値",
    catch: "異性からどう見えてるか、点数で出る",
    description: "プロフ文を貼るだけ。5つの観点で偏差値と改善案が出ます",
    homeName: "プロフィール偏差値診断",
    homeCatch: "あなたのプロフ、異性からは何点に見えてる？",
    homeDescription: "プロフ文を貼るだけ。5つの観点で偏差値が出ます。自信作ほど点が低い傾向があります。",
    tags: ["約2分"],
    category: "paste",
    cta: "やってみる →",
    isNew: false,
    order: 1,
    status: "live",
  },
  {
    id: "weight",
    path: "/weight",
    name: "LINEの重さ測定",
    catch: "あなたのLINE、どれくらい重い？",
    description: "スクショを貼るだけ。メッセージの重さがkgで出ます",
    homeCatch: "あなたのLINE、相手にとって何kgですか？",
    homeDescription: "やりとりを貼るだけ。「重い」を重量で数値化します。3kg超えたら黄色信号です。",
    tags: ["約1分"],
    category: "paste",
    cta: "やってみる →",
    isNew: false,
    order: 2,
    status: "live",
  },
  {
    id: "check",
    path: "/check",
    name: "この人、大丈夫？",
    catch: "相手の地雷度と脈アリ度をまとめて判定",
    description: "相手のプロフやスクショを貼るだけで分かります",
    homeCatch: "その人、大丈夫じゃないかもしれません。",
    homeDescription: "相手のプロフやスクショを貼るだけ。地雷度と脈アリ度を同時に判定します。",
    tags: ["約1分"],
    category: "paste",
    cta: "チェックする →",
    isNew: true,
    newUntil: "2026-05-01",
    order: 3,
    status: "live",
  },
  {
    id: "my9specs",
    path: "/my9specs",
    name: "My 9 Specs",
    catch: "9つ選ぶと、理想のタイプが1枚の画像になります",
    description: `${MY9_SPECS_OPTION_COUNT}個の条件から9つ選ぶと、その条件を満たす人数も出ます`,
    homeCatch: "あなたの「譲れない9条件」、1枚の画像にします。",
    homeDescription: `${MY9_SPECS_OPTION_COUNT}個から9つ選ぶだけ。その条件を全部満たす人が日本に何人いるかも出ます。0人って出ても泣かないでください。`,
    tags: ["約2分"],
    category: "number",
    cta: "やってみる →",
    isNew: true,
    newUntil: "2026-05-01",
    order: 1,
    status: "live",
  },
  {
    id: "conditions",
    path: "/conditions",
    name: "理想の高さチェッカー",
    catch: 'あなたが考える"普通"の異性が、日本に何人いる？',
    description: "相手の条件をスライダーで入れるだけ。人数がリアルタイムで出ます",
    homeCatch: "あなたの言う「普通の人でいい」の\"普通\"、日本に何人いるか知ってますか？",
    homeDescription: "スライダーで条件を動かすたびに、人数がリアルタイムで減っていきます。",
    tags: ["約1分"],
    category: "number",
    cta: "やってみる →",
    isNew: false,
    order: 2,
    status: "live",
  },
  {
    id: "market",
    path: "/market",
    name: "スペック年収換算",
    catch: "自分のレア度を年収に例えると？",
    description: "年齢・年収・身長・学歴・エリア・婚姻歴・喫煙の7項目から、婚活市場での通りやすさを年収に換算します。",
    homeCatch: "あなたのスペック、年収に換算するといくら？",
    homeDescription: "年齢・年収・身長・学歴・エリア・婚姻歴・喫煙の7項目から、婚活市場での通りやすさを年収に換算します。",
    tags: ["約30秒"],
    category: "number",
    cta: "やってみる →",
    isNew: false,
    order: 3,
    status: "live",
  },
  {
    id: "hensachi",
    path: "/hensachi",
    name: "マチアプMBTI",
    catch: "アプリの使い方を4軸16タイプで見る",
    description: "20問の4択に答えるだけ。約3〜4分で結果が出ます",
    homeCatch: "あなたのアプリの使い方、何タイプ？",
    homeDescription: "20問・約3〜4分。中立をなくした4択で、メッセージの熱量、相手の見方、判断の癖、進め方の違いを4軸16タイプで整理します。",
    tags: ["約3〜4分"],
    category: "question",
    cta: "やってみる →",
    isNew: false,
    order: 1,
    status: "live",
  },
  {
    id: "type",
    path: "/type",
    name: "マチアプMBTI",
    catch: "アプリの使い方を4軸16タイプで見る",
    description: "20問の4択に答えるだけ。自分のアプリの癖をタイプで整理できます",
    homeCatch: "あなたのアプリの使い方、何タイプ？",
    homeDescription: "20問・約3〜4分。中立をなくした4択で、メッセージの熱量、相手の見方、判断の癖、進め方の違いを4軸16タイプで整理します。",
    tags: ["約3〜4分"],
    category: "question",
    cta: "やってみる →",
    isNew: true,
    newUntil: "2026-04-30",
    order: 2,
    status: "coming_soon",
  },
];

export const FEATURED_TOOL_ID: ToolId = "deaiFit";

export type HomeAnnouncement = {
  id: string;
  text: string;
  url: string;
  expiresAt: string;
};

export const HOME_ANNOUNCEMENTS: HomeAnnouncement[] = [
  {
    id: "deai-fit",
    text: "自分に合う出会い方診断を公開しました",
    url: "/diagnoses/deai-fit",
    expiresAt: "2026-12-31",
  },
  {
    id: "person-check",
    text: "この人、大丈夫？を公開しました",
    url: "/check",
    expiresAt: "2026-05-01",
  },
  {
    id: "my9specs",
    text: "My 9 Specs を公開しました",
    url: "/my9specs",
    expiresAt: "2026-05-01",
  },
  {
    id: "line-weight",
    text: "LINEの重さ測定を公開しました",
    url: "/weight",
    expiresAt: "2026-04-15",
  },
];

export type ProblemGuide = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  steps: Array<{
    toolId: ToolId;
    label: string;
  }>;
  note?: string;
};

export const PROBLEMS: ProblemGuide[] = [
  {
    id: "person-check",
    emoji: "🤔",
    title: "「この人、大丈夫？」と思ったら",
    description: "相手のプロフとやりとりをまとめて判定。",
    steps: [
      { toolId: "check", label: "相手をチェックする" },
      { toolId: "prof", label: "自分のプロフも確認する" },
    ],
  },
  {
    id: "no-progress",
    emoji: "😥",
    title: "「スペックは悪くないのに進まない」人",
    description: "スペックが問題じゃないなら、プロフか会話に原因がある。",
    steps: [
      { toolId: "market", label: "スペック年収換算で確認" },
      { toolId: "prof", label: "プロフ偏差値で改善点を見つける" },
      { toolId: "weight", label: "LINEの重さ測定で会話を見直す" },
    ],
  },
  {
    id: "conditions-too-high",
    emoji: "🤷",
    title: "「条件が高すぎるか分からない」人",
    description: "統計データで実際の人数を見ると判断しやすくなる。",
    steps: [
      { toolId: "my9specs", label: "まず譲れない条件を9つ選ぶ" },
      { toolId: "conditions", label: "理想の高さチェッカーで人数を確認" },
      { toolId: "market", label: "スペック年収換算で自分側も確認" },
    ],
  },
  {
    id: "no-confidence",
    emoji: "😰",
    title: "「アプリの使い方が合ってるか不安」な人",
    description: "4軸16タイプで、使い方の癖を客観的に把握できる。",
    steps: [
      { toolId: "hensachi", label: "マチアプMBTIで使い方の癖を知る" },
      { toolId: "prof", label: "プロフ偏差値で入口を整える" },
    ],
  },
];

export const GUIDES = PROBLEMS;

function getTodayInTokyo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isWithinDisplayWindow(expiresAt?: string, today = getTodayInTokyo()) {
  if (!expiresAt) {
    return true;
  }

  return expiresAt >= today;
}

export function isToolNew(tool: Tool, today?: string) {
  if (!tool.isNew) {
    return false;
  }

  return isWithinDisplayWindow(tool.newUntil, today);
}

export function getToolById(toolId: ToolId) {
  return TOOLS.find((tool) => tool.id === toolId);
}

export function getToolHomeName(tool: Tool) {
  return tool.homeName ?? tool.name;
}

export function getToolHomeCatch(tool: Tool) {
  return tool.homeCatch ?? tool.catch;
}

export function getToolHomeDescription(tool: Tool) {
  return tool.homeDescription ?? tool.description;
}

export function getLiveTools() {
  return TOOLS.filter((tool) => tool.status === "live").sort((left, right) => {
    const categoryOrderDiff = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);

    if (categoryOrderDiff !== 0) {
      return categoryOrderDiff;
    }

    return left.order - right.order;
  });
}

export function getLiveToolsByCategory(category: ToolCategory) {
  return getLiveTools()
    .filter((tool) => tool.category === category)
    .sort((left, right) => left.order - right.order);
}

export function getFeaturedTool() {
  return getToolById(FEATURED_TOOL_ID);
}

export function getActiveAnnouncements(today?: string) {
  return HOME_ANNOUNCEMENTS.filter((announcement) => isWithinDisplayWindow(announcement.expiresAt, today));
}

export function getVisibleGuides() {
  const liveToolIds = new Set(getLiveTools().map((tool) => tool.id));

  return PROBLEMS.filter((problem) => problem.steps.every((step) => liveToolIds.has(step.toolId)));
}
