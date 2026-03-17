import {
  hensachiAxisLabels,
  hensachiAxisOrder,
  hensachiQuestions,
  type HensachiAxisKey,
  type HensachiQuestion,
  type HensachiScores,
} from "@/data/hensachi-questions";
import {
  hensachiBands,
  type HensachiBand,
} from "@/data/hensachi-results";

export interface HensachiAxisInfo {
  code: HensachiAxisKey;
  label: string;
  hensachi: number;
  comment: string;
  rawScore?: number;
  maxPossible?: number;
}

export interface HensachiAnswerSnapshot {
  questionId: number;
  questionText: string;
  choiceIndex: number;
  choiceText: string;
  scores: HensachiScores;
  contribution: number;
  inference: string;
}

export interface HensachiDiagnosisResult {
  axes: Record<HensachiAxisKey, number>;
  axisDetails: HensachiAxisInfo[];
  axisComments: Record<HensachiAxisKey, string>;
  totalHensachi: number;
  topPercent: number;
  title: string;
  nickname: string;
  color: string;
  comment: string;
  summary: string;
  band: HensachiBand;
  answerIndexes?: number[];
  answerSignature?: string;
  answerSnapshots?: HensachiAnswerSnapshot[];
}

export type HensachiSearchParams = Record<string, string | string[] | undefined>;

export const hensachiAxisQueryKeys: Record<HensachiAxisKey, string> = {
  profile: "p",
  photo: "ph",
  talk: "t",
  judge: "j",
  grit: "g",
};

const hensachiAnswerSignatureKey = "a";

const hensachiAxisCommentTemplates: Record<
  HensachiAxisKey,
  [high: string, upperMid: string, lowerMid: string, low: string]
> = {
  profile: [
    "1通目で何を送るか、相手が迷いにくいプロフです",
    "無難には強い帯。休日の1行を足すと残りやすい",
    "いい人止まりしやすい帯。固有名詞を1つ入れると動きます",
    "冒頭2行が薄くなりやすい帯。人柄が出る話を先に置くと強い",
  ],
  photo: [
    "一覧で止まる写真がある帯。会う前の不安も減らせています",
    "雰囲気は出ています。自然光の他撮り1枚でかなり伸びます",
    "悪くないけど埋もれやすい帯。自撮り感を消す1枚が効きます",
    "写真で判断される場では埋もれやすい帯。屋外の他撮りが近道です",
  ],
  talk: [
    "初回デート後の『また行こう』につながりやすい会話運びです",
    "会話は続く帯。返答の中の固有名詞を拾うと印象が残ります",
    "質問が面接っぽくなりやすい帯。店や食べ物の話が助けになります",
    "話題探しで消耗しやすい帯。最初の1通の型があるとかなり楽です",
  ],
  judge: [
    "会う前の温度感のズレを拾える帯。時間を溶かしにくい目です",
    "違和感には気づける帯。その感覚を流さないほど強くなります",
    "保留が増えやすい帯。2回目に進める基準を先に決めると楽です",
    "会うか迷って長引きやすい帯。初回で見る点を2つに絞るとぶれません",
  ],
  grit: [
    "既読スルーが続いても、自分のペースへ戻ってこられる帯です",
    "波はあっても続けられる帯。疲れた週の最低ラインが効きます",
    "反応が鈍い時期に削られやすい帯。休会の線引きがあると続きます",
    "一気に頑張って止まりやすい帯。週2で開く設計くらいがちょうどいい",
  ],
};

type HensachiAxisCommentRule = {
  when: (answers: number[], score: number) => boolean;
  comment: string;
};

const hensachiAxisCommentRules: Record<HensachiAxisKey, HensachiAxisCommentRule[]> = {
  profile: [
    {
      when: (answers) => answers[1] === 2 && answers[4] === 1,
      comment: "友達チェックと1通目の拾い方がある。文でちゃんと差が出ています",
    },
    {
      when: (answers) => answers[1] === 2,
      comment: "友達に見せるところまでやる人。プロフを武器として使えています",
    },
    {
      when: (answers) => answers[1] === 1,
      comment: "休日や仕事終わりを書ける人。会う前の人柄がちゃんと見えます",
    },
    {
      when: (answers) => answers[1] === 0 && answers[4] === 0,
      comment: "文も1通目も無難寄り。冒頭2行の生活感を足すと残りやすいです",
    },
    {
      when: (answers) => answers[1] === 3,
      comment: "直しすぎると無難に寄りやすい帯。先頭2行だけ決めると締まります",
    },
    {
      when: (answers) => answers[15] === 0,
      comment: "うまくいかない時に文から直す人。改善の勘所はかなり合っています",
    },
  ],
  photo: [
    {
      when: (answers) => answers[2] === 2,
      comment: "アプリ用に撮る発想がある時点で強い。写真で落ちにくいです",
    },
    {
      when: (answers) => answers[2] === 1,
      comment: "友達撮りがある人は実物が想像しやすく、会う前でかなり得しています",
    },
    {
      when: (answers) => answers[2] === 0,
      comment: "盛れ写真寄りだと初回の期待が上がりやすい帯。自然な1枚が効きます",
    },
    {
      when: (answers) => answers[2] === 3,
      comment: "無難な手持ちだと一覧で止まりにくい帯。他撮り1枚が近道です",
    },
    {
      when: (answers) => answers[11] === 0,
      comment: "写真ギャップのしんどさを知ってる人。自分の写真選びにも効かせたい帯です",
    },
    {
      when: (answers) => answers[15] === 1,
      comment: "反応が鈍い時に写真から触る人。改善の順番としてかなり正解です",
    },
  ],
  talk: [
    {
      when: (answers) => answers[4] === 1 && answers[8] === 0,
      comment: "1通目の拾い方と話題ストックがある。初回デートでかなり崩れにくいです",
    },
    {
      when: (answers) => answers[4] === 1,
      comment: "1通目で相手の文を拾える人。会話の初速はちゃんと作れています",
    },
    {
      when: (answers) => answers[7] === 1 || answers[7] === 2,
      comment: "店選びも会話に変えられる人。初対面の空気を作りやすいです",
    },
    {
      when: (answers) => answers[8] === 1,
      comment: "料理や店から拾える人は、沈黙を自然に埋めやすいです",
    },
    {
      when: (answers) => answers[9] === 1,
      comment: "お礼LINEを次につなげられる人。2回目へ進む導線があります",
    },
    {
      when: (answers) => answers[8] === 3,
      comment: "質問連打になりやすい帯。店や食べ物の話へ逃がすとかなり楽です",
    },
    {
      when: (answers) => answers[4] === 3,
      comment: "待ちに回ると会話の主導権が来にくい帯。最初の一言だけ決めると動きます",
    },
  ],
  judge: [
    {
      when: (answers) => answers[12] === 0 && answers[3] === 1,
      comment: "文の癖から違和感を拾える人。会う前の事故率がかなり低いです",
    },
    {
      when: (answers) => answers[12] === 0,
      comment: "メッセージ段階で違和感を拾える人。時間を溶かしにくい目です",
    },
    {
      when: (answers) => answers[5] === 2,
      comment: "温度感で誘うタイミングを変えられる人。見極めもぶれにくいです",
    },
    {
      when: (answers) => answers[12] === 1,
      comment: "会って10分で空気のズレを見られる人。初回の見極めは速いです",
    },
    {
      when: (answers) => answers[12] === 2,
      comment: "『もう少し会えば』が増える帯。初回で見る点を2つ決めると楽です",
    },
    {
      when: (answers) => answers[12] === 3,
      comment: "違和感を流しやすい帯。帰り道の3行メモがかなり効きます",
    },
    {
      when: (answers) => answers[13] === 2 || answers[13] === 3,
      comment: "会う前に友達の目を借りる人。判断の事故率をかなり下げられます",
    },
  ],
  grit: [
    {
      when: (answers) => answers[11] === 3 && (answers[14] === 2 || answers[14] === 3),
      comment: "削られる時期を知ってる人。休んで戻る前提ならかなり強いです",
    },
    {
      when: (answers) => answers[10] === 3,
      comment: "ちゃんと続く相手が出ている帯。打席を切らさない強さがあります",
    },
    {
      when: (answers) => answers[14] === 1,
      comment: "日曜夜にまとめて回せる人。続く人の運用ができています",
    },
    {
      when: (answers) => answers[14] === 2,
      comment: "深夜の反省会で削れやすい帯。開く曜日を決めると持ち直しやすいです",
    },
    {
      when: (answers) => answers[11] === 3,
      comment: "相手より先に電池が切れやすい帯。休会の線引きがあると続きます",
    },
    {
      when: (answers) => answers[15] === 3,
      comment: "閉じて戻る人。やめ切らない時点で継続力はちゃんと残っています",
    },
    {
      when: (answers) => answers[14] === 3,
      comment: "通知だけ見て閉じる日が増える帯。開く日を先に決めるほうが楽です",
    },
  ],
};

const hensachiAnswerInferences: string[][] = [
  [
    "ちゃんと好きになれるかを見たいので、会うまでの空気感を大事にしがちです",
    "目的がはっきりしているので、相手選びがぶれにくいです",
    "まず会って確かめる前提で、テンポを重視しがちです",
    "必要に迫られて始めた分、型を探りながら使っている時期です",
  ],
  [
    "プロフ文は一度置くと触らなくなりがちです",
    "生活感のある一文で人柄を出そうとしがちです",
    "友達にスクショを送りながら整えがちです",
    "書き直すほど正解が遠く見えがちです",
  ],
  [
    "写りで押し切ろうとして、会う前の期待が上がりやすいです",
    "実物の雰囲気が伝わる写真を選べる人です",
    "写真を戦略物としてちゃんと扱えています",
    "とりあえず感が残って、一覧で埋もれやすいです",
  ],
  [
    "写真の空気感で最初の足切りをしがちです",
    "自己紹介文の癖から相手像をかなり読みます",
    "会えるかどうかの温度感を先に見がちです",
    "気になっても打席に立つ前に閉じがちです",
  ],
  [
    "最初の一通は礼儀重視で入ることが多いです",
    "一通目から相手の文を拾って差をつけがちです",
    "型を持ちつつ相手仕様に寄せられる人です",
    "まず待って空気を見ることが多いです",
  ],
  [
    "会話が温まる前に日程を切るのが得意です",
    "安心感ができてから会う流れを作りがちです",
    "相手の温度感で誘うタイミングを変えがちです",
    "誘いどころを逃して流れが止まりがちです",
  ],
  [
    "会う前に場を移してテンポを作りがちです",
    "日程が固まったら移る堅実な動き方です",
    "会ってから判断する分、慎重に進めがちです",
    "交換の一言が重く感じやすいです",
  ],
  [
    "まずは安全なカフェで様子を見がちです",
    "相手に合わせて店選びまで会話に変えられます",
    "自分の得意店で空気を作りがちです",
    "店決めを相手任せにして流れが弱まりがちです",
  ],
  [
    "会話ネタを仕込んで臨む準備型です",
    "目の前の情報から自然に話題を拾えます",
    "沈黙そのものに飲まれにくいです",
    "沈黙を埋めようとして質問過多になりがちです",
  ],
  [
    "その日のうちに最低限の熱量は返せる人です",
    "お礼LINEを次の打診までつなげられる人です",
    "相手の反応を見てから熱量を合わせがちです",
    "気分で送るか決めるので波が出やすいです",
  ],
  [
    "会う前のどこかで失速しやすい流れです",
    "初デートまでは作れているので入口はあります",
    "2回目までは進むので、あと一押しの段階です",
    "ちゃんと続く相手を引ける時期に入っています",
  ],
  [
    "会ってからの写真ギャップに敏感です",
    "メッセージのラリーで消耗しやすいです",
    "会えても恋愛の空気に乗らない時期です",
    "相手より先に自分の電池が切れやすいです",
  ],
  [
    "メッセージ段階で違和感を拾いやすい目です",
    "会ってすぐの空気でズレに気づきやすいです",
    "2回目以降でじわじわ判断するタイプです",
    "違和感を言語化する前に流しがちです",
  ],
  [
    "人に聞かず、自分の感覚で進めることが多いです",
    "迷った時だけ友達の目を借りる堅実派です",
    "会う前の相談を入れて事故率を下げがちです",
    "スクショを送ったあと会議が始まるタイプです",
  ],
  [
    "生活の隙間で淡々と回すタイプです",
    "日曜夜にまとめて整える、定例運用型です",
    "深夜に反省会をして消耗しやすいです",
    "通知だけ見て閉じる日が増えがちです",
  ],
  [
    "結果が動かないと、まず文面を触りがちです",
    "写真を差し替えて反応の変化を見ようとします",
    "送り方や誘い方を調整して打率を上げにいく人です",
    "いったん離れて気持ちを戻してから再開しがちです",
  ],
];

type HensachiNicknameRule = {
  label: string;
  score: (answerIndexes: number[], axes: Record<HensachiAxisKey, number>) => number;
};

const hensachiNicknameRules: HensachiNicknameRule[] = [
  {
    label: "スクショ会議の議長",
    score: (answers, axes) => (answers[13] === 3 ? 8 : 0) + (answers[1] === 2 ? 2 : 0) + (axes.judge >= 60 ? 2 : 0),
  },
  {
    label: "プロフ文添削マニア",
    score: (answers, axes) =>
      (answers[1] === 3 ? 6 : 0) + (answers[15] === 0 ? 3 : 0) + (axes.profile >= 65 ? 2 : 0),
  },
  {
    label: "日曜夜のプロフ職人",
    score: (answers, axes) =>
      (answers[14] === 1 ? 6 : 0) + (answers[1] === 1 || answers[1] === 2 || answers[1] === 3 ? 2 : 0) + (axes.profile >= 55 ? 2 : 0),
  },
  {
    label: "既読タイミング計算機",
    score: (answers, axes) =>
      (answers[5] === 2 ? 4 : 0) + (answers[9] === 2 ? 3 : 0) + (answers[6] === 1 ? 1 : 0) + (axes.judge >= 60 ? 2 : 0),
  },
  {
    label: "いいね砲台",
    score: (answers, axes) =>
      (answers[0] === 0 || answers[0] === 2 ? 2 : 0) + (answers[5] === 0 ? 4 : 0) + (answers[10] >= 1 ? 2 : 0) + (axes.talk >= 60 ? 1 : 0),
  },
  {
    label: "初デートの鬼",
    score: (answers, axes) => (answers[5] === 0 ? 6 : 0) + (answers[10] === 1 || answers[10] === 2 ? 2 : 0) + (axes.talk >= 65 ? 1 : 0),
  },
  {
    label: "右スワイプの達人",
    score: (answers, axes) => (answers[3] === 0 ? 5 : 0) + (answers[2] === 0 ? 2 : 0) + (axes.photo >= 55 ? 2 : 0),
  },
  {
    label: "土日のダブルヘッダー",
    score: (answers, axes) => (answers[5] === 0 ? 4 : 0) + (answers[7] === 2 ? 3 : 0) + (answers[10] >= 2 ? 2 : 0),
  },
  {
    label: "アプリ開くだけ勢",
    score: (answers) => (answers[3] === 3 ? 4 : 0) + (answers[14] === 3 ? 4 : 0) + (answers[10] === 0 ? 2 : 0),
  },
  {
    label: "月額課金の置物",
    score: (answers, axes) => (answers[14] === 3 ? 3 : 0) + (answers[11] === 3 ? 3 : 0) + (answers[15] === 3 ? 2 : 0) + (axes.grit >= 55 ? 1 : 0),
  },
  {
    label: "\"また今度\"のプロ",
    score: (answers) => (answers[5] === 3 ? 7 : 0) + (answers[6] === 3 ? 2 : 0),
  },
  {
    label: "通知オフの住人",
    score: (answers, axes) => (answers[14] === 3 ? 7 : 0) + (answers[11] === 3 ? 2 : 0) + (answers[15] === 3 ? 1 : 0) + (axes.grit >= 65 ? 1 : 0),
  },
  {
    label: "婚活のフリーランス",
    score: (answers, axes) =>
      (answers[0] === 0 ? 2 : 0) + (answers[14] === 0 ? 2 : 0) + (answers[7] === 2 ? 2 : 0) + (axes.grit >= 60 ? 2 : 0),
  },
  {
    label: "条件断捨離の達人",
    score: (answers, axes) => (answers[0] === 1 ? 2 : 0) + (answers[3] === 1 ? 3 : 0) + (answers[12] <= 1 ? 2 : 0) + (axes.judge >= 60 ? 2 : 0),
  },
  {
    label: "アプリ歴だけベテラン",
    score: (answers, axes) => (answers[10] === 3 ? 3 : 0) + (answers[11] === 3 ? 2 : 0) + (answers[14] === 2 ? 2 : 0) + (axes.grit >= 65 ? 3 : 0),
  },
  {
    label: "縁を待てる人",
    score: (answers, axes) => (answers[6] === 2 ? 3 : 0) + (answers[9] === 2 ? 2 : 0) + (answers[0] === 1 ? 2 : 0) + (axes.grit >= 65 ? 2 : 0),
  },
  {
    label: "戦略家なのに直感派",
    score: (answers, axes) => (answers[3] === 1 ? 3 : 0) + (answers[12] === 1 ? 3 : 0) + (answers[7] === 2 ? 1 : 0) + (axes.judge >= 55 ? 2 : 0),
  },
  {
    label: "休会と復帰のサイクラー",
    score: (answers, axes) => (answers[11] === 3 ? 4 : 0) + (answers[14] >= 2 ? 4 : 0) + (answers[15] === 3 ? 2 : 0),
  },
  {
    label: "いいね温存派",
    score: (answers, axes) =>
      (answers[3] === 1 || answers[3] === 2 ? 3 : 0) + (answers[5] === 1 || answers[5] === 2 ? 3 : 0) + (axes.judge >= 60 ? 3 : 0),
  },
  {
    label: "カフェ巡りデートの常連",
    score: (answers, axes) => (answers[7] === 0 ? 5 : 0) + (answers[5] === 1 || answers[5] === 2 ? 2 : 0) + (axes.talk >= 60 ? 2 : 0),
  },
];

const hensachiFallbackNicknameByAxis: Record<HensachiAxisKey, string> = {
  profile: "日曜夜のプロフ職人",
  photo: "右スワイプの達人",
  talk: "初デートの鬼",
  judge: "いいね温存派",
  grit: "アプリ歴だけベテラン",
};

const hensachiImprovementActions: Record<HensachiAxisKey, string> = {
  profile: "冒頭2行に固有名詞を1つ置いてみて",
  photo: "友達に自然光で1枚だけ撮ってもらって",
  talk: "会う前に最初の1通だけ先に決めてみて",
  judge: "次の3人は2回目まで保留で見てみて",
  grit: "休む日を決めて、戻る前提で使ってみて",
};

function createEmptyScores(): HensachiScores {
  return {
    profile: 0,
    photo: 0,
    talk: 0,
    judge: 0,
    grit: 0,
  };
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clipText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength)}…`;
}

function getAxisComment(axis: HensachiAxisKey, score: number) {
  const [high, upperMid, lowerMid, low] = hensachiAxisCommentTemplates[axis];

  if (score >= 80) {
    return high;
  }

  if (score >= 60) {
    return upperMid;
  }

  if (score >= 40) {
    return lowerMid;
  }

  return low;
}

function getAnswerDrivenAxisComment(axis: HensachiAxisKey, score: number, answerIndexes: number[]) {
  const matchedRule = hensachiAxisCommentRules[axis].find((rule) => rule.when(answerIndexes, score));
  return matchedRule?.comment ?? getAxisComment(axis, score);
}

function buildAxisComments(axes: Record<HensachiAxisKey, number>, answerIndexes?: number[]) {
  return hensachiAxisOrder.reduce<Record<HensachiAxisKey, string>>((acc, axis) => {
    acc[axis] = answerIndexes ? getAnswerDrivenAxisComment(axis, axes[axis], answerIndexes) : getAxisComment(axis, axes[axis]);
    return acc;
  }, {} as Record<HensachiAxisKey, string>);
}

export function clampHensachi(value: number) {
  return Math.max(25, Math.min(80, Math.round(value)));
}

export function calculateHensachiRawScores(answerIndexes: number[]) {
  return hensachiQuestions.reduce<HensachiScores>((totals, question, questionIndex) => {
    const choiceIndex = answerIndexes[questionIndex];
    const choice = question.choices[choiceIndex];

    if (!choice) {
      return totals;
    }

    return hensachiAxisOrder.reduce<HensachiScores>((next, axis) => {
      next[axis] += choice.scores[axis];
      return next;
    }, { ...totals });
  }, createEmptyScores());
}

function calculateAxisMaximums(questions: HensachiQuestion[]) {
  return questions.reduce<HensachiScores>((totals, question) => {
    return hensachiAxisOrder.reduce<HensachiScores>((next, axis) => {
      const maxScore = Math.max(...question.choices.map((choice) => choice.scores[axis]));
      next[axis] += maxScore;
      return next;
    }, { ...totals });
  }, createEmptyScores());
}

export const hensachiAxisMaximums = calculateAxisMaximums(hensachiQuestions);

export function toHensachi(rawScore: number, maxPossible: number) {
  if (maxPossible <= 0) {
    return 50;
  }

  const scaled = (rawScore / maxPossible) * 100;
  const hensachi = Math.round(25 + (scaled / 100) * 55);
  return clampHensachi(hensachi);
}

export function getAxisHensachiScores(rawScores: HensachiScores) {
  return hensachiAxisOrder.reduce<Record<HensachiAxisKey, number>>((acc, axis) => {
    acc[axis] = toHensachi(rawScores[axis], hensachiAxisMaximums[axis]);
    return acc;
  }, {} as Record<HensachiAxisKey, number>);
}

export function getTotalHensachi(axes: Record<HensachiAxisKey, number>) {
  const values = Object.values(axes);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(avg);
}

function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * abs);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs);
  return sign * y;
}

function normalCdf(z: number) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export function hensachiToTopPercent(score: number) {
  const z = (score - 50) / 10;
  return Math.max(0.1, Math.round((1 - normalCdf(z)) * 1000) / 10);
}

export function getHensachiBand(totalHensachi: number) {
  return (
    hensachiBands.find((band) => totalHensachi >= band.min && totalHensachi <= band.max) ??
    hensachiBands[hensachiBands.length - 1]
  );
}

function getSortedAxisDetails(axisDetails: HensachiAxisInfo[]) {
  return [...axisDetails].sort((left, right) => {
    const diff = right.hensachi - left.hensachi;
    if (diff !== 0) {
      return diff;
    }

    return hensachiAxisOrder.indexOf(left.code) - hensachiAxisOrder.indexOf(right.code);
  });
}

function buildAnswerSnapshots(answerIndexes: number[]) {
  return answerIndexes.flatMap((choiceIndex, questionIndex) => {
    const question = hensachiQuestions[questionIndex];
    const choice = question?.choices[choiceIndex];

    if (!question || !choice) {
      return [];
    }

    return [
      {
        questionId: question.id,
        questionText: question.question,
        choiceIndex,
        choiceText: choice.text,
        scores: choice.scores,
        contribution: hensachiAxisOrder.reduce((sum, axis) => sum + choice.scores[axis], 0),
        inference: hensachiAnswerInferences[questionIndex]?.[choiceIndex] ?? "使い方の癖がそのまま出ています",
      },
    ];
  });
}

function serializeChoiceSignature(answerIndexes?: number[]) {
  if (!answerIndexes || answerIndexes.length !== hensachiQuestions.length) {
    return null;
  }

  const isValid = answerIndexes.every((choiceIndex) => Number.isInteger(choiceIndex) && choiceIndex >= 0 && choiceIndex <= 3);
  return isValid ? answerIndexes.join("") : null;
}

export function parseHensachiAnswerSignature(value: string | string[] | undefined) {
  const raw = getSingleValue(value)?.trim() ?? "";
  if (!raw || raw.length !== hensachiQuestions.length || !/^[0-3]+$/.test(raw)) {
    return null;
  }

  return raw.split("").map((digit) => Number(digit));
}

function getTopAnswerSnapshots(
  answerSnapshots: HensachiAnswerSnapshot[],
  bestAxis: HensachiAxisInfo,
  worstAxis: HensachiAxisInfo
) {
  return [...answerSnapshots]
    .sort((left, right) => {
      const leftScore = left.contribution + left.scores[bestAxis.code] + left.scores[worstAxis.code];
      const rightScore = right.contribution + right.scores[bestAxis.code] + right.scores[worstAxis.code];
      return rightScore - leftScore;
    })
    .slice(0, 2);
}

function getQuestionTypeNickname(answerIndexes: number[], axes: Record<HensachiAxisKey, number>) {
  const winner = [...hensachiNicknameRules].sort((left, right) => right.score(answerIndexes, axes) - left.score(answerIndexes, axes))[0];

  if (winner && winner.score(answerIndexes, axes) > 0) {
    return winner.label;
  }

  const strongestAxis = hensachiAxisOrder.reduce((best, axis) => (axes[axis] > axes[best] ? axis : best), hensachiAxisOrder[0]);
  return hensachiFallbackNicknameByAxis[strongestAxis];
}

function getAxesOnlyNickname(axes: Record<HensachiAxisKey, number>) {
  const sortedAxes = [...hensachiAxisOrder].sort((left, right) => axes[right] - axes[left]);

  if (axes.grit <= 40 && axes.talk <= 45) {
    return "アプリ開くだけ勢";
  }

  if (axes.judge >= 60 && axes.profile >= 55) {
    return "いいね温存派";
  }

  return hensachiFallbackNicknameByAxis[sortedAxes[0]];
}

function getSummaryClosing(totalHensachi: number) {
  if (totalHensachi >= 65) {
    return "打席はもう足りています。";
  }

  if (totalHensachi >= 55) {
    return "あと1科目で景色が変わります。";
  }

  if (totalHensachi >= 45) {
    return "まだ試してないカードが効く段階です。";
  }

  return "やり方を替える余白がまだ大きいです。";
}

function buildAnswerDrivenSummary(
  axisDetails: HensachiAxisInfo[],
  totalHensachi: number,
  answerSnapshots?: HensachiAnswerSnapshot[]
) {
  const sorted = getSortedAxisDetails(axisDetails);
  const best = sorted[0];
  const worst = [...sorted].reverse().find((axis) => axis.code !== best.code) ?? sorted[sorted.length - 1];

  if (!answerSnapshots || answerSnapshots.length === 0) {
    return [
      `${best.label}は高め。でも${worst.label}はまだ余白。`,
      `今の偏差値は、得意科目で前に出ている形です。`,
      `${hensachiImprovementActions[worst.code]}。`,
      getSummaryClosing(totalHensachi),
    ].join("\n");
  }

  const [first, second] = getTopAnswerSnapshots(answerSnapshots, best, worst);
  const firstChoice = first ? clipText(first.choiceText, 16) : "この選び方";
  const secondChoice = second ? clipText(second.choiceText, 16) : "今の流れ";

  return [
    `${best.label}は高め。でも${worst.label}はまだ余白。`,
    `「${firstChoice}」を選ぶ人は、${first?.inference ?? "使い方の癖がそのまま出ます"}。`,
    `「${secondChoice}」寄りなら、${hensachiImprovementActions[worst.code]}。`,
    getSummaryClosing(totalHensachi),
  ].join("\n");
}

function buildHensachiCoachComment(axisDetails: HensachiAxisInfo[], totalHensachi: number) {
  const sorted = getSortedAxisDetails(axisDetails);
  const best = sorted[0];
  const worst = [...sorted].reverse().find((axis) => axis.code !== best.code) ?? sorted[sorted.length - 1];

  if (totalHensachi >= 60) {
    return `偏差値${totalHensachi}なら、もう土台はあります。${best.label}で取れているので、次は${worst.label}に1手だけ足したほうが伸びが早いです。${hensachiImprovementActions[worst.code]}。`;
  }

  if (totalHensachi >= 50) {
    return `偏差値${totalHensachi}は、普通に戦えるレンジです。全部を直すより、${best.label}を残したまま${worst.label}の1手を入れるほうが効きます。${hensachiImprovementActions[worst.code]}。`;
  }

  if (totalHensachi >= 40) {
    return `偏差値${totalHensachi}は、やり方の差がそのまま数字になる帯です。${best.label}は消えていないので、作戦を増やすなら${worst.label}からでいいです。${hensachiImprovementActions[worst.code]}。`;
  }

  return `今は作戦を替えると伸びやすい帯です。${worst.label}にまだ試していないカードが残っています。${hensachiImprovementActions[worst.code]}。`;
}

export function getAxisDetails(
  axes: Record<HensachiAxisKey, number>,
  axisComments: Record<HensachiAxisKey, string>,
  rawScores?: HensachiScores
): HensachiAxisInfo[] {
  return hensachiAxisOrder.map((axis) => ({
    code: axis,
    label: hensachiAxisLabels[axis],
    hensachi: axes[axis],
    comment: axisComments[axis],
    rawScore: rawScores?.[axis],
    maxPossible: rawScores ? hensachiAxisMaximums[axis] : undefined,
  }));
}

export function buildHensachiResult(
  axes: Record<HensachiAxisKey, number>,
  options?: {
    rawScores?: HensachiScores;
    answerIndexes?: number[];
  }
): HensachiDiagnosisResult {
  const axisComments = buildAxisComments(axes, options?.answerIndexes);
  const axisDetails = getAxisDetails(axes, axisComments, options?.rawScores);
  const totalHensachi = getTotalHensachi(axes);
  const band = getHensachiBand(totalHensachi);
  const answerSnapshots = options?.answerIndexes ? buildAnswerSnapshots(options.answerIndexes) : undefined;

  return {
    axes,
    axisComments,
    axisDetails,
    totalHensachi,
    topPercent: hensachiToTopPercent(totalHensachi),
    title: band.title,
    nickname: options?.answerIndexes ? getQuestionTypeNickname(options.answerIndexes, axes) : getAxesOnlyNickname(axes),
    color: band.color,
    comment: buildHensachiCoachComment(axisDetails, totalHensachi),
    summary: buildAnswerDrivenSummary(axisDetails, totalHensachi, answerSnapshots),
    band,
    answerIndexes: options?.answerIndexes,
    answerSignature: serializeChoiceSignature(options?.answerIndexes) ?? undefined,
    answerSnapshots,
  };
}

export function diagnoseHensachiAnswers(answerIndexes: number[]) {
  const rawScores = calculateHensachiRawScores(answerIndexes);
  const axes = getAxisHensachiScores(rawScores);

  return {
    rawScores,
    ...buildHensachiResult(axes, {
      rawScores,
      answerIndexes,
    }),
  };
}

export function parseHensachiAxesFromSearchParams(searchParams: HensachiSearchParams) {
  return hensachiAxisOrder.reduce<Record<HensachiAxisKey, number>>((axes, axis) => {
    const key = hensachiAxisQueryKeys[axis];
    const rawValue = Number(getSingleValue(searchParams[key]));

    axes[axis] = Number.isFinite(rawValue) ? clampHensachi(rawValue) : 50;
    return axes;
  }, {} as Record<HensachiAxisKey, number>);
}

export function buildHensachiResultFromSearchParams(searchParams: HensachiSearchParams) {
  const answerIndexes = parseHensachiAnswerSignature(searchParams[hensachiAnswerSignatureKey]);
  if (answerIndexes) {
    return diagnoseHensachiAnswers(answerIndexes);
  }

  const axes = parseHensachiAxesFromSearchParams(searchParams);
  return buildHensachiResult(axes);
}

export function serializeHensachiAxes(axes: Record<HensachiAxisKey, number>, answerIndexes?: number[]) {
  const params = new URLSearchParams();

  hensachiAxisOrder.forEach((axis) => {
    params.set(hensachiAxisQueryKeys[axis], String(clampHensachi(axes[axis])));
  });

  const signature = serializeChoiceSignature(answerIndexes);
  if (signature) {
    params.set(hensachiAnswerSignatureKey, signature);
  }

  return params.toString();
}
