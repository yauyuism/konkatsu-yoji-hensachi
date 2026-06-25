import type { FatigueReasonType } from "@/lib/fatigue-reason";

export type FatigueReasonDisplayMeta = {
  resultLabel: string;
  shortLabel: string;
  shareCopy: string;
};

export const FATIGUE_REASON_DISPLAY_META: Record<FatigueReasonType, FatigueReasonDisplayMeta> = {
  fastJudgment: {
    resultLabel: "判断先行型",
    shortLabel: "判断先行",
    shareCopy: "会えるのに進まない理由は、相手を見る前に疲れる仕組みに入っていることかもしれません。",
  },
  wrongPeople: {
    resultLabel: "入口ズレ型",
    shortLabel: "入口ズレ",
    shareCopy: "出会いの量より、入口のズレで消耗している状態かもしれません。",
  },
  purposeFirst: {
    resultLabel: "目的迷子型",
    shortLabel: "目的迷子",
    shareCopy: "誰を選ぶかの前に、結婚で何を叶えたいかが置き去りになっているかもしれません。",
  },
  profileInvisible: {
    resultLabel: "条件検索疲れ型",
    shortLabel: "条件疲れ",
    shareCopy: "条件で選ばれる場所ほど、あなたの魅力が見えにくくなっているかもしれません。",
  },
  placeMismatch: {
    resultLabel: "出会い方ミスマッチ型",
    shortLabel: "出会い方ズレ",
    shareCopy: "あなたの魅力が出にくい場所で頑張っているから、婚活が重くなっているのかもしれません。",
  },
  overAdjusting: {
    resultLabel: "合わせすぎ疲れ型",
    shortLabel: "合わせ疲れ",
    shareCopy: "相手に合わせるほど、自分のまた会いたい感覚が見えにくくなっているかもしれません。",
  },
  stagedFatigue: {
    resultLabel: "予定調和疲れ型",
    shortLabel: "予定調和疲れ",
    shareCopy: "恋愛の予定を増やすほど、生活が広がらない出会いに飽きているのかもしれません。",
  },
  reset: {
    resultLabel: "立て直し期型",
    shortLabel: "立て直し",
    shareCopy: "今はもっと会うより、婚活で削れた自分を整える時期かもしれません。",
  },
};
