export type ToolCategory = "measure" | "research" | "discover";

export type ToolId = "prof" | "weight" | "my9specs" | "conditions" | "market" | "hensachi" | "type";

export type ToolStatus = "live" | "coming_soon";

export interface Tool {
  id: ToolId;
  path: string;
  label: string;
  name: string;
  description: string;
  promoDescription: string;
  tags: string[];
  category: ToolCategory;
  isNew: boolean;
  newUntil?: string;
  order: number;
  status: ToolStatus;
}

export const CATEGORY_ORDER: ToolCategory[] = ["measure", "research", "discover"];

export const CATEGORIES = {
  measure: {
    label: "測る",
    description: "実際のデータを貼って分析するツール",
  },
  research: {
    label: "調べる",
    description: "数字を入力して、統計データから事実を算出するツール",
  },
  discover: {
    label: "知る",
    description: "質問に答えて、自分のタイプや傾向を知るツール",
  },
} as const satisfies Record<ToolCategory, { label: string; description: string }>;

export const TOOLS: Tool[] = [
  {
    id: "prof",
    path: "/prof",
    label: "PROFILE CHECK",
    name: "プロフィール偏差値診断",
    description: "プロフ文を貼ってAIが5軸で採点",
    promoDescription: "プロフィール文を貼るだけで、偏差値と改善ポイントを返します。",
    tags: ["本文貼り付け", "約2分", "AI分析"],
    category: "measure",
    isNew: false,
    order: 1,
    status: "live",
  },
  {
    id: "weight",
    path: "/weight",
    label: "MESSAGE WEIGHT",
    name: "LINEメッセージ重量測定",
    description: "やりとりを貼ってメッセージの重さをkg測定",
    promoDescription: "実際のやりとりを貼るだけで、会話の重さをkg単位で可視化します。",
    tags: ["テキスト貼り付け", "約1分", "重量測定"],
    category: "measure",
    isNew: true,
    newUntil: "2026-04-15",
    order: 2,
    status: "live",
  },
  {
    id: "my9specs",
    path: "/my9specs",
    label: "MY 9 SPECS",
    name: "私が譲れない9つの条件",
    description: "60個から9つ選ぶと、理想条件の画像と人数を同時に返す",
    promoDescription: "譲れない条件を9つ選ぶだけで、3×3カード画像と推計人数を返します。",
    tags: ["9つ選ぶ", "約1分", "画像シェア"],
    category: "research",
    isNew: true,
    newUntil: "2026-04-30",
    order: 1,
    status: "live",
  },
  {
    id: "conditions",
    path: "/conditions",
    label: "CONDITION CHECK",
    name: "条件リアリティチェッカー",
    description: "相手の条件を入力→何人いるかをリアルタイム算出",
    promoDescription: "理想条件を入れると、その条件に合う未婚者が何人いるかを計算します。",
    tags: ["スライダー操作", "約1分", "リアルタイム算出"],
    category: "research",
    isNew: false,
    order: 2,
    status: "live",
  },
  {
    id: "market",
    path: "/market",
    label: "MARKET VALUE",
    name: "婚活スペック年収換算",
    description: "自分のスペックのレア度を年収で換算",
    promoDescription: "自分の婚活スペックのレア度を、年収という物差しで見直せます。",
    tags: ["フォーム入力", "約30秒", "年収換算"],
    category: "research",
    isNew: false,
    order: 3,
    status: "live",
  },
  {
    id: "hensachi",
    path: "/hensachi",
    label: "APP HENSACHI",
    name: "マッチングアプリ偏差値診断",
    description: "16問でアプリの使い方を5科目の偏差値で採点",
    promoDescription: "16問に答えるだけで、アプリの使い方を5科目の偏差値で見直せます。",
    tags: ["全16問", "約3分", "質問型"],
    category: "discover",
    isNew: false,
    order: 1,
    status: "live",
  },
  {
    id: "type",
    path: "/type",
    label: "MATCHING APP TYPE",
    name: "マチアプMBTI診断",
    description: "16問でアプリの使い方を16タイプに分類",
    promoDescription: "16問でアプリの使い方をタイプ分けして、自分の傾向を見つけます。",
    tags: ["全16問", "約3分", "スライダー型"],
    category: "discover",
    isNew: true,
    newUntil: "2026-04-30",
    order: 2,
    status: "coming_soon",
  },
];

export const FEATURED_TOOL_ID: ToolId = "hensachi";

export type HomeAnnouncement = {
  id: string;
  text: string;
  url: string;
  expiresAt: string;
};

export const HOME_ANNOUNCEMENTS: HomeAnnouncement[] = [
  {
    id: "line-weight",
    text: "LINEメッセージ重量測定をリリースしました",
    url: "/weight",
    expiresAt: "2026-04-15",
  },
];

export type ToolGuide = {
  title: string;
  steps: Array<{
    toolId: ToolId;
    label: string;
  }>;
  note?: string;
};

export const GUIDES: ToolGuide[] = [
  {
    title: "「スペックは悪くないのにうまくいかない」人へ",
    steps: [
      { toolId: "market", label: "年収換算でスペックを確認" },
      { toolId: "prof", label: "プロフ偏差値でプロフを改善" },
      { toolId: "weight", label: "LINE重量で会話を見直す" },
    ],
  },
  {
    title: "「自分の条件が高すぎるのか分からない」人へ",
    steps: [
      { toolId: "my9specs", label: "まずは譲れない9条件を可視化" },
      { toolId: "conditions", label: "条件チェッカーで人数を把握" },
      { toolId: "market", label: "年収換算で自分側を確認" },
    ],
    note: "3つの結果を並べると、理想条件と自分側のバランスが見えます。",
  },
  {
    title: "「自分のアプリの使い方に自信がない」人へ",
    steps: [
      { toolId: "hensachi", label: "偏差値診断で弱点を特定" },
      { toolId: "prof", label: "プロフ偏差値で入口の改善点を確認" },
    ],
  },
];

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

  return GUIDES.filter((guide) => guide.steps.every((step) => liveToolIds.has(step.toolId)));
}
