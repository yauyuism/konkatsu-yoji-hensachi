import type { FatigueReasonType } from "@/lib/fatigue-reason";

export type FatigueReasonDisplayMeta = {
  resultLabel: string;
  shortLabel: string;
  chartLabel: string;
  supportLabel: string;
  formalDescription: string;
  shareCopy: string;
  reasonParagraphs: string[];
};

export const FATIGUE_REASON_DISPLAY_META: Record<FatigueReasonType, FatigueReasonDisplayMeta> = {
  lowSignal: {
    resultLabel: "疲れサイン薄め型",
    shortLabel: "疲れサイン薄め",
    chartLabel: "薄め",
    supportLabel: "大きな婚活疲れはまだ強く出ていないタイプ",
    formalDescription: "今回の回答では、特定の原因が強く出ている状態ではありません。",
    shareCopy: "今は大きな婚活疲れサインより、軽い違和感を早めに整えるタイミングかもしれません。",
    reasonParagraphs: [
      "今回は、婚活疲れの原因がどこか一箇所に強く偏っている状態ではありませんでした。",
      "ただ、疲れていないと決めつけるより、会った後に軽いか疲れるかを見ておくと、小さな違和感を早めに拾いやすくなります。",
    ],
  },
  fastJudgment: {
    resultLabel: "判断先行型",
    shortLabel: "判断先行",
    chartLabel: "判断先行",
    supportLabel: "気持ちが育つ前に判断を迫られるタイプ",
    formalDescription: "短い時間で恋愛対象として判断される婚活に疲れやすい傾向があります。",
    shareCopy: "会えるのに進まない理由は、相手を見る前に疲れる仕組みに入っていることかもしれません。",
    reasonParagraphs: [
      "会うこと自体はできるのに、初回や2回目で「ありかなしか」を決める空気に疲れやすいタイプです。",
      "相手が悪い人ではなくても、気持ちが育つ前に判断の期限だけが先に来ると、また会う理由を作るだけで重くなります。",
    ],
  },
  wrongPeople: {
    resultLabel: "入口ズレ型",
    shortLabel: "入口ズレ",
    chartLabel: "入口ズレ",
    supportLabel: "合わない人が入りやすいタイプ",
    formalDescription: "プロフィールや出会い方が、あなたと温度感の違う相手まで呼び込みやすくなっています。",
    shareCopy: "出会いの量より、入口のズレで消耗している状態かもしれません。",
    reasonParagraphs: [
      "いいねや誘いは来るのに、会いたい人とは少しズレていると感じやすいタイプです。",
      "プロフィールや出会い方が無難に広く刺さるほど、温度感の違う相手まで入り込み、会う前から選別の疲れが増えていきます。",
    ],
  },
  purposeFirst: {
    resultLabel: "目的迷子型",
    shortLabel: "目的迷子",
    chartLabel: "目的迷子",
    supportLabel: "誰を選ぶ前に、なぜ結婚したいかが曖昧なタイプ",
    formalDescription: "相手探しの前に、結婚後にどんな生活をしたいかを整理したほうがよい状態です。",
    shareCopy: "誰を選ぶかの前に、結婚で何を叶えたいかが置き去りになっているかもしれません。",
    reasonParagraphs: [
      "悪くない相手なのに決め手が見つからず、会うほど迷いが増えやすいタイプです。",
      "誰がいいかを考える前に、結婚後にどんな生活をしたいのかが曖昧なままだと、毎回の出会いが比較と保留で終わりやすくなります。",
    ],
  },
  profileInvisible: {
    resultLabel: "条件疲れ型",
    shortLabel: "条件疲れ",
    chartLabel: "条件疲れ",
    supportLabel: "条件検索で自分の魅力が見えにくくなるタイプ",
    formalDescription: "条件欄だけで見られる場所にいると、自分の魅力が伝わりにくくなりやすいです。",
    shareCopy: "条件で選ばれる場所ほど、あなたの魅力が見えにくくなっているかもしれません。",
    reasonParagraphs: [
      "年齢、年収、居住地、写真の印象だけで並べられる場所にいるほど、自分の良さが見えにくくなりやすいタイプです。",
      "本当は話したときの空気や人への接し方で伝わる魅力があるのに、条件欄の前で判断が終わる感じがすると、婚活そのものが消耗戦になっていきます。",
    ],
  },
  placeMismatch: {
    resultLabel: "出会い方ズレ型",
    shortLabel: "出会い方ズレ",
    chartLabel: "場所ズレ",
    supportLabel: "好きになれる場所と進めやすい場所がズレているタイプ",
    formalDescription: "好きになれる場所と、恋愛に進めやすい場所が分かれている可能性があります。",
    shareCopy: "あなたの魅力が出にくい場所で頑張っているから、婚活が重くなっているのかもしれません。",
    reasonParagraphs: [
      "好きになりやすい場所と、実際に関係を進めやすい場所がズレていて、気持ちと行動が噛み合いにくいタイプです。",
      "アプリでは会えるけれど好きになれない、趣味や飲みの場では惹かれるけれど進まない、というズレが続くと、どこで頑張ればいいのか分からなくなります。",
    ],
  },
  overAdjusting: {
    resultLabel: "合わせ疲れ型",
    shortLabel: "合わせ疲れ",
    chartLabel: "合わせ疲れ",
    supportLabel: "相手の気持ちを優先しすぎるタイプ",
    formalDescription: "相手がどう思っているかを気にする一方で、自分がまた会いたいかを後回しにしやすい傾向があります。",
    shareCopy: "相手に合わせるほど、自分のまた会いたい感覚が見えにくくなっているかもしれません。",
    reasonParagraphs: [
      "相手がどう思ったか、嫌われていないか、失礼ではないかを先に考えて、自分の感覚が後回しになりやすいタイプです。",
      "会った後に「悪い人じゃなかった」と思っても、それは「また会いたい」と同じではありません。相手に合わせるほど、自分が疲れていることに気づきにくくなります。",
    ],
  },
  stagedFatigue: {
    resultLabel: "予定調和疲れ型",
    shortLabel: "予定調和",
    chartLabel: "予定調和",
    supportLabel: "作られた出会いに飽きているタイプ",
    formalDescription: "毎回同じ自己紹介をして、同じように会って、同じように判断する婚活に飽きている可能性があります。",
    shareCopy: "恋愛の予定を増やすほど、生活が広がらない出会いに飽きているのかもしれません。",
    reasonParagraphs: [
      "毎回同じ自己紹介をして、同じように会って、同じように判断する婚活に飽きている可能性があります。",
      "空気が合うかより先に、予定どおりに進むかを見られている感じがすると、出会いが恋愛ではなく作業のように感じやすくなります。",
    ],
  },
  reset: {
    resultLabel: "立て直し期",
    shortLabel: "立て直し",
    chartLabel: "立て直し",
    supportLabel: "新しい出会いより先に、自分を整えるタイミング",
    formalDescription: "新しい出会いを増やす前に、婚活で削れた自分を一度整えたほうがよい状態です。",
    shareCopy: "今はもっと会うより、婚活で削れた自分を整える時期かもしれません。",
    reasonParagraphs: [
      "今は新しい出会いを増やすほど、前向きになるより先に消耗が増えやすい状態です。",
      "アプリを開く、予定を入れる、断る、断られる。その一つひとつで削れているなら、まずは何が一番しんどかったのかを整理するタイミングかもしれません。",
    ],
  },
};
