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

export const maleIncomePercentile: Record<number, number> = {
  0: 100,
  200: 92,
  300: 72,
  400: 48,
  500: 28,
  600: 16,
  700: 9.5,
  800: 5.8,
  900: 3.5,
  1000: 2.2,
  1200: 1,
  1500: 0.4,
  2000: 0.1,
};

export const femaleIncomePercentile: Record<number, number> = {
  0: 100,
  200: 88,
  300: 62,
  400: 35,
  500: 18,
  600: 8.5,
  700: 4,
  800: 2,
  900: 1,
  1000: 0.5,
  1200: 0.2,
  1500: 0.08,
  2000: 0.02,
};

export const malePercentileToIncome: Array<[number, number]> = [
  [100, 0],
  [92, 200],
  [72, 300],
  [48, 400],
  [28, 500],
  [16, 600],
  [9.5, 700],
  [5.8, 800],
  [3.5, 900],
  [2.2, 1000],
  [1, 1200],
  [0.4, 1500],
  [0.1, 2000],
];

export const femalePercentileToIncome: Array<[number, number]> = [
  [100, 0],
  [88, 200],
  [62, 300],
  [35, 400],
  [18, 500],
  [8.5, 600],
  [4, 700],
  [2, 800],
  [1, 900],
  [0.5, 1000],
  [0.2, 1200],
  [0.08, 1500],
  [0.02, 2000],
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
