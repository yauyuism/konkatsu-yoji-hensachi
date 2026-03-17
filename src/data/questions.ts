export type AxisKey = "o" | "s" | "f" | "a";

export type Scores = Record<AxisKey, number>;

export interface Choice {
  text: string;
  scores: Scores;
}

export interface Question {
  id: number;
  question: string;
  choices: [Choice, Choice, Choice, Choice];
}

export const axisPriority: AxisKey[] = ["o", "s", "f", "a"];

function createScores(o: number, s: number, f: number, a: number): Scores {
  return { o, s, f, a };
}

export const questions: Question[] = [
  {
    id: 1,
    question: "マッチングアプリの「いいね」、あなたのスタイルは？",
    choices: [
      { text: "気になったら即いいね。数は正義", scores: createScores(3, 0, 0, 0) },
      { text: "プロフをじっくり読んでから厳選", scores: createScores(0, 2, 0, 1) },
      { text: "基本は待ち。来た人の中から選ぶ", scores: createScores(0, 1, 1, 0) },
      { text: "いいねの正解が分からなくなってきた", scores: createScores(0, 0, 2, 1) },
    ],
  },
  {
    id: 2,
    question: "初デート、相手のどこを一番見てる？",
    choices: [
      { text: "清潔感と雰囲気。直感を信じる", scores: createScores(1, 0, 0, 1) },
      { text: "写真と実物の一致率", scores: createScores(0, 2, 1, 0) },
      { text: "会話のテンポと笑いのツボ", scores: createScores(0, 0, 0, 3) },
      { text: "さりげなく年収・職業を探る", scores: createScores(0, 3, 0, 0) },
    ],
  },
  {
    id: 3,
    question: "「いい人いないの？」と親に聞かれたら？",
    choices: [
      { text: "「今いい感じの人いるよ」（いない）", scores: createScores(2, 0, 0, 0) },
      { text: "「条件に合う人がいなくてさ…」", scores: createScores(0, 2, 0, 1) },
      { text: "笑顔で話題を変える", scores: createScores(0, 0, 2, 0) },
      { text: "「いい人の定義って何？」と哲学する", scores: createScores(0, 0, 0, 3) },
    ],
  },
  {
    id: 4,
    question: "友人の結婚報告。心の中は？",
    choices: [
      { text: "「次は自分だ」と奮起する", scores: createScores(3, 0, 0, 0) },
      { text: "「相手のスペック聞いていい？」", scores: createScores(0, 3, 0, 0) },
      { text: "祝福の笑顔（心は無）", scores: createScores(0, 0, 3, 0) },
      { text: "「焦っても仕方ない」と自分に言い聞かせる", scores: createScores(0, 0, 1, 2) },
    ],
  },
  {
    id: 5,
    question: "デート後、相手からLINEが来ない。3日目。",
    choices: [
      { text: "自分から「楽しかったです！」と送る", scores: createScores(3, 0, 0, 0) },
      { text: "相手のSNSを全チェック", scores: createScores(1, 1, 1, 0) },
      { text: "「まあ縁がなかったな」と秒で次へ", scores: createScores(0, 0, 2, 1) },
      { text: "友人5人にスクショ共有して会議", scores: createScores(1, 0, 0, 2) },
    ],
  },
  {
    id: 6,
    question: "結婚相手に求める条件、いくつある？",
    choices: [
      { text: "3つ以内。多くは求めない", scores: createScores(1, 0, 0, 1) },
      { text: "10個以上。譲れないものがある", scores: createScores(0, 3, 0, 0) },
      { text: "「普通の人でいい」（上位5%を想定）", scores: createScores(0, 1, 2, 0) },
      { text: "条件は結局あてにならないと悟った", scores: createScores(0, 0, 0, 3) },
    ],
  },
  {
    id: 7,
    question: "婚活で一番しんどいことは？",
    choices: [
      { text: "自分を売り込むこと。営業かよ", scores: createScores(1, 0, 1, 1) },
      { text: "条件に合う人がマジでいない", scores: createScores(0, 3, 0, 0) },
      { text: "同じことの繰り返し。デジャヴ", scores: createScores(0, 0, 3, 0) },
      { text: "自分が何を求めてるのか分からない", scores: createScores(0, 0, 0, 3) },
    ],
  },
  {
    id: 8,
    question: "合コン・飲み会でのポジションは？",
    choices: [
      { text: "場を回すMC。盛り上げ担当", scores: createScores(3, 0, 0, 0) },
      { text: "隣の人のスペックをさりげなく聞き出す", scores: createScores(0, 3, 0, 0) },
      { text: "そもそも行かなくなった", scores: createScores(0, 0, 3, 0) },
      { text: "端っこで人間観察してる", scores: createScores(0, 0, 0, 3) },
    ],
  },
  {
    id: 9,
    question: "婚活、今の正直な気持ちは？",
    choices: [
      { text: "まだまだこれから。楽しんでる", scores: createScores(2, 0, 0, 1) },
      { text: "いい人さえ見つかれば即決できるのに", scores: createScores(0, 2, 1, 0) },
      { text: "正直、もう休みたい", scores: createScores(0, 0, 3, 0) },
      { text: "自分を見つめ直す時期かもしれない", scores: createScores(0, 0, 0, 3) },
    ],
  },
  {
    id: 10,
    question: "この診断をやろうと思った理由は？",
    choices: [
      { text: "話のネタになりそうだから", scores: createScores(2, 0, 0, 1) },
      { text: "自分の婚活を客観視したい", scores: createScores(0, 1, 0, 2) },
      { text: "暇だった（婚活疲れで予定がない）", scores: createScores(0, 0, 3, 0) },
      { text: "自分のことを言語化してほしい", scores: createScores(0, 0, 0, 3) },
    ],
  },
];
