import type { DeaiFitType } from "@/lib/deai-fit";

export type DeaiFitDisplayMeta = {
  resultLabel: string;
  shareCopy: string;
};

export const DEAI_FIT_DISPLAY_META: Record<DeaiFitType, DeaiFitDisplayMeta> = {
  "O-C-Q-D": {
    resultLabel: "条件確認スピード婚活タイプ",
    shareCopy: "会う前に条件を確認し、合いそうなら早めに一対一で進めたいタイプです。",
  },
  "O-C-Q-N": {
    resultLabel: "条件から広げる紹介活用タイプ",
    shareCopy: "条件は見たいけれど、自分だけで探すより誰かの目を通した出会いが合うタイプです。",
  },
  "O-C-S-D": {
    resultLabel: "慎重な条件確認タイプ",
    shareCopy: "条件は大事。でも、気持ちが育つまで少し時間が必要なタイプです。",
  },
  "O-C-S-N": {
    resultLabel: "条件も安心感もほしい紹介育成タイプ",
    shareCopy: "条件だけでなく、紹介や場の信用がある中で少しずつ進むほうが合うタイプです。",
  },
  "O-V-Q-D": {
    resultLabel: "SNS即フィーリングタイプ",
    shareCopy: "文章や投稿の温度感で気になり、会ったら早めに進みたいタイプです。",
  },
  "O-V-Q-N": {
    resultLabel: "SNS人脈拡張型",
    shareCopy: "オンラインの空気感から入り、人間関係が広がる中で恋愛に進みやすいタイプです。",
  },
  "O-V-S-D": {
    resultLabel: "文章からじわじわ好きになるタイプ",
    shareCopy: "相手の文章や日常の出し方から、少しずつ好きになりやすいタイプです。",
  },
  "O-V-S-N": {
    resultLabel: "オンライン生活圏タイプ",
    shareCopy: "オンラインでゆるくつながり、何度も目に入るうちに気になるタイプです。",
  },
  "F-C-Q-D": {
    resultLabel: "会って条件確認タイプ",
    shareCopy: "会わないと分からない。でも会ったら早めに判断したいタイプです。",
  },
  "F-C-Q-N": {
    resultLabel: "紹介即決型",
    shareCopy: "誰かの信用がある状態で会い、合えば早めに進めたいタイプです。",
  },
  "F-C-S-D": {
    resultLabel: "対面でゆっくり確認タイプ",
    shareCopy: "会って話したい。でもすぐには決めず、何度か会う中で判断したいタイプです。",
  },
  "F-C-S-N": {
    resultLabel: "生活観じわじわ確認タイプ",
    shareCopy: "人柄も条件も大事で、何度か顔を合わせる中で生活観を見たいタイプです。",
  },
  "F-V-Q-D": {
    resultLabel: "直感対面型",
    shareCopy: "会った瞬間の空気感や会話のテンポで気持ちが動きやすいタイプです。",
  },
  "F-V-Q-N": {
    resultLabel: "外飲み発展型",
    shareCopy: "場のノリ、偶然、紹介の連鎖から恋愛が動きやすいタイプです。",
  },
  "F-V-S-D": {
    resultLabel: "一対一で空気を育てるタイプ",
    shareCopy: "条件より空気感重視。ただし、大人数より一対一でゆっくり相手を見るほうが合うタイプです。",
  },
  "F-V-S-N": {
    resultLabel: "生活圏でじわじわ好きになるタイプ",
    shareCopy: "出会いを探しに行くより、生活圏に混ざる中で少しずつ好きになりやすいタイプです。",
  },
};
