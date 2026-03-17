import type { HensachiAxisKey } from "@/data/hensachi-questions";

export interface HensachiBand {
  min: number;
  max: number;
  title: string;
  color: string;
  comment: string;
}

export const hensachiBands: HensachiBand[] = [
  {
    min: 75,
    max: 80,
    title: "恋愛の覇王",
    color: "#E8453C",
    comment: "このスコアが出るなら、あとはタイミングだけ。焦るな、選べ。",
  },
  {
    min: 70,
    max: 74,
    title: "アプリの支配者",
    color: "#E8453C",
    comment: "強い。でも強い人ほど「妥協」という言葉を嫌う。それが唯一の弱点。",
  },
  {
    min: 65,
    max: 69,
    title: "恋のスナイパー",
    color: "#F97316",
    comment: "偏差値65は上位15%。十分すぎる。あとは打席に立つ回数の問題。",
  },
  {
    min: 60,
    max: 64,
    title: "婚活エリート",
    color: "#F97316",
    comment: "基礎は完成してる。ここから先は「運」と「場数」が効いてくるゾーン。",
  },
  {
    min: 55,
    max: 59,
    title: "堅実なプレイヤー",
    color: "#3B82F6",
    comment: "真ん中よりちょい上。伸びしろしかない。一つ得意科目を作れば一気に化ける。",
  },
  {
    min: 50,
    max: 54,
    title: "アプリ中級者",
    color: "#3B82F6",
    comment: "ど真ん中。つまり「普通」。でもアプリ婚活で普通は悪くない。戦える。",
  },
  {
    min: 45,
    max: 49,
    title: "発展途上の戦士",
    color: "#6B7280",
    comment: "弱点が足を引っ張ってるタイプ。レーダーチャートの凹みを1つ埋めるだけで景色が変わる。",
  },
  {
    min: 40,
    max: 44,
    title: "迷えるスワイパー",
    color: "#6B7280",
    comment: "正直しんどい時期だと思う。でもここで辞める人が9割。続けた1割が勝つ。",
  },
  {
    min: 35,
    max: 39,
    title: "アプリ初心者",
    color: "#1A1A1A",
    comment: "アプリの使い方を根本から見直す段階。恥ずかしくない、みんな最初はここから。",
  },
  {
    min: 25,
    max: 34,
    title: "ここから伸びる人",
    color: "#1A1A1A",
    comment: "今は作戦を替える余白が大きい帯。1個ずつ試すほど景色が変わる。",
  },
];

export const bestAxisPhrases: Record<HensachiAxisKey, string> = {
  profile: "自己プロデュース力が武器",
  photo: "写真戦略が確立されている",
  talk: "会話力で相手を惹きつけるタイプ",
  judge: "相手を見抜く目が鋭い",
  grit: "折れないメンタルが最大の強み",
};

export const worstAxisPhrases: Record<HensachiAxisKey, string> = {
  profile: "プロフの作り込みが伸びしろ",
  photo: "写真の見直しで一気に化ける可能性あり",
  talk: "メッセージ・会話の引き出しを増やすと一段上へ",
  judge: "見極め力を磨くと無駄なデートが減る",
  grit: "気持ちの回復方法を持つと長期戦に強くなる",
};
