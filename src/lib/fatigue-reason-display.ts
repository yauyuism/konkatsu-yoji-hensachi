import type { FatigueReasonType } from "@/lib/fatigue-reason";

export type FatigueReasonDisplayMeta = {
  resultLabel: string;
  shortLabel: string;
  chartLabel: string;
  supportLabel: string;
  formalDescription: string;
  shareCopy: string;
};

export const FATIGUE_REASON_DISPLAY_META: Record<FatigueReasonType, FatigueReasonDisplayMeta> = {
  fastJudgment: {
    resultLabel: "判断先行型",
    shortLabel: "判断先行",
    chartLabel: "判断先行",
    supportLabel: "気持ちが育つ前に判断を迫られるタイプ",
    formalDescription: "短い時間で恋愛対象として判断される婚活に疲れやすい傾向があります。",
    shareCopy: "会えるのに進まない理由は、相手を見る前に疲れる仕組みに入っていることかもしれません。",
  },
  wrongPeople: {
    resultLabel: "入口ズレ型",
    shortLabel: "入口ズレ",
    chartLabel: "入口ズレ",
    supportLabel: "合わない人が入りやすいタイプ",
    formalDescription: "プロフィールや出会い方が、あなたと温度感の違う相手まで呼び込みやすくなっています。",
    shareCopy: "出会いの量より、入口のズレで消耗している状態かもしれません。",
  },
  purposeFirst: {
    resultLabel: "目的迷子型",
    shortLabel: "目的迷子",
    chartLabel: "目的迷子",
    supportLabel: "誰を選ぶ前に、なぜ結婚したいかが曖昧なタイプ",
    formalDescription: "相手探しの前に、結婚後にどんな生活をしたいかを整理したほうがよい状態です。",
    shareCopy: "誰を選ぶかの前に、結婚で何を叶えたいかが置き去りになっているかもしれません。",
  },
  profileInvisible: {
    resultLabel: "条件疲れ型",
    shortLabel: "条件疲れ",
    chartLabel: "条件疲れ",
    supportLabel: "条件検索で自分の魅力が見えにくくなるタイプ",
    formalDescription: "条件欄だけで見られる場所にいると、自分の魅力が伝わりにくくなりやすいです。",
    shareCopy: "条件で選ばれる場所ほど、あなたの魅力が見えにくくなっているかもしれません。",
  },
  placeMismatch: {
    resultLabel: "出会い方ズレ型",
    shortLabel: "出会い方ズレ",
    chartLabel: "場所ズレ",
    supportLabel: "好きになれる場所と進めやすい場所がズレているタイプ",
    formalDescription: "好きになれる場所と、恋愛に進めやすい場所が分かれている可能性があります。",
    shareCopy: "あなたの魅力が出にくい場所で頑張っているから、婚活が重くなっているのかもしれません。",
  },
  overAdjusting: {
    resultLabel: "合わせ疲れ型",
    shortLabel: "合わせ疲れ",
    chartLabel: "合わせ疲れ",
    supportLabel: "相手の気持ちを優先しすぎるタイプ",
    formalDescription: "相手がどう思っているかを気にする一方で、自分がまた会いたいかを後回しにしやすい傾向があります。",
    shareCopy: "相手に合わせるほど、自分のまた会いたい感覚が見えにくくなっているかもしれません。",
  },
  stagedFatigue: {
    resultLabel: "予定調和疲れ型",
    shortLabel: "予定調和",
    chartLabel: "予定調和",
    supportLabel: "作られた出会いに飽きているタイプ",
    formalDescription: "毎回同じ自己紹介をして、同じように会って、同じように判断する婚活に飽きている可能性があります。",
    shareCopy: "恋愛の予定を増やすほど、生活が広がらない出会いに飽きているのかもしれません。",
  },
  reset: {
    resultLabel: "立て直し期",
    shortLabel: "立て直し",
    chartLabel: "立て直し",
    supportLabel: "新しい出会いより先に、自分を整えるタイミング",
    formalDescription: "新しい出会いを増やす前に、婚活で削れた自分を一度整えたほうがよい状態です。",
    shareCopy: "今はもっと会うより、婚活で削れた自分を整える時期かもしれません。",
  },
};
