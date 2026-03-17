export type HensachiAxisKey = "profile" | "photo" | "talk" | "judge" | "grit";

export type HensachiScores = Record<HensachiAxisKey, number>;

export interface HensachiChoice {
  text: string;
  scores: HensachiScores;
}

export interface HensachiQuestion {
  id: number;
  question: string;
  choices: [HensachiChoice, HensachiChoice, HensachiChoice, HensachiChoice];
}

export const hensachiAxisOrder: HensachiAxisKey[] = ["profile", "photo", "talk", "judge", "grit"];

export const hensachiAxisLabels: Record<HensachiAxisKey, string> = {
  profile: "プロフ力",
  photo: "写真力",
  talk: "会話力",
  judge: "見極め力",
  grit: "継続力",
};

function createScores(scores: Partial<HensachiScores>): HensachiScores {
  return {
    profile: 0,
    photo: 0,
    talk: 0,
    judge: 0,
    grit: 0,
    ...scores,
  };
}

export const hensachiQuestions: HensachiQuestion[] = [
  {
    id: 1,
    question: "アプリの利用目的は？",
    choices: [
      { text: "恋活。まずはちゃんと好きになれる相手を探したい", scores: createScores({ talk: 2, judge: 1, grit: 1 }) },
      { text: "婚活。結婚まで見据えられる相手を探したい", scores: createScores({ profile: 1, judge: 2, grit: 2 }) },
      { text: "遊び。重すぎない関係から気軽に会いたい", scores: createScores({ photo: 1, talk: 2 }) },
      { text: "なんとなく。周りに勧められてとりあえず入れた", scores: createScores({ grit: 1 }) },
    ],
  },
  {
    id: 2,
    question: "プロフ文、作るときどうしてる？",
    choices: [
      { text: "とりあえず一回書いて置いてる", scores: createScores({ grit: 1 }) },
      { text: "休日や仕事終わりの過ごし方まで入れる", scores: createScores({ profile: 2, talk: 1 }) },
      { text: "友達に見せて『これどう？』をやった", scores: createScores({ profile: 3, talk: 1 }) },
      { text: "何回直してもしっくり来ない", scores: createScores({ profile: 1, grit: 2 }) },
    ],
  },
  {
    id: 3,
    question: "メイン写真、どれを置いてる？",
    choices: [
      { text: "いちばん盛れてる自撮り", scores: createScores({ photo: 1 }) },
      { text: "友達に撮ってもらった自然な写真", scores: createScores({ photo: 3, judge: 1 }) },
      { text: "アプリ用にちゃんと撮った写真", scores: createScores({ photo: 3, grit: 1 }) },
      { text: "とりあえず無難な手持ち写真", scores: createScores({ photo: 1, grit: 1 }) },
    ],
  },
  {
    id: 4,
    question: "いいねを送る前、相手のどこを見る？",
    choices: [
      { text: "1枚目の写真の空気感", scores: createScores({ photo: 1, judge: 1 }) },
      { text: "自己紹介文の言い回し", scores: createScores({ profile: 1, judge: 3 }) },
      { text: "まずは会えそうかどうか", scores: createScores({ talk: 1, judge: 2 }) },
      { text: "送ろうと思って閉じることが多い", scores: createScores({ grit: 1 }) },
    ],
  },
  {
    id: 5,
    question: "マッチ後の1通目、実際どう送ってる？",
    choices: [
      { text: "はじめまして、よろしくお願いします", scores: createScores({ grit: 1 }) },
      { text: "相手のプロフの1点に触れる", scores: createScores({ profile: 1, talk: 3 }) },
      { text: "テンプレを少しだけ相手向けに変える", scores: createScores({ profile: 1, talk: 2, grit: 1 }) },
      { text: "相手から来るまで待つ", scores: createScores({}) },
    ],
  },
  {
    id: 6,
    question: "何往復くらいでデートに誘う？",
    choices: [
      { text: "3往復以内で日程の話をする", scores: createScores({ talk: 2, judge: 1, grit: 1 }) },
      { text: "1週間くらい話してから", scores: createScores({ talk: 1, judge: 2 }) },
      { text: "相手の返し方で変える", scores: createScores({ talk: 2, judge: 2 }) },
      { text: "タイミングを逃して止まりがち", scores: createScores({}) },
    ],
  },
  {
    id: 7,
    question: "LINE交換のタイミングは？",
    choices: [
      { text: "会う前にさっと移る", scores: createScores({ talk: 1, judge: 1, grit: 1 }) },
      { text: "日程が決まったら交換する", scores: createScores({ talk: 1, judge: 2 }) },
      { text: "初回デート後でもいい", scores: createScores({ judge: 1, grit: 1 }) },
      { text: "交換したいけど言い出せない", scores: createScores({}) },
    ],
  },
  {
    id: 8,
    question: "初デートの店、どう決める？",
    choices: [
      { text: "とりあえずカフェにする", scores: createScores({ talk: 1, grit: 1 }) },
      { text: "相手の好みに寄せる", scores: createScores({ talk: 2, judge: 1 }) },
      { text: "自分の得意店を出す", scores: createScores({ profile: 1, talk: 2 }) },
      { text: "相手任せにしがち", scores: createScores({}) },
    ],
  },
  {
    id: 9,
    question: "デート中に沈黙が来たら？",
    choices: [
      { text: "事前に用意した話題に戻す", scores: createScores({ talk: 3, grit: 1 }) },
      { text: "料理や店の話を拾う", scores: createScores({ talk: 2 }) },
      { text: "沈黙もそんなに気にしない", scores: createScores({ talk: 1, judge: 1 }) },
      { text: "焦って質問を連打する", scores: createScores({}) },
    ],
  },
  {
    id: 10,
    question: "初デート後のお礼LINE、どうなりがち？",
    choices: [
      { text: "帰り道で軽く送る", scores: createScores({ talk: 2, grit: 1 }) },
      { text: "その日のうちに次につながる一文も入れる", scores: createScores({ talk: 3, judge: 1 }) },
      { text: "相手の反応が来てから返す", scores: createScores({ judge: 1 }) },
      { text: "良かった時だけ送る", scores: createScores({}) },
    ],
  },
  {
    id: 11,
    question: "実際どこまで進みやすい？",
    choices: [
      { text: "マッチはするけど会う前に止まる", scores: createScores({ profile: 1, talk: 1 }) },
      { text: "初デートまでは行ける", scores: createScores({ talk: 2, grit: 1 }) },
      { text: "2回目3回目までは行く", scores: createScores({ talk: 2, judge: 1, grit: 1 }) },
      { text: "ちゃんと関係が続く人がたまにいる", scores: createScores({ profile: 1, photo: 1, talk: 2, judge: 2, grit: 2 }) },
    ],
  },
  {
    id: 12,
    question: "いちばん多い失速パターンは？",
    choices: [
      { text: "写真と雰囲気が違った", scores: createScores({ photo: 1, judge: 2 }) },
      { text: "メッセージが続かない", scores: createScores({ talk: 1, grit: 1 }) },
      { text: "会っても恋愛の空気にならない", scores: createScores({ talk: 2, judge: 1 }) },
      { text: "こっちが疲れてアプリを閉じる", scores: createScores({ grit: 3 }) },
    ],
  },
  {
    id: 13,
    question: "『この人ちょっと違うかも』と思うのはいつ？",
    choices: [
      { text: "会う前のメッセージ", scores: createScores({ judge: 3 }) },
      { text: "会って10分くらい", scores: createScores({ talk: 1, judge: 2 }) },
      { text: "2回目以降でじわじわ", scores: createScores({ judge: 1, grit: 1 }) },
      { text: "あまり分からず流される", scores: createScores({ grit: 1 }) },
    ],
  },
  {
    id: 14,
    question: "マッチ相手のスクショ、友達に送る？",
    choices: [
      { text: "ほぼ送らない", scores: createScores({ judge: 1 }) },
      { text: "迷った時だけ送る", scores: createScores({ profile: 1, judge: 2 }) },
      { text: "会う前はけっこう送る", scores: createScores({ talk: 1, judge: 2 }) },
      { text: "送ったあと会議が始まる", scores: createScores({ profile: 1, talk: 1, judge: 2 }) },
    ],
  },
  {
    id: 15,
    question: "アプリを開くのはどんなタイミング？",
    choices: [
      { text: "通勤か昼休みにさっと", scores: createScores({ grit: 1 }) },
      { text: "日曜夜にまとめてやる", scores: createScores({ profile: 2, grit: 1 }) },
      { text: "深夜に反省会しながら見る", scores: createScores({ judge: 1, grit: 2 }) },
      { text: "通知だけ見て閉じる", scores: createScores({}) },
    ],
  },
  {
    id: 16,
    question: "うまくいかない時、最初にいじるのは？",
    choices: [
      { text: "プロフ文", scores: createScores({ profile: 3, grit: 1 }) },
      { text: "写真", scores: createScores({ photo: 3 }) },
      { text: "送り方や誘い方", scores: createScores({ talk: 2, judge: 1 }) },
      { text: "いったん閉じて様子を見る", scores: createScores({ grit: 2 }) },
    ],
  },
];
