export type DeaiFitType = "condition" | "relationship" | "lifestyle" | "values" | "hybrid";

export type DeaiFitOption = {
  label: string;
  type: DeaiFitType;
};

export type DeaiFitQuestion = {
  id: number;
  text: string;
  options: DeaiFitOption[];
};

export type DeaiFitResult = {
  type: DeaiFitType;
  name: string;
  suited: string[];
  notFit: string[];
  drain: string[];
  action: string;
  proposal: string;
};

export const DEAI_FIT_TYPE_ORDER: DeaiFitType[] = ["condition", "relationship", "lifestyle", "values", "hybrid"];

export const DEAI_FIT_QUESTIONS: DeaiFitQuestion[] = [
  {
    id: 1,
    text: "初対面の相手を見るとき、どこが気になりますか？",
    options: [
      { type: "condition", label: "年齢や結婚願望など、先に確認したい条件" },
      { type: "relationship", label: "会話のテンポや一緒にいる時の自然さ" },
      { type: "lifestyle", label: "場の中での振る舞いや周りへの態度" },
      { type: "values", label: "考え方や価値観が近いかどうか" },
      { type: "hybrid", label: "条件も雰囲気も両方見たい" },
    ],
  },
  {
    id: 2,
    text: "婚活で安心しやすいのは、どんな状態ですか？",
    options: [
      { type: "condition", label: "相手の基本条件や結婚意思が先に分かっている" },
      { type: "relationship", label: "何度か会う中で、少しずつ人柄が見えてくる" },
      { type: "lifestyle", label: "恋愛以外の会話やつながりも自然に生まれる" },
      { type: "values", label: "会う前に言葉や考え方を知れる" },
      { type: "hybrid", label: "目的も自然さも、どちらもある程度ほしい" },
    ],
  },
  {
    id: 3,
    text: "自分の良さが出やすい場はどれですか？",
    options: [
      { type: "condition", label: "目的がはっきりしていて、短時間で話せる場" },
      { type: "relationship", label: "共通の知人や趣味があり、何度か会える場" },
      { type: "lifestyle", label: "お店やイベントなど、場そのものを楽しめる場" },
      { type: "values", label: "投稿や文章から人柄を知ってもらえる場" },
      { type: "hybrid", label: "目的のある場と自然な場を使い分けたい" },
    ],
  },
  {
    id: 4,
    text: "相手を知る順番として近いのは？",
    options: [
      { type: "condition", label: "条件を確認してから、人柄を見る" },
      { type: "relationship", label: "何度か話してから、恋愛対象として意識する" },
      { type: "lifestyle", label: "場での態度や周りとの関係から惹かれる" },
      { type: "values", label: "考え方や人生観を知ってから会いたくなる" },
      { type: "hybrid", label: "条件、雰囲気、価値観を並行して見たい" },
    ],
  },
  {
    id: 5,
    text: "週末に出会いの予定を入れるなら？",
    options: [
      { type: "condition", label: "アプリや相談所で、結婚意思のある人と会う" },
      { type: "relationship", label: "友人の紹介や趣味の集まりに行く" },
      { type: "lifestyle", label: "行きつけになりたい店や外飲みに行く" },
      { type: "values", label: "SNSやnoteで価値観の近い人とやり取りする" },
      { type: "hybrid", label: "婚活予定と生活圏を広げる予定を両方入れる" },
    ],
  },
  {
    id: 6,
    text: "プロフィールで伝えたいのは？",
    options: [
      { type: "condition", label: "結婚観、希望、生活条件などの分かりやすさ" },
      { type: "relationship", label: "一緒にいるときの穏やかさや会話の感じ" },
      { type: "lifestyle", label: "普段の過ごし方や人との関わり方" },
      { type: "values", label: "大切にしている考え方や言葉" },
      { type: "hybrid", label: "条件と人柄のバランス" },
    ],
  },
  {
    id: 7,
    text: "疲れやすい婚活はどれですか？",
    options: [
      { type: "condition", label: "結婚意思が分からないまま曖昧に続く関係" },
      { type: "relationship", label: "初回で好きかどうかを急いで決める場" },
      { type: "lifestyle", label: "出会いが結婚相手探しの作業だけになること" },
      { type: "values", label: "表面的な会話だけが続くこと" },
      { type: "hybrid", label: "ひとつのやり方に固定されること" },
    ],
  },
  {
    id: 8,
    text: "判断のペースとして合うのは？",
    options: [
      { type: "condition", label: "必要な情報がそろえば、比較的早く判断できる" },
      { type: "relationship", label: "何度か会ってから気持ちが動く" },
      { type: "lifestyle", label: "場を共有しながら自然に距離が縮まるのがいい" },
      { type: "values", label: "言葉や考え方のやり取りを重ねてから会いたい" },
      { type: "hybrid", label: "相手や場所によってペースを変えたい" },
    ],
  },
  {
    id: 9,
    text: "出会いが広がったとき、うれしいのは？",
    options: [
      { type: "condition", label: "結婚につながる可能性の高い人と効率よく会えること" },
      { type: "relationship", label: "安心できる人間関係の中で紹介が増えること" },
      { type: "lifestyle", label: "行きたい場所や知り合いが増えて生活が楽しくなること" },
      { type: "values", label: "価値観の近い人と自然につながること" },
      { type: "hybrid", label: "結婚意思のある出会いと自然な出会いが両方増えること" },
    ],
  },
  {
    id: 10,
    text: "相談で整理したいことに近いのは？",
    options: [
      { type: "condition", label: "自分に合う条件設定や婚活サービスの選び方" },
      { type: "relationship", label: "紹介やコミュニティで恋愛につなげる動き方" },
      { type: "lifestyle", label: "生活圏を広げながら出会いを増やす方法" },
      { type: "values", label: "発信や言語化から相性の良い人と出会う方法" },
      { type: "hybrid", label: "複数の出会い方をどう組み合わせるか" },
    ],
  },
];

export const DEAI_FIT_RESULTS: Record<DeaiFitType, DeaiFitResult> = {
  condition: {
    type: "condition",
    name: "条件検索型",
    suited: ["マッチングアプリ", "結婚相談所"],
    notFit: ["条件が見えない偶然任せの出会い", "結婚意思が分からないまま続く関係"],
    drain: ["条件が見えない出会いだと不安になりやすい", "相手の結婚意思が分からない関係に疲れやすい"],
    action: "検索条件を3つに絞り、条件を確認したあとに「一緒にいる時の安心感」もメモしてみましょう。",
    proposal:
      "あなたは、条件を先に確認できる出会い方と相性が良いタイプです。マッチングアプリや結婚相談所を使いながら、条件だけでなく、一緒にいる時の安心感や相手の時間の使い方も見ていくと良さそうです。",
  },
  relationship: {
    type: "relationship",
    name: "関係性育成型",
    suited: ["友達の紹介", "趣味の場", "コミュニティ", "何度か会える場"],
    notFit: ["初回デートで即判断する婚活", "プロフィールや条件だけで比較される場"],
    drain: ["初回デートで即判断する婚活に疲れやすい", "プロフィールや条件だけで判断される場では魅力が伝わりにくい"],
    action: "友人への紹介依頼や趣味の集まりなど、何度か自然に会える予定をひとつ増やしてみましょう。",
    proposal:
      "あなたは、関係性の中で魅力が出るタイプです。紹介、趣味の場、コミュニティなど、何度か自然に会える出会い方を増やすと、自分らしく人と向き合いやすくなります。",
  },
  lifestyle: {
    type: "lifestyle",
    name: "生活圏拡張型",
    suited: ["外飲み", "行きつけの店", "常連コミュニティ", "友達の友達"],
    notFit: ["一対一で条件確認だけを続ける婚活", "出会いを結婚相手探しの作業だけにする場"],
    drain: ["一対一で条件確認をするだけの婚活だと退屈しやすい", "出会いが「結婚相手探しの作業」になると急に苦しくなる"],
    action: "気になる店やイベントをひとつ決め、恋愛目的だけでなく生活圏を広げる予定として入れてみましょう。",
    proposal:
      "あなたは、生活圏が広がる出会い方と相性が良いタイプです。外飲み、行きつけの店、友達の友達など、恋愛だけを目的にしない場で人と出会うことで、自然に魅力が伝わりやすくなります。",
  },
  values: {
    type: "values",
    name: "価値観発信型",
    suited: ["SNS", "note", "X", "発信経由の出会い", "価値観が見えるコミュニティ"],
    notFit: ["条件だけで人を見る婚活", "表面的な会話だけが続く出会い"],
    drain: ["条件だけで人を見る婚活に違和感を持ちやすい", "表面的な会話が続くと、相手に興味を持ちにくい"],
    action: "最近考えていることや大切にしたい暮らし方を、短い投稿やプロフィール文に一つ足してみましょう。",
    proposal:
      "あなたは、価値観が見える出会い方と相性が良いタイプです。SNSやnoteなどで、自分の考え方や日常を少しずつ出していくことで、条件だけでは出会えない相手とつながりやすくなります。",
  },
  hybrid: {
    type: "hybrid",
    name: "併用設計型",
    suited: ["結婚相談所", "マッチングアプリ", "紹介", "外飲み", "SNS", "趣味の場"],
    notFit: ["出会い方をひとつに固定する婚活", "効率か自然さのどちらかだけに寄せる進め方"],
    drain: ["どれかひとつの出会い方に固定されると苦しくなる", "婚活の進め方が定まらず、迷いやすい"],
    action: "結婚意思を確認できる場所と、自然に人間関係が広がる場所を一つずつ選び、今月の動き方に分けてみましょう。",
    proposal:
      "あなたは、ひとつの出会い方に絞るより、複数の出会い方を組み合わせるのが向いているタイプです。結婚相談所やマッチングアプリで結婚意思のある人と出会いつつ、紹介、外飲み、SNS、趣味の場などで生活圏も広げていくと、自分に合う相手に近づきやすくなります。",
  },
};

export function runDeaiFitDiagnosis(answers: DeaiFitType[]) {
  const scores = DEAI_FIT_TYPE_ORDER.reduce<Record<DeaiFitType, number>>((accumulator, type) => {
    accumulator[type] = 0;
    return accumulator;
  }, {} as Record<DeaiFitType, number>);

  answers.forEach((answer) => {
    scores[answer] += 1;
  });

  const maxScore = Math.max(...DEAI_FIT_TYPE_ORDER.map((type) => scores[type]));
  const winners = DEAI_FIT_TYPE_ORDER.filter((type) => scores[type] === maxScore);
  const resultType = winners.length > 1 ? "hybrid" : winners[0];

  return {
    result: DEAI_FIT_RESULTS[resultType],
    scores,
  };
}
