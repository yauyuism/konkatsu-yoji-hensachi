import type { DeaiFitType } from "@/lib/deai-fit";

export type DeaiFitDisplayMeta = {
  resultLabel: string;
  shareCopy: string;
};

export const DEAI_FIT_DISPLAY_META: Record<DeaiFitType, DeaiFitDisplayMeta> = {
  "O-C-Q-D": {
    resultLabel: "条件検索即決型",
    shareCopy: "条件で候補を絞って、合いそうなら早めに一対一で進めたいタイプです。",
  },
  "O-C-Q-N": {
    resultLabel: "紹介活用型",
    shareCopy: "条件の安心感に、誰かの信用が加わると動きやすいタイプです。",
  },
  "O-C-S-D": {
    resultLabel: "条件じっくり型",
    shareCopy: "条件は大事。でも気持ちは、何度か会う中で育てたいタイプです。",
  },
  "O-C-S-N": {
    resultLabel: "安心紹介育成型",
    shareCopy: "条件も安心感もほしい。紹介やコミュニティで少しずつ育ちやすいタイプです。",
  },
  "O-V-Q-D": {
    resultLabel: "SNS瞬発型",
    shareCopy: "文章や投稿の温度感で気になり、会ったら早めに進みたいタイプです。",
  },
  "O-V-Q-N": {
    resultLabel: "SNS人脈拡張型",
    shareCopy: "オンラインの空気感から入り、人間関係が広がる中で恋愛に進みやすいタイプです。",
  },
  "O-V-S-D": {
    resultLabel: "文章じわ好き型",
    shareCopy: "相手の文章や日常の出し方から、少しずつ好きになりやすいタイプです。",
  },
  "O-V-S-N": {
    resultLabel: "SNS余白型",
    shareCopy: "オンライン上でゆるくつながり、何度も目に入る中で気持ちが動きやすいタイプです。",
  },
  "F-C-Q-D": {
    resultLabel: "対面即決型",
    shareCopy: "最低限の条件を見たら、あとは会ったときの感覚で早めに進めたいタイプです。",
  },
  "F-C-Q-N": {
    resultLabel: "紹介即決型",
    shareCopy: "誰かの信用がある状態で会い、合えば早めに次へ進めたいタイプです。",
  },
  "F-C-S-D": {
    resultLabel: "対面じっくり型",
    shareCopy: "会って話したい。でも、好きになるまでは時間をかけたいタイプです。",
  },
  "F-C-S-N": {
    resultLabel: "生活観育成型",
    shareCopy: "人柄も条件も、何度か顔を合わせる中で見ていきたいタイプです。",
  },
  "F-V-Q-D": {
    resultLabel: "直感対面型",
    shareCopy: "会った瞬間の空気感や会話のテンポで、恋愛が動きやすいタイプです。",
  },
  "F-V-Q-N": {
    resultLabel: "外飲み発展型",
    shareCopy: "場のノリ、偶然、紹介の連鎖から恋愛が動きやすいタイプです。",
  },
  "F-V-S-D": {
    resultLabel: "一対一空気育成型",
    shareCopy: "条件より空気感重視。落ち着いた一対一でゆっくり相手を見たいタイプです。",
  },
  "F-V-S-N": {
    resultLabel: "生活圏拡張型",
    shareCopy: "条件で探すより、日常の中で人を好きになるタイプです。",
  },
};
