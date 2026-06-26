export const MARKET_AGE_MIN = 20;
export const MARKET_AGE_MAX = 49;

export const MARKET_GENDER_LABELS = {
  male: "男性",
  female: "女性",
} as const;

export const MARKET_EDUCATION_LABELS = {
  highschool: "高卒",
  college: "大卒",
  graduate: "大学院卒",
} as const;

export const MARKET_REGION_LABELS = {
  tokyo: "東京",
  kanto: "関東",
  kansai: "関西",
  tokai: "東海",
  other: "その他",
} as const;

export type MarketGender = keyof typeof MARKET_GENDER_LABELS;
export type MarketEducationKey = keyof typeof MARKET_EDUCATION_LABELS;
export type MarketRegionKey = keyof typeof MARKET_REGION_LABELS;

export const maleAgeDesirability: Record<number, number> = {
  20: 0.15,
  21: 0.2,
  22: 0.28,
  23: 0.35,
  24: 0.42,
  25: 0.55,
  26: 0.62,
  27: 0.7,
  28: 0.78,
  29: 0.82,
  30: 0.85,
  31: 0.82,
  32: 0.78,
  33: 0.73,
  34: 0.68,
  35: 0.6,
  36: 0.52,
  37: 0.44,
  38: 0.36,
  39: 0.3,
  40: 0.24,
  41: 0.2,
  42: 0.17,
  43: 0.14,
  44: 0.12,
  45: 0.1,
  46: 0.08,
  47: 0.07,
  48: 0.06,
  49: 0.05,
};

export const femaleAgeDesirability: Record<number, number> = {
  20: 0.3,
  21: 0.38,
  22: 0.48,
  23: 0.58,
  24: 0.68,
  25: 0.8,
  26: 0.85,
  27: 0.88,
  28: 0.88,
  29: 0.85,
  30: 0.8,
  31: 0.74,
  32: 0.66,
  33: 0.58,
  34: 0.5,
  35: 0.42,
  36: 0.35,
  37: 0.28,
  38: 0.22,
  39: 0.18,
  40: 0.14,
  41: 0.11,
  42: 0.09,
  43: 0.07,
  44: 0.06,
  45: 0.05,
  46: 0.04,
  47: 0.035,
  48: 0.03,
  49: 0.025,
};

// 国税庁「令和6年分 民間給与実態統計調査」第16表の給与階級別構成割合から、
// 各年収以上に入る上側割合を概算したものです。
export const maleIncomePercentile: Record<number, number> = {
  0: 100,
  100: 96.5,
  200: 90.9,
  300: 82.2,
  400: 67.9,
  500: 51,
  600: 36.3,
  700: 26,
  800: 18.4,
  900: 13.4,
  1000: 9.8,
  1200: 6.9,
  1500: 2.7,
  2000: 1,
  2500: 0.6,
};

export const femaleIncomePercentile: Record<number, number> = {
  0: 100,
  100: 86.9,
  200: 68.5,
  300: 49.5,
  400: 31,
  500: 17.7,
  600: 9.7,
  700: 5.7,
  800: 3.5,
  900: 2.3,
  1000: 1.6,
  1200: 1.2,
  1500: 0.5,
  2000: 0.2,
  2500: 0.1,
};

export const malePercentileToIncome: Array<[number, number]> = [
  [100, 0],
  [96.5, 100],
  [90.9, 200],
  [82.2, 300],
  [67.9, 400],
  [51, 500],
  [36.3, 600],
  [26, 700],
  [18.4, 800],
  [13.4, 900],
  [9.8, 1000],
  [6.9, 1200],
  [2.7, 1500],
  [1, 2000],
  [0.6, 2500],
];

export const femalePercentileToIncome: Array<[number, number]> = [
  [100, 0],
  [86.9, 100],
  [68.5, 200],
  [49.5, 300],
  [31, 400],
  [17.7, 500],
  [9.7, 600],
  [5.7, 700],
  [3.5, 800],
  [2.3, 900],
  [1.6, 1000],
  [1.2, 1200],
  [0.5, 1500],
  [0.2, 2000],
  [0.1, 2500],
];

export const marketHeightParams = {
  male: { mean: 171, sd: 5.7 },
  female: { mean: 158, sd: 5.3 },
} as const;

export const marketEducationPercentile: Record<MarketGender, Record<MarketEducationKey, number>> = {
  male: {
    highschool: 98,
    college: 55,
    graduate: 7,
  },
  female: {
    highschool: 98,
    college: 52,
    graduate: 4,
  },
};

export const educationDesirability: Record<MarketGender, Record<MarketEducationKey, number>> = {
  male: {
    highschool: 0.72,
    college: 0.84,
    graduate: 0.9,
  },
  female: {
    highschool: 0.78,
    college: 0.86,
    graduate: 0.91,
  },
};

export const marketRegionPercentile: Record<MarketGender, Record<MarketRegionKey, number>> = {
  male: {
    tokyo: 11,
    kanto: 29,
    kansai: 15,
    tokai: 10,
    other: 35,
  },
  female: {
    tokyo: 13,
    kanto: 31,
    kansai: 14,
    tokai: 9,
    other: 33,
  },
};

export const regionDesirability: Record<MarketGender, Record<MarketRegionKey, number>> = {
  male: {
    tokyo: 0.38,
    kanto: 0.32,
    kansai: 0.18,
    tokai: 0.14,
    other: 0.1,
  },
  female: {
    tokyo: 0.35,
    kanto: 0.3,
    kansai: 0.17,
    tokai: 0.13,
    other: 0.09,
  },
};
