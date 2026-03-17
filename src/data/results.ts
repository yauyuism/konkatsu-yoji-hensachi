export interface Result {
  type: string;
  yoji: string;
  reading: string;
  meaning: string;
  advice: string;
  rarity: "S" | "A" | "B";
}

export const rarityLabels = {
  S: "激レア",
  A: "レア",
  B: "ノーマル",
} as const;

export const results = {
  o_s: {
    type: "o_s",
    yoji: "全方位砲火",
    reading: "ぜんほういほうか",
    meaning:
      "アプリ5個併用×条件ガチガチ。出会いの量と質を同時に追い求め、婚活に全火力を集中投下している状態。その熱量、嫌いじゃない。",
    advice:
      "弾は撃ちすぎると当たらなくなる。一人に集中する「狙撃」モードも試してみて。",
    rarity: "A",
  },
  o_f: {
    type: "o_f",
    yoji: "孤軍奮闘",
    reading: "こぐんふんとう",
    meaning:
      "疲れてるのに止まれない。周りに相談できず、一人で戦い続けている。でもその姿、誰かはちゃんと見てる。",
    advice: "一回立ち止まっていい。再開したとき、視界が変わってるはず。",
    rarity: "B",
  },
  o_a: {
    type: "o_a",
    yoji: "直感成婚",
    reading: "ちょっかんせいこん",
    meaning:
      "考えるのをやめた瞬間に最高の相手と出会う。行動力と自己理解を兼ね備えた、婚活最強の型。",
    advice: "あなたの直感は正しい。次の「この人かも」を信じて。",
    rarity: "S",
  },
  s_o: {
    type: "s_o",
    yoji: "条件迷宮",
    reading: "じょうけんめいきゅう",
    meaning:
      "年収、身長、学歴、趣味、実家の距離。条件を重ねすぎて誰にもたどり着けない。でも譲れないものは譲れない。",
    advice: "条件を3つに絞ったとき、残った3つがあなたの本音。",
    rarity: "A",
  },
  s_f: {
    type: "s_f",
    yoji: "年収幻想",
    reading: "ねんしゅうげんそう",
    meaning:
      "理想のスペックに囚われ、目の前の良い人を何人も見逃してきた。そろそろ気づいてるはず、「条件」と「幸せ」は別物だと。",
    advice: "年収は変動する。変わらないのは「一緒にいて楽かどうか」。",
    rarity: "B",
  },
  s_a: {
    type: "s_a",
    yoji: "理想崩壊",
    reading: "りそうほうかい",
    meaning:
      "積み上げた理想が現実に砕かれる音が聞こえた。でもそれは壊れたんじゃない。再構築が始まった音。",
    advice: "崩壊の先にしか見えない景色がある。ここからが本番。",
    rarity: "A",
  },
  f_o: {
    type: "f_o",
    yoji: "無限初回",
    reading: "むげんしょかい",
    meaning:
      "マッチング→初回デート→フェードアウト→マッチング…。何度繰り返しても初回デート止まりの無限ループ。",
    advice: "「2回目のデートに誘う」それだけで上位10%に入れる。",
    rarity: "B",
  },
  f_s: {
    type: "f_s",
    yoji: "親圧地獄",
    reading: "おやあつじごく",
    meaning:
      "実家に帰るたびに「いい人は？」。法事で「次はあなたの番ね」。自分のペースを親の圧が容赦なく粉砕する。",
    advice: "親の期待はコントロールできない。自分のタイミングだけ守って。",
    rarity: "B",
  },
  f_a: {
    type: "f_a",
    yoji: "既読放置",
    reading: "きどくほうち",
    meaning:
      "送っても返ってこない。返す気力もない。お互い様の世界で、既読マークだけが無言の会話を続けている。",
    advice: "スマホを閉じて、目の前の世界を見て。出会いはアプリの外にもある。",
    rarity: "B",
  },
  a_o: {
    type: "a_o",
    yoji: "覚悟完了",
    reading: "かくごかんりょう",
    meaning:
      "条件とか、タイミングとか、もう言ってられない。腹を括った瞬間から、婚活の景色は一変する。",
    advice: "その覚悟、相手にも伝わってる。あとは出会うだけ。",
    rarity: "S",
  },
  a_s: {
    type: "a_s",
    yoji: "婚活仙人",
    reading: "こんかつせんにん",
    meaning:
      "焦りが消え、他人と比べなくなり、ただ縁を待つ境地に到達した。悟りか、諦めか。本人にしか分からない。",
    advice: "仙人にも降りてくる日がある。そのとき動ける準備だけしておいて。",
    rarity: "A",
  },
  a_f: {
    type: "a_f",
    yoji: "沼脱出済",
    reading: "ぬまだっしゅつずみ",
    meaning:
      "過去の恋愛沼を這い上がってきた勲章。あの経験があるから、次は間違えない。たぶん。",
    advice: "沼の記憶は武器になる。同じ沼には二度と落ちない。",
    rarity: "A",
  },
} satisfies Record<string, Result>;

export type ResultType = keyof typeof results;

export const resultTypes = Object.keys(results) as ResultType[];
