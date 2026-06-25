export type FatigueReasonType =
  | "reset"
  | "fastJudgment"
  | "wrongPeople"
  | "purposeFirst"
  | "overAdjusting"
  | "placeMismatch"
  | "profileInvisible"
  | "stagedFatigue";

export type FatigueAnswerValue = "very" | "somewhat" | "neutral" | "notMuch" | "none";

export type FatigueAnswerOption = {
  value: FatigueAnswerValue;
  label: string;
};

type ScoreItem = {
  type: FatigueReasonType;
  points: number;
};

export type FatigueReasonQuestion = {
  id: number;
  text: string;
  scores: Partial<Record<FatigueAnswerValue, ScoreItem[]>>;
};

export type FatigueReasonCta = {
  title: string;
  text: string;
  button: string;
};

export type FatigueReasonResult = {
  type: FatigueReasonType;
  name: string;
  catchCopy: string;
  reason: string[];
  commonStates: string[];
  stopTrying: string[];
  reviewPoints: string[];
  meetingHints: string[];
  nextStep: string;
  cta: FatigueReasonCta;
};

export type FatigueReasonFactor = {
  type: FatigueReasonType;
  score: number;
  normalizedScore: number;
  result: FatigueReasonResult;
};

export type FatigueReasonActionGuide = {
  shortReason: string;
  reviewActions: string[];
  suitedMeetings: string[];
  drainingMeetings: string[];
};

export const FATIGUE_ANSWER_OPTIONS: FatigueAnswerOption[] = [
  { value: "very", label: "とても当てはまる" },
  { value: "somewhat", label: "やや当てはまる" },
  { value: "neutral", label: "どちらともいえない" },
  { value: "notMuch", label: "あまり当てはまらない" },
  { value: "none", label: "ほとんど当てはまらない" },
];

export const FATIGUE_REASON_TYPE_ORDER: FatigueReasonType[] = [
  "fastJudgment",
  "wrongPeople",
  "purposeFirst",
  "profileInvisible",
  "placeMismatch",
  "overAdjusting",
  "stagedFatigue",
  "reset",
];

export const FATIGUE_REASON_CAUSE_TYPE_ORDER: FatigueReasonType[] = FATIGUE_REASON_TYPE_ORDER.filter((type) => type !== "reset");

const TIE_BREAK_PRIORITY: FatigueReasonType[] = [
  "fastJudgment",
  "wrongPeople",
  "purposeFirst",
  "overAdjusting",
  "placeMismatch",
  "profileInvisible",
  "stagedFatigue",
  "reset",
];

const consultationCta: FatigueReasonCta = {
  title: "婚活のしんどさを、個別に整理したい人へ",
  text:
    "今の婚活がどこでしんどくなっているのか、マチアプ、相談所、紹介、SNS、外飲みまで含めて、無理しない出会い方を一緒に考えます。",
  button: "婚活の見直し相談を見る",
};

const profileCta: FatigueReasonCta = {
  title: "合わない人が入りすぎているかもと思った人へ",
  text: "文章・写真・並びを見直して、あなたと合う人に届く入口を整えます。",
  button: "あなたと合う人に届くプロフィール添削を見る",
};

const resetCta: FatigueReasonCta = {
  title: "一度話して終わりではなく、動いた後の迷いまで整えたい人へ",
  text: "1回目で整理して、2回目で婚活を自分に合う形へ戻していきます。",
  button: "2回セットを見る",
};

export const FATIGUE_REASON_QUESTIONS: FatigueReasonQuestion[] = [
  {
    id: 1,
    text: "マチアプで会う予定が入ると、楽しみより先に少し気が重くなる",
    scores: {
      very: [
        { type: "fastJudgment", points: 3 },
        { type: "reset", points: 1 },
      ],
      somewhat: [{ type: "fastJudgment", points: 2 }],
    },
  },
  {
    id: 2,
    text: "会った相手が悪い人ではないのに、次に会う理由が見つからない",
    scores: {
      very: [{ type: "fastJudgment", points: 3 }],
      somewhat: [{ type: "fastJudgment", points: 2 }],
    },
  },
  {
    id: 3,
    text: "3回くらい会っただけでは、好きになれるか分からない",
    scores: {
      very: [{ type: "fastJudgment", points: 3 }],
      somewhat: [{ type: "fastJudgment", points: 2 }],
    },
  },
  {
    id: 4,
    text: "会う前のメッセージの段階で疲れてしまう",
    scores: {
      very: [
        { type: "fastJudgment", points: 2 },
        { type: "reset", points: 1 },
      ],
      somewhat: [{ type: "fastJudgment", points: 2 }],
    },
  },
  {
    id: 5,
    text: "いいねは来るけど、会いたいと思う人からはあまり来ない",
    scores: {
      very: [{ type: "wrongPeople", points: 3 }],
      somewhat: [{ type: "wrongPeople", points: 2 }],
    },
  },
  {
    id: 6,
    text: "プロフィールをちゃんと読んでいない人からアプローチされることが多い",
    scores: {
      very: [{ type: "wrongPeople", points: 3 }],
      somewhat: [{ type: "wrongPeople", points: 2 }],
    },
  },
  {
    id: 7,
    text: "自分の結婚観や生活観が、条件欄だけでは伝わりにくいと感じる",
    scores: {
      very: [
        { type: "wrongPeople", points: 2 },
        { type: "profileInvisible", points: 1 },
      ],
      somewhat: [{ type: "wrongPeople", points: 2 }],
    },
  },
  {
    id: 8,
    text: "「いい人だけど決め手がない」で止まることが多い",
    scores: {
      very: [{ type: "purposeFirst", points: 3 }],
      somewhat: [{ type: "purposeFirst", points: 2 }],
    },
  },
  {
    id: 9,
    text: "どんな人がいいかを考える前に、なぜ結婚したいのかを整理できていない気がする",
    scores: {
      very: [{ type: "purposeFirst", points: 3 }],
      somewhat: [{ type: "purposeFirst", points: 2 }],
    },
  },
  {
    id: 10,
    text: "相談所に入るか迷っているが、自分に合うのか不安がある",
    scores: {
      very: [
        { type: "purposeFirst", points: 2 },
        { type: "profileInvisible", points: 1 },
      ],
      somewhat: [{ type: "purposeFirst", points: 2 }],
    },
  },
  {
    id: 11,
    text: "プロフィールや条件だけで判断されると、自分の良さが伝わりにくい",
    scores: {
      very: [{ type: "profileInvisible", points: 3 }],
      somewhat: [{ type: "profileInvisible", points: 2 }],
    },
  },
  {
    id: 12,
    text: "場の中での振る舞いや人柄を見てもらえたほうが、自分らしさが出る",
    scores: {
      very: [{ type: "profileInvisible", points: 3 }],
      somewhat: [{ type: "profileInvisible", points: 2 }],
    },
  },
  {
    id: 13,
    text: "アプリでは関係を進めやすいが、気持ちは深まりにくい",
    scores: {
      very: [
        { type: "placeMismatch", points: 3 },
        { type: "profileInvisible", points: 1 },
      ],
      somewhat: [{ type: "placeMismatch", points: 2 }],
    },
  },
  {
    id: 14,
    text: "コミュニティや趣味の場では好きになりやすいが、踏み込むのが難しい",
    scores: {
      very: [{ type: "placeMismatch", points: 3 }],
      somewhat: [{ type: "placeMismatch", points: 2 }],
    },
  },
  {
    id: 15,
    text: "相手がどう思っているかを考えすぎて、自分がどう感じたかを後回しにしがち",
    scores: {
      very: [{ type: "overAdjusting", points: 3 }],
      somewhat: [{ type: "overAdjusting", points: 2 }],
    },
  },
  {
    id: 16,
    text: "悪い人じゃないからという理由で、疲れる相手とも会い続けてしまう",
    scores: {
      very: [
        { type: "overAdjusting", points: 3 },
        { type: "reset", points: 1 },
      ],
      somewhat: [{ type: "overAdjusting", points: 2 }],
    },
  },
  {
    id: 17,
    text: "作られた一対一の出会いに飽きている",
    scores: {
      very: [{ type: "stagedFatigue", points: 3 }],
      somewhat: [{ type: "stagedFatigue", points: 2 }],
    },
  },
  {
    id: 18,
    text: "恋愛相手を探すためだけの場より、生活圏が広がる出会いに惹かれる",
    scores: {
      very: [{ type: "stagedFatigue", points: 3 }],
      somewhat: [{ type: "stagedFatigue", points: 2 }],
    },
  },
  {
    id: 19,
    text: "アプリを開くだけで疲れることがある",
    scores: {
      very: [
        { type: "reset", points: 3 },
        { type: "fastJudgment", points: 1 },
      ],
      somewhat: [{ type: "reset", points: 2 }],
    },
  },
  {
    id: 20,
    text: "今は出会いを増やすより、一度婚活を整理したい",
    scores: {
      very: [
        { type: "reset", points: 3 },
        { type: "purposeFirst", points: 1 },
      ],
      somewhat: [{ type: "reset", points: 2 }],
    },
  },
];

function getTypeScore(items: ScoreItem[] | undefined, type: FatigueReasonType) {
  return items?.filter((item) => item.type === type).reduce((sum, item) => sum + item.points, 0) ?? 0;
}

export const FATIGUE_REASON_MAX_SCORES = FATIGUE_REASON_TYPE_ORDER.reduce<Record<FatigueReasonType, number>>((accumulator, type) => {
  accumulator[type] = FATIGUE_REASON_QUESTIONS.reduce((sum, question) => {
    const maxQuestionScore = Math.max(0, ...Object.values(question.scores).map((items) => getTypeScore(items, type)));
    return sum + maxQuestionScore;
  }, 0);
  return accumulator;
}, {} as Record<FatigueReasonType, number>);

export const FATIGUE_REASON_RESULTS: Record<FatigueReasonType, FatigueReasonResult> = {
  fastJudgment: {
    type: "fastJudgment",
    name: "速すぎる判断に疲れているタイプ",
    catchCopy: "あなたの良さが出る前に、婚活の判断が進みすぎています。",
    reason: [
      "初対面から恋愛対象として判断されるスピードに疲れているタイプです。マチアプでは、写真、プロフィール、メッセージ、初回デート、2回目に進むかどうかまで、かなり短い時間で判断が進みます。",
      "でもあなたは、何度か会う中で安心感や居心地が育ってから気持ちが動きやすい人かもしれません。短期判断の婚活に合わせようとするほど、自分の良さが出る前に疲れてしまいます。",
    ],
    commonStates: [
      "悪い人ではないけど、次に会いたい理由が分からない",
      "3回くらいでは好きになれるか分からない",
      "5回くらい会わないと分からない気がする",
      "会う前のメッセージで疲れる",
      "初対面で恋愛対象として見られる感じがしんどい",
      "2〜3回で交際を決める前提がしんどい",
    ],
    stopTrying: [
      "初回で好きになれない自分を責めること",
      "短期間で決められる人のペースに無理に合わせること",
      "会う前のメッセージだけで気持ちを作ろうとすること",
    ],
    reviewPoints: [
      "何回会えば自然に判断しやすいのか、自分のペースを先に決める",
      "会う前のやり取りを長くしすぎず、軽めの確認にする",
      "初回で恋愛感情ではなく、もう一度話せそうかを見る",
    ],
    meetingHints: ["紹介", "友達の友達", "趣味の場", "読書会", "本屋イベント", "観劇系の集まり", "スポーツ観戦", "SNS", "コミュニティ"],
    nextStep: "マチアプを主戦場にしすぎず、何度か自然に会える場所をひとつ増やしてみてください。",
    cta: consultationCta,
  },
  wrongPeople: {
    type: "wrongPeople",
    name: "合わない人が入りすぎて疲れているタイプ",
    catchCopy: "出会いの量ではなく、入ってくる相手のズレで疲れています。",
    reason: [
      "いいねやマッチはある。会うこともできる。でも、来る人の温度感、結婚観、生活観、距離感がズレている。そのズレを毎回受け止めているうちに、婚活が消耗戦になっています。",
      "これは出会いの数が足りないというより、入口の設計が広すぎる状態です。万人受けのプロフィールほど、合わない人まで入りやすくなることがあります。",
    ],
    commonStates: [
      "いいねは来るけど、会いたい人から来ない",
      "プロフィールを読んでいない人から来る",
      "会う前から価値観が違う気がする",
      "自分が合わせる前提の相手が多い",
      "子ども観や結婚観が合わない人が入ってくる",
      "無難に書いているのに、合わない人が寄ってくる",
    ],
    stopTrying: [
      "全員に好かれそうなプロフィールを目指すこと",
      "違和感がある相手に、毎回ちゃんと会おうとすること",
      "条件欄だけで価値観まで伝わっていると思い込むこと",
    ],
    reviewPoints: [
      "プロフィールの役割を、万人受けから合わない人を減らす入口に変える",
      "写真、写真の順番、出している価値観、距離感、結婚観まで見直す",
      "会う前に確認したい価値観を、やわらかく先に出す",
    ],
    meetingHints: ["Pairsやヒトオシは条件確認の場所として使う", "社会人サークル", "外飲み", "SNS", "価値観が見える場"],
    nextStep: "まずはプロフィールの届き方を整え、あなたと合う人に狭く深く届く入口を作るのがよさそうです。",
    cta: profileCta,
  },
  purposeFirst: {
    type: "purposeFirst",
    name: "探す順番が逆で疲れているタイプ",
    catchCopy: "誰を選ぶかの前に、何のために結婚したいかを整理する段階です。",
    reason: [
      "どんな人がいいかを探す前に、なぜ結婚したいのかが曖昧なまま婚活していて疲れているタイプです。",
      "目的が空欄のまま相手を見ると、誰を見ても「決め手に欠ける」になりやすいです。相手が悪いのではなく、判断する物差しがまだ手元にない状態かもしれません。",
    ],
    commonStates: [
      "いい人だけど決め手がない",
      "何を基準に選べばいいか分からない",
      "結婚したい気持ちはあるけど、生活のイメージが曖昧",
      "相手を見れば見るほど分からなくなる",
      "結婚してどうなりたいかをあまり描けていない",
      "目的が決まっていないのに相手を探している",
    ],
    stopTrying: [
      "決め手がないまま、さらに候補だけを増やすこと",
      "相手の条件比較だけで答えを出そうとすること",
      "相談所かアプリかを、目的の整理より先に決めること",
    ],
    reviewPoints: [
      "寂しさを埋める結婚なのか、生活をもう一段楽しくする結婚なのかを分ける",
      "どんな生活を誰かと共有したいのかを言葉にする",
      "相手条件ではなく、結婚後に守りたい日常から逆算する",
    ],
    meetingHints: ["まず自分の物差しを作る", "そのうえでアプリ、紹介、相談所、SNS、外飲みのどこに力を入れるかを決める"],
    nextStep: "出会いを増やす前に、結婚したい理由と選ぶ基準を一度紙に出してみてください。",
    cta: consultationCta,
  },
  profileInvisible: {
    type: "profileInvisible",
    name: "条件検索で魅力が見えなくなっているタイプ",
    catchCopy: "あなたの魅力は、条件欄より場の中で伝わりやすいタイプです。",
    reason: [
      "条件検索の中で、自分の魅力が伝わりにくくなっているタイプです。年齢、年収、身長、学歴、写真、趣味欄など、婚活では分かりやすい条件が先に並びます。",
      "でもあなたの魅力は、話し方、場での振る舞い、人との距離感、店員さんへの態度、ふざけた時の返し方、生活の温度感に出やすいのかもしれません。",
    ],
    commonStates: [
      "プロフィールだけで判断されると、自分の良さが出ない",
      "何度か会えば分かってもらえる気がする",
      "一覧で選ばれる感じがしんどい",
      "条件だけで見ると、自分が薄まる",
      "相棒感や親友感は初回やプロフィールだけでは見えにくい",
      "人間性が見える前に判断を求められて疲れる",
    ],
    stopTrying: [
      "条件欄だけで自分の魅力を全部説明しようとすること",
      "一覧で強く見える人と同じ戦い方をすること",
      "プロフィールで薄まった自分を、さらに無難に整えること",
    ],
    reviewPoints: [
      "条件検索だけで勝負しない設計にする",
      "プロフィールには人柄が伝わる具体的な場面を入れる",
      "会った時に魅力が出る場所を、出会い方の中に混ぜる",
    ],
    meetingHints: ["SNS", "紹介", "外飲み", "趣味の場", "友達の友達", "コミュニティ", "相談所やアプリは条件確認の場所として限定する"],
    nextStep: "プロフィールだけで勝負する時間を減らし、人柄や空気感が見える出会いを少し増やしてみてください。",
    cta: consultationCta,
  },
  placeMismatch: {
    type: "placeMismatch",
    name: "好きになれる場所と進めやすい場所がズレているタイプ",
    catchCopy: "好きになれる場所と、恋愛に進めやすい場所が分かれています。",
    reason: [
      "アプリのような一対一の場では、デートや口説く流れは作りやすい。でも気持ちは深まりにくい。逆に、外飲み、サークル、趣味の場、職場、コミュニティでは好きになりやすい。",
      "ただ、関係が壊れた時のリスクがあるから踏み込みづらい。このズレがあると、出会えているのに恋愛が前に進みにくくなります。",
    ],
    commonStates: [
      "アプリでは口説けるけど好きになれない",
      "コミュニティの人は好きになれるけど踏み込めない",
      "気になる人はいるけど、場を壊したくない",
      "好きになる場所とデートに誘いやすい場所が違う",
      "外飲みやサークルでは人柄が見えるけど、恋愛に進めるのが難しい",
    ],
    stopTrying: [
      "場の中だけで恋愛を完結させようとすること",
      "いきなり口説くか、何もしないかの二択にすること",
      "好きになれない場所だけで頑張り続けること",
    ],
    reviewPoints: [
      "場の外で一対一の時間を小さく作る",
      "「この前話してた店、行ってみませんか」くらいの軽さで誘う",
      "好きになれる場所と進める場所を分けて設計する",
    ],
    meetingHints: ["外飲み", "サークル", "趣味の場", "SNS", "友達の友達", "場の外で一対一の時間を作る"],
    nextStep: "場を壊さない軽さで、気になる人と短い一対一の時間を作る練習から始めるのがよさそうです。",
    cta: consultationCta,
  },
  overAdjusting: {
    type: "overAdjusting",
    name: "相手に合わせすぎて疲れているタイプ",
    catchCopy: "相手の気持ちを読む前に、自分の声を聞く段階です。",
    reason: [
      "相手がどう思っているかを読みすぎて、自分の気持ちを後回しにして疲れているタイプです。誘われる、好かれる、関係は続く。でも、自分が本当にまた会いたいのかを見ていない。",
      "その結果、出会いはあるのに、決めきれない関係に時間が溶けていきます。悪い人じゃないから続ける、という優しさが自分を削っているのかもしれません。",
    ],
    commonStates: [
      "相手がいい人だと断りづらい",
      "誘われたから会っている",
      "自分がどうしたいかより、相手の気持ちを考えてしまう",
      "会ったあとに疲れているのに、悪い人じゃないから続けてしまう",
      "自分の「また会いたい」「もう疲れた」を後回しにしてしまう",
      "来てくれた人の中から選ぶだけになっている",
    ],
    stopTrying: [
      "相手の気持ちを先読みして正解を出そうとすること",
      "いい人だからという理由だけで会い続けること",
      "断ることを、相手を傷つける行為だけとして捉えること",
    ],
    reviewPoints: [
      "また会いたいのか、一緒にいて自然でいられたのかを見る",
      "別れたあとに軽いのか、どっと疲れるのかをメモする",
      "相手の本音より、扱われ方と自分の感覚を見る",
    ],
    meetingHints: ["自分のペースを守れる出会い方", "会う基準を整理する", "自分が会いたい人に近づく割合を増やす"],
    nextStep: "次に会うか迷ったら、相手の評価ではなく、会った後の自分の軽さを基準にしてみてください。",
    cta: consultationCta,
  },
  stagedFatigue: {
    type: "stagedFatigue",
    name: "作られた出会いに飽きて疲れているタイプ",
    catchCopy: "出会いがないのではなく、生活が広がらない出会いに飽きています。",
    reason: [
      "マチアプ、合コン、紹介、婚活イベント。会うこと自体はできる。でも、生活が広がる感じや、人間関係が連鎖していく感じがない。",
      "予定された一対一の出会いばかりになると、恋愛というより作業に近くなります。あなたは、出会いに行くより生活圏を広げることで気持ちが戻りやすいタイプかもしれません。",
    ],
    commonStates: [
      "出会いはあるけど、想像を超えない",
      "また同じような会話をしている感じがする",
      "恋愛相手を探すためだけの場に疲れた",
      "人間関係が広がる感覚がほしい",
      "作られた出会いに飽きている",
      "生活圏や価値観が広がるような出会いがほしい",
    ],
    stopTrying: [
      "恋愛相手を探すためだけの予定を詰め続けること",
      "一対一の効率だけで出会いを評価すること",
      "生活が広がらない場所で、自分の温度を上げようとすること",
    ],
    reviewPoints: [
      "出会いに行くより、生活圏を広げる予定を入れる",
      "恋愛目的だけではない場所に混ざる",
      "店や人間関係に信用を置き、人から人へ広がる場を作る",
    ],
    meetingHints: ["外飲み", "行きつけ", "個人店のバー", "SNS", "趣味の場", "友達の友達", "人から人へ広がる出会い"],
    nextStep: "恋愛の予定を増やすより、行きつけにしたい場所や人間関係が広がる予定をひとつ入れてみてください。",
    cta: consultationCta,
  },
  reset: {
    type: "reset",
    name: "いったん立て直したほうがいいタイプ",
    catchCopy: "今はもっと会うより、婚活で削れた自分を整える時期です。",
    reason: [
      "婚活で削れた状態のまま、さらに出会いを増やそうとして疲れているタイプです。今は新しい人と会うより、何がしんどかったのかを整理する時期かもしれません。",
      "無理に予定を入れるほど、自分の感覚が分からなくなっていきます。出会いを止めることは負けではなく、立て直して戻るための準備です。",
    ],
    commonStates: [
      "アプリを開くだけで疲れる",
      "会う前からもう気が重い",
      "断るのもしんどいし、断られるのもしんどい",
      "何が嫌なのか自分でも分からない",
      "恋愛そのものが面倒になってきた",
      "予定を入れるほど自分が削れていく感じがする",
    ],
    stopTrying: [
      "疲れたまま予定だけを増やすこと",
      "しんどさの理由が分からないまま、根性で再開すること",
      "休むことをサボりだと決めつけること",
    ],
    reviewPoints: [
      "プロフィール、会う基準、出会い方、相手への向き合い方を一度整理する",
      "出会いを増やす前に、婚活の負荷を下げる",
      "少し動いて、もう一度整える流れを作る",
    ],
    meetingHints: ["一度整理してから再開する", "整理、行動、再整理を2回に分けて進める", "まずは負荷が低い出会い方だけ残す"],
    nextStep: "今週は新しい予定を増やすより、何が一番しんどかったのかを3つだけ書き出してみてください。",
    cta: resetCta,
  },
};

export const FATIGUE_REASON_ACTION_GUIDES: Record<FatigueReasonType, FatigueReasonActionGuide> = {
  fastJudgment: {
    shortReason: "短い時間で恋愛対象として判断される婚活に疲れやすい傾向があります。",
    reviewActions: [
      "初回や2回目で好きになろうとしすぎない",
      "何度か自然に会える出会い方を増やす",
      "プロフィールに「少しずつ仲良くなりたい」温度感を入れる",
    ],
    suitedMeetings: ["友達の友達", "趣味の場", "SNS", "外飲み", "何度か自然に顔を合わせる場所"],
    drainingMeetings: ["即アポ前提のマチアプ", "初回で恋愛対象として判断される婚活", "2〜3回で交際判断を求められる出会い"],
  },
  wrongPeople: {
    shortReason: "プロフィールや出会い方が広く刺さりすぎて、温度感の違う相手まで入りやすい傾向があります。",
    reviewActions: [
      "万人受けのプロフィールをやめる",
      "合わない人を減らす言葉を入れる",
      "結婚観、生活観、距離感をやわらかくプロフィールに出す",
    ],
    suitedMeetings: ["プロフィール改善後のマチアプ", "価値観が伝わるSNS", "ヒトオシ", "友人紹介", "社会人サークル"],
    drainingMeetings: ["無難なプロフィールのまま広く受けるアプリ", "条件だけで大量に会う婚活", "自分の価値観を隠したまま進める出会い"],
  },
  purposeFirst: {
    shortReason: "誰を選ぶかの前に、なぜ結婚したいのかや選ぶ基準がまだ曖昧な傾向があります。",
    reviewActions: [
      "どんな人がいいかの前に、なぜ結婚したいかを書く",
      "結婚後にどんな生活をしたいかを言葉にする",
      "「楽しい人」と「生活に入れていい人」を分けて考える",
    ],
    suitedMeetings: ["婚活の見直し相談", "価値観を言語化したうえでの紹介", "目的を整理したうえでの相談所", "SNSやnoteで価値観を出す出会い"],
    drainingMeetings: ["目的が曖昧なまま相手を大量に見るアプリ", "何を選べばいいか分からないままの相談所", "決め手探しだけを続ける婚活"],
  },
  profileInvisible: {
    shortReason: "条件やプロフィールだけで見られる場だと、人柄や空気感の魅力が伝わりにくい傾向があります。",
    reviewActions: [
      "条件欄だけで勝負しない出会い方を増やす",
      "人柄や場での振る舞いが見える場所に行く",
      "SNSや紹介で価値観が伝わる導線を作る",
    ],
    suitedMeetings: ["SNS", "友人紹介", "外飲み", "趣味の場", "生活圏での出会い"],
    drainingMeetings: ["条件検索だけで並ぶ相談所", "プロフィールだけで判断されるアプリ", "初回で人間性が見える前に判断される出会い"],
  },
  placeMismatch: {
    shortReason: "好きになれる場所と、関係を進めやすい場所が分かれていて、気持ちと行動が噛み合いにくい傾向があります。",
    reviewActions: [
      "好きになれる場所で、場の外に出す動きを作る",
      "いきなり口説かず、軽い一対一の時間を作る",
      "「この前話していた店、行ってみませんか」くらいの誘い方を使う",
    ],
    suitedMeetings: ["外飲み", "サークル", "趣味の場", "友達の友達", "SNSからの少人数飲み"],
    drainingMeetings: ["口説きやすいけど好きになれないアプリ", "好きになれるけど何も進まないコミュニティ", "場の中だけで完結する出会い"],
  },
  overAdjusting: {
    shortReason: "相手がどう思うかを優先して、自分がまた会いたいかを後回しにしやすい傾向があります。",
    reviewActions: [
      "相手がどう思ったかより、自分がまた会いたいかを見る",
      "会った後に軽いのか疲れるのかを記録する",
      "違和感がある相手には無理に会わない",
    ],
    suitedMeetings: ["自分のペースを守れる紹介", "価値観が伝わるプロフィール", "友達の友達", "少人数の場", "安心して断れる出会い方"],
    drainingMeetings: ["断りづらい紹介", "押しが強い相手が多いアプリ", "相手のペースに巻き込まれやすい出会い"],
  },
  stagedFatigue: {
    shortReason: "恋愛相手を探すためだけの予定が続き、生活や人間関係が広がらないことに飽きやすい傾向があります。",
    reviewActions: ["恋愛目的だけではない場所に行く", "行きつけや趣味の場を1つ作る", "SNSで生活や価値観がにじむ投稿を増やす"],
    suitedMeetings: ["外飲み", "行きつけ", "SNS", "趣味の場", "友達の友達", "生活圏が広がる出会い"],
    drainingMeetings: ["マチアプだけ", "婚活イベントだけ", "毎回同じ自己紹介をする出会い", "恋愛目的だけの場"],
  },
  reset: {
    shortReason: "新しい出会いを増やす前に、一度婚活で削れた自分を立て直したほうがよい状態です。",
    reviewActions: [
      "新しい予定を増やす前に、婚活で何がしんどかったかを書く",
      "アプリを開く頻度を一度減らす",
      "プロフィール、会う基準、出会い方を整理してから再開する",
    ],
    suitedMeetings: ["まずは相談で整理", "負荷の低い紹介", "SNSでゆるくつながる", "趣味や生活の延長の出会い"],
    drainingMeetings: ["予定を詰め込む婚活", "毎週新しい人と会い続けるアプリ", "断る・断られるを繰り返す短期決戦の出会い"],
  },
};

export function buildFatigueReasonIntro(topFactors: FatigueReasonFactor[]) {
  const [primary, secondary, tertiary] = topFactors;
  const primaryGuide = FATIGUE_REASON_ACTION_GUIDES[primary.type];
  const secondaryGuide = secondary ? FATIGUE_REASON_ACTION_GUIDES[secondary.type] : undefined;
  const tertiaryGuide = tertiary ? FATIGUE_REASON_ACTION_GUIDES[tertiary.type] : undefined;

  return [
    `あなたが婚活疲れしている一番の理由は、${primaryGuide.shortReason}`,
    secondaryGuide && tertiaryGuide
      ? `さらに、${secondaryGuide.shortReason}また、${tertiaryGuide.shortReason}`
      : "出会いの数が足りないというより、今の進め方があなたの感覚に合っていない可能性があります。",
    `まずは「${primaryGuide.reviewActions[0]}」ところから見直すと、今の疲れを減らしやすそうです。`,
  ].filter(Boolean);
}

function getTopCauseFactors(rankedFactors: FatigueReasonFactor[]) {
  return rankedFactors.filter((factor) => factor.type !== "reset").slice(0, 3);
}

function getConditionFactor(rankedFactors: FatigueReasonFactor[]) {
  return rankedFactors.find((factor) => factor.type === "reset") ?? null;
}

function getFatigueReasonRankedFactors(scores: Record<FatigueReasonType, number>, normalizedScores: Record<FatigueReasonType, number>) {
  return FATIGUE_REASON_TYPE_ORDER.map<FatigueReasonFactor>((type) => ({
    type,
    score: scores[type],
    normalizedScore: normalizedScores[type],
    result: FATIGUE_REASON_RESULTS[type],
  })).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.normalizedScore !== a.normalizedScore) {
      return b.normalizedScore - a.normalizedScore;
    }

    return TIE_BREAK_PRIORITY.indexOf(a.type) - TIE_BREAK_PRIORITY.indexOf(b.type);
  });
}

export function isFatigueReasonType(value: string | null | undefined): value is FatigueReasonType {
  return FATIGUE_REASON_TYPE_ORDER.includes(value as FatigueReasonType);
}

export function buildFatigueReasonDiagnosisFromResultType(type: FatigueReasonType) {
  const resultType = type === "reset" ? "fastJudgment" : type;
  const scores = FATIGUE_REASON_TYPE_ORDER.reduce<Record<FatigueReasonType, number>>((accumulator, currentType) => {
    accumulator[currentType] = currentType === resultType || currentType === type ? FATIGUE_REASON_MAX_SCORES[currentType] : 0;
    return accumulator;
  }, {} as Record<FatigueReasonType, number>);
  const normalizedScores = FATIGUE_REASON_TYPE_ORDER.reduce<Record<FatigueReasonType, number>>((accumulator, currentType) => {
    accumulator[currentType] = currentType === resultType || currentType === type ? 1 : 0;
    return accumulator;
  }, {} as Record<FatigueReasonType, number>);
  const rankedFactors = getFatigueReasonRankedFactors(scores, normalizedScores);
  const topFactors = getTopCauseFactors(rankedFactors);
  const conditionFactor = getConditionFactor(rankedFactors);

  return {
    result: FATIGUE_REASON_RESULTS[resultType],
    scores,
    normalizedScores,
    rankedFactors,
    topFactors,
    conditionFactor,
    introParagraphs: buildFatigueReasonIntro(topFactors),
  };
}

export function runFatigueReasonDiagnosis(answers: FatigueAnswerValue[]) {
  const scores = FATIGUE_REASON_TYPE_ORDER.reduce<Record<FatigueReasonType, number>>((accumulator, type) => {
    accumulator[type] = 0;
    return accumulator;
  }, {} as Record<FatigueReasonType, number>);

  answers.forEach((answer, index) => {
    const question = FATIGUE_REASON_QUESTIONS[index];
    if (!question) {
      return;
    }

    question.scores[answer]?.forEach((item) => {
      scores[item.type] += item.points;
    });
  });

  // Compare ratios so types with fewer dedicated questions are not penalized.
  const normalizedScores = FATIGUE_REASON_TYPE_ORDER.reduce<Record<FatigueReasonType, number>>((accumulator, type) => {
    const maxScore = FATIGUE_REASON_MAX_SCORES[type];
    accumulator[type] = maxScore > 0 ? scores[type] / maxScore : 0;
    return accumulator;
  }, {} as Record<FatigueReasonType, number>);
  const rankedFactors = getFatigueReasonRankedFactors(scores, normalizedScores);
  const topFactors = getTopCauseFactors(rankedFactors);
  const conditionFactor = getConditionFactor(rankedFactors);
  const resultType = topFactors[0]?.type ?? "fastJudgment";

  return {
    result: FATIGUE_REASON_RESULTS[resultType],
    scores,
    normalizedScores,
    rankedFactors,
    topFactors,
    conditionFactor,
    introParagraphs: buildFatigueReasonIntro(topFactors),
  };
}
