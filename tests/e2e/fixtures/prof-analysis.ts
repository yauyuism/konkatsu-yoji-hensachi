export const baseAnalysisResult = {
  scores: {
    firstImpression: 46,
    specificity: 41,
    sincerity: 62,
    hookability: 38,
    safety: 54,
    total: 49,
  },
  title: "発展途上の戦士",
  nickname: "自己完結型プロフ",
  axisComments: {
    firstImpression: "冒頭の1文を変えるだけで動く科目です",
    specificity: "『旅行』の先にまだ余白が残っています",
    sincerity: "ちゃんと誠実。少し素直さを足すと強い",
    hookability: "読む側のツッコミどころをまだ増やせます",
    safety: "空気はやわらかい。語尾の角が取れると強い",
  },
  summary: "真面目さは伝わるけれど、会話のきっかけが少なくて埋もれやすいプロフ。",
  highlights: {
    good: [
      {
        text: "美味しいもの好き",
        reason: "食の話題は会話の入口になりやすい。",
      },
    ],
    bad: [
      {
        text: "海外ドラマを観てます",
        reason: "作品名がないので印象が薄い。",
        suggestion: "作品名を1つ入れると会話の入口になります。",
      },
      {
        text: "ゴルフを始めました",
        reason: "始めた理由や温度感がないのでフックが弱い。",
        suggestion: "友達に誘われてハマった流れを一言足すといい。",
      },
    ],
  },
  comment:
    "真面目さは出ているけど、読み手が返しやすい材料がまだ少ない。特に具体性とツッコミ余地が弱いから、固有名詞と一言の温度感を足すだけで見え方がかなり変わる。今のままだと悪くない止まりで埋もれやすいので、相手が1通目を送りたくなる余白を作る意識が必要です。",
  analysisToken: "test-analysis-token",
} as const;

export const detailAnalysisResult = {
  targetAudience: {
    main: {
      ageRange: "27歳",
      occupation: "事務・営業系",
      persona: "27歳、都内で営業事務をしていて、結婚ラッシュに少し焦り始めた人",
      appHistory: "アプリは2個目で、誠実だけど話しやすい人を探している",
      personality: "穏やかで安心感があり、生活感のある会話をしたいタイプ",
      reason: "グルメや休日の過ごし方が見えると、最初の会話を始めやすいから。",
    },
    sub: {
      ageRange: "31歳",
      occupation: "専門職・クリエイター系",
      persona: "31歳、ひとり暮らしの専門職で、趣味が合う相手なら返信する人",
      appHistory: "アプリ疲れはあるが、具体的な趣味が見える相手には反応する",
      personality: "共通の趣味と会話のしやすさを重視するタイプ",
      reason: "今のプロフでも雰囲気は良いので、作品名や店名が入ると一気に刺さる。",
    },
    miss: {
      type: "ハイスペ志向 / 外見重視タイプ",
      reason: "プロフ文より先に写真や条件で判断されやすい層。",
      improvementHint: "冒頭を具体化すると、文面での評価は少し上がります。",
    },
  },
  improvedProfile: {
    text: "都内でWebマーケの仕事をしています。休みの日は代々木公園で走って、夜はNetflixで海外ドラマを観るのが定番です。最近は友達に誘われて打ちっぱなしに通い始めました。美味しいお店を開拓するのも好きなので、おすすめがあればぜひ教えてください。",
    estimatedScores: {
      firstImpression: 63,
      specificity: 68,
      sincerity: 69,
      hookability: 67,
      safety: 71,
      total: 67,
    },
    changes: [
      "冒頭で仕事内容を具体化した",
      "代々木公園やNetflixなど固有名詞を追加した",
      "ゴルフの始めたきっかけを足して会話のフックを作った",
    ],
  },
  statsCategories: {
    badCategories: ["具体性が低い", "ツッコミ余地がない"],
    goodCategories: ["ツッコミ余地あり", "等身大で好感"],
  },
} as const;
