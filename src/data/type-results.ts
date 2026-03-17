export type MatchingAppTypeCode =
  | "SMLA"
  | "SMLP"
  | "SMFA"
  | "SMFP"
  | "STLA"
  | "STLP"
  | "STFA"
  | "STFP"
  | "EMLA"
  | "EMLP"
  | "EMFA"
  | "EMFP"
  | "ETLA"
  | "ETLP"
  | "ETFA"
  | "ETFP";

export type MatchingAppTypeMeta = {
  name: string;
  catchphrase: string;
  emoji: string;
  color: string;
};

export const TYPES: Record<MatchingAppTypeCode, MatchingAppTypeMeta> = {
  SMLA: { name: "慎重な設計者", catchphrase: "少数精鋭でちゃんと見て、会う前にだいたい決めている。", emoji: "◉", color: "#E8453C" },
  SMLP: { name: "静かな観測者", catchphrase: "慎重で受け身。でも空気の違和感にはかなり敏感。", emoji: "○", color: "#F97316" },
  SMFA: { name: "直感の切り込み隊長", catchphrase: "文の熱量で判断し、良いと思ったら早い。", emoji: "◎", color: "#FB7185" },
  SMFP: { name: "余白のロマン派", catchphrase: "雰囲気重視。好き嫌いは強いが動き出しは遅め。", emoji: "◌", color: "#F59E0B" },
  STLA: { name: "条件の司令塔", catchphrase: "整理と判断が得意。会うかどうかの基準が明確。", emoji: "▣", color: "#3B82F6" },
  STLP: { name: "見極めの保留職人", catchphrase: "ちゃんと見るけど、慎重すぎて機会を逃しがち。", emoji: "□", color: "#6366F1" },
  STFA: { name: "会って決める戦略家", catchphrase: "文章より実地派。テンポよく進めるほど強い。", emoji: "◍", color: "#8B5CF6" },
  STFP: { name: "慎重なリアリスト", catchphrase: "無駄打ちは少ないが、受けに回ると停滞しやすい。", emoji: "◐", color: "#64748B" },
  EMLA: { name: "広く浅くの外交官", catchphrase: "間口が広い。会う人数を回して見極めるタイプ。", emoji: "✦", color: "#10B981" },
  EMLP: { name: "様子見ネットワーカー", catchphrase: "反応は取りにいくが、主導権は握り切らない。", emoji: "✧", color: "#14B8A6" },
  EMFA: { name: "熱量ドリブン型", catchphrase: "好きになりそうなら早い。勢いで景色を変えるタイプ。", emoji: "⬢", color: "#06B6D4" },
  EMFP: { name: "フィーリング収集家", catchphrase: "直感の精度は高いが、ペースが相手次第になりやすい。", emoji: "⬡", color: "#0EA5E9" },
  ETLA: { name: "高速PDCA型", catchphrase: "仮説を立てて回しながら強くなる、改善特化タイプ。", emoji: "▲", color: "#1D4ED8" },
  ETLP: { name: "機会損失リサーチャー", catchphrase: "打席数は多いが、最後の一押しだけ足りない。", emoji: "△", color: "#2563EB" },
  ETFA: { name: "攻めの実践家", catchphrase: "会う、話す、切るが速い。アプリを道具として扱える。", emoji: "◆", color: "#7C3AED" },
  ETFP: { name: "ノリで勝つ冒険家", catchphrase: "勢いが武器。ハマる相手には一気に刺さる。", emoji: "◇", color: "#EC4899" },
};

