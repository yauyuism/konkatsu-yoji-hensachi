export const AGE_MIN = 18;
export const AGE_MAX = 60;

export const AGE_GROUPS = [
  { key: "18-19", min: 18, max: 19 },
  { key: "20-24", min: 20, max: 24 },
  { key: "25-29", min: 25, max: 29 },
  { key: "30-34", min: 30, max: 34 },
  { key: "35-39", min: 35, max: 39 },
  { key: "40-44", min: 40, max: 44 },
  { key: "45-49", min: 45, max: 49 },
  { key: "50-54", min: 50, max: 54 },
  { key: "55-59", min: 55, max: 59 },
  { key: "60", min: 60, max: 60 },
] as const;

export const REGIONS = {
  all: { label: "全国" },
  tokyo: { label: "東京" },
  kanto: { label: "関東" },
  kansai: { label: "関西" },
  tokai: { label: "東海" },
  other: { label: "その他" },
} as const;

export const VISIBLE_REGIONS = {
  all: REGIONS.all,
  tokyo: REGIONS.tokyo,
  kanto: REGIONS.kanto,
  kansai: REGIONS.kansai,
  tokai: REGIONS.tokai,
} as const;

export const EDUCATIONS = {
  any: "指定なし",
  highschool: "高卒以上",
  college: "大卒以上",
  graduate: "大学院卒",
} as const;

export const GENDER_LABELS = {
  male: "男性",
  female: "女性",
} as const;

export const incomeThresholds = [0, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500] as const;

export const maleHeightOptions = [0, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190] as const;
export const femaleHeightOptions = [0, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190] as const;

export type ConditionGender = keyof typeof GENDER_LABELS;
export type ConditionRegion = keyof typeof REGIONS;
export type EducationKey = keyof typeof EDUCATIONS;
export type AgeGroupKey = (typeof AGE_GROUPS)[number]["key"];

type UnmarriedData = Record<ConditionGender, Record<AgeGroupKey, Record<ConditionRegion, number>>>;

export const unmarriedPopulation: UnmarriedData = {
  male: {
    "18-19": { all: 1_170_000, tokyo: 170_000, kanto: 380_000, kansai: 180_000, tokai: 120_000, other: 520_000 },
    "20-24": { all: 2_910_000, tokyo: 410_000, kanto: 890_000, kansai: 440_000, tokai: 280_000, other: 1_300_000 },
    "25-29": { all: 2_590_000, tokyo: 480_000, kanto: 920_000, kansai: 390_000, tokai: 250_000, other: 1_030_000 },
    "30-34": { all: 1_580_000, tokyo: 330_000, kanto: 600_000, kansai: 240_000, tokai: 160_000, other: 580_000 },
    "35-39": { all: 1_120_000, tokyo: 250_000, kanto: 430_000, kansai: 170_000, tokai: 110_000, other: 410_000 },
    "40-44": { all: 950_000, tokyo: 210_000, kanto: 360_000, kansai: 150_000, tokai: 95_000, other: 345_000 },
    "45-49": { all: 870_000, tokyo: 190_000, kanto: 330_000, kansai: 140_000, tokai: 85_000, other: 315_000 },
    "50-54": { all: 760_000, tokyo: 165_000, kanto: 290_000, kansai: 125_000, tokai: 78_000, other: 282_000 },
    "55-59": { all: 620_000, tokyo: 135_000, kanto: 240_000, kansai: 102_000, tokai: 61_000, other: 217_000 },
    "60": { all: 110_000, tokyo: 25_000, kanto: 43_000, kansai: 18_000, tokai: 10_000, other: 39_000 },
  },
  female: {
    "18-19": { all: 1_120_000, tokyo: 165_000, kanto: 360_000, kansai: 175_000, tokai: 110_000, other: 500_000 },
    "20-24": { all: 2_640_000, tokyo: 390_000, kanto: 810_000, kansai: 400_000, tokai: 260_000, other: 1_170_000 },
    "25-29": { all: 1_730_000, tokyo: 370_000, kanto: 680_000, kansai: 280_000, tokai: 180_000, other: 590_000 },
    "30-34": { all: 870_000, tokyo: 220_000, kanto: 370_000, kansai: 140_000, tokai: 80_000, other: 280_000 },
    "35-39": { all: 560_000, tokyo: 150_000, kanto: 240_000, kansai: 90_000, tokai: 45_000, other: 185_000 },
    "40-44": { all: 430_000, tokyo: 120_000, kanto: 180_000, kansai: 70_000, tokai: 35_000, other: 145_000 },
    "45-49": { all: 350_000, tokyo: 95_000, kanto: 150_000, kansai: 55_000, tokai: 28_000, other: 117_000 },
    "50-54": { all: 300_000, tokyo: 80_000, kanto: 125_000, kansai: 48_000, tokai: 24_000, other: 103_000 },
    "55-59": { all: 230_000, tokyo: 60_000, kanto: 96_000, kansai: 36_000, tokai: 18_000, other: 80_000 },
    "60": { all: 45_000, tokyo: 12_000, kanto: 18_000, kansai: 7_000, tokai: 3_000, other: 17_000 },
  },
};

export const incomeDistribution: Record<ConditionGender, Record<AgeGroupKey, Record<number, number>>> = {
  male: {
    "18-19": { 0: 1, 300: 0.08, 400: 0.015, 500: 0.004, 600: 0.001, 700: 0.0003, 800: 0.0001, 1000: 0.00005, 1200: 0.00002, 1500: 0.00001 },
    "20-24": { 0: 1, 300: 0.42, 400: 0.15, 500: 0.05, 600: 0.02, 700: 0.008, 800: 0.003, 1000: 0.001, 1200: 0.0004, 1500: 0.0001 },
    "25-29": { 0: 1, 300: 0.69, 400: 0.45, 500: 0.24, 600: 0.11, 700: 0.05, 800: 0.025, 1000: 0.008, 1200: 0.003, 1500: 0.001 },
    "30-34": { 0: 1, 300: 0.82, 400: 0.62, 500: 0.4, 600: 0.23, 700: 0.13, 800: 0.07, 1000: 0.025, 1200: 0.01, 1500: 0.003 },
    "35-39": { 0: 1, 300: 0.87, 400: 0.72, 500: 0.52, 600: 0.35, 700: 0.22, 800: 0.13, 1000: 0.05, 1200: 0.02, 1500: 0.007 },
    "40-44": { 0: 1, 300: 0.89, 400: 0.76, 500: 0.58, 600: 0.41, 700: 0.28, 800: 0.18, 1000: 0.08, 1200: 0.03, 1500: 0.01 },
    "45-49": { 0: 1, 300: 0.9, 400: 0.78, 500: 0.62, 600: 0.45, 700: 0.32, 800: 0.22, 1000: 0.11, 1200: 0.045, 1500: 0.015 },
    "50-54": { 0: 1, 300: 0.9, 400: 0.79, 500: 0.63, 600: 0.47, 700: 0.34, 800: 0.23, 1000: 0.12, 1200: 0.05, 1500: 0.018 },
    "55-59": { 0: 1, 300: 0.88, 400: 0.75, 500: 0.6, 600: 0.42, 700: 0.29, 800: 0.19, 1000: 0.09, 1200: 0.035, 1500: 0.012 },
    "60": { 0: 1, 300: 0.68, 400: 0.55, 500: 0.42, 600: 0.28, 700: 0.18, 800: 0.11, 1000: 0.045, 1200: 0.015, 1500: 0.005 },
  },
  female: {
    "18-19": { 0: 1, 300: 0.06, 400: 0.01, 500: 0.003, 600: 0.0008, 700: 0.0002, 800: 0.0001, 1000: 0.00003, 1200: 0.00001, 1500: 0.000005 },
    "20-24": { 0: 1, 300: 0.3, 400: 0.08, 500: 0.02, 600: 0.005, 700: 0.002, 800: 0.001, 1000: 0.0003, 1200: 0.0001, 1500: 0.00005 },
    "25-29": { 0: 1, 300: 0.55, 400: 0.28, 500: 0.12, 600: 0.05, 700: 0.02, 800: 0.008, 1000: 0.002, 1200: 0.0008, 1500: 0.0002 },
    "30-34": { 0: 1, 300: 0.62, 400: 0.38, 500: 0.2, 600: 0.1, 700: 0.05, 800: 0.02, 1000: 0.005, 1200: 0.0015, 1500: 0.0005 },
    "35-39": { 0: 1, 300: 0.65, 400: 0.42, 500: 0.24, 600: 0.13, 700: 0.065, 800: 0.03, 1000: 0.008, 1200: 0.0025, 1500: 0.0008 },
    "40-44": { 0: 1, 300: 0.66, 400: 0.44, 500: 0.26, 600: 0.14, 700: 0.07, 800: 0.035, 1000: 0.01, 1200: 0.003, 1500: 0.001 },
    "45-49": { 0: 1, 300: 0.65, 400: 0.43, 500: 0.25, 600: 0.13, 700: 0.065, 800: 0.03, 1000: 0.009, 1200: 0.0025, 1500: 0.0008 },
    "50-54": { 0: 1, 300: 0.63, 400: 0.41, 500: 0.23, 600: 0.12, 700: 0.06, 800: 0.028, 1000: 0.008, 1200: 0.0022, 1500: 0.0007 },
    "55-59": { 0: 1, 300: 0.57, 400: 0.37, 500: 0.2, 600: 0.1, 700: 0.048, 800: 0.022, 1000: 0.006, 1200: 0.0018, 1500: 0.0006 },
    "60": { 0: 1, 300: 0.38, 400: 0.22, 500: 0.11, 600: 0.05, 700: 0.022, 800: 0.01, 1000: 0.0025, 1200: 0.0008, 1500: 0.0002 },
  },
};

export const educationRatio: Record<ConditionGender, Record<AgeGroupKey, Record<EducationKey, number>>> = {
  male: {
    "18-19": { any: 1, highschool: 0.99, college: 0.08, graduate: 0 },
    "20-24": { any: 1, highschool: 0.98, college: 0.58, graduate: 0.03 },
    "25-29": { any: 1, highschool: 0.98, college: 0.58, graduate: 0.07 },
    "30-34": { any: 1, highschool: 0.98, college: 0.55, graduate: 0.07 },
    "35-39": { any: 1, highschool: 0.98, college: 0.5, graduate: 0.06 },
    "40-44": { any: 1, highschool: 0.98, college: 0.45, graduate: 0.05 },
    "45-49": { any: 1, highschool: 0.97, college: 0.4, graduate: 0.04 },
    "50-54": { any: 1, highschool: 0.97, college: 0.36, graduate: 0.035 },
    "55-59": { any: 1, highschool: 0.97, college: 0.32, graduate: 0.025 },
    "60": { any: 1, highschool: 0.96, college: 0.3, graduate: 0.02 },
  },
  female: {
    "18-19": { any: 1, highschool: 0.99, college: 0.07, graduate: 0 },
    "20-24": { any: 1, highschool: 0.98, college: 0.53, graduate: 0.02 },
    "25-29": { any: 1, highschool: 0.98, college: 0.53, graduate: 0.05 },
    "30-34": { any: 1, highschool: 0.98, college: 0.48, graduate: 0.04 },
    "35-39": { any: 1, highschool: 0.98, college: 0.42, graduate: 0.03 },
    "40-44": { any: 1, highschool: 0.98, college: 0.38, graduate: 0.03 },
    "45-49": { any: 1, highschool: 0.97, college: 0.33, graduate: 0.02 },
    "50-54": { any: 1, highschool: 0.97, college: 0.29, graduate: 0.015 },
    "55-59": { any: 1, highschool: 0.96, college: 0.25, graduate: 0.012 },
    "60": { any: 1, highschool: 0.96, college: 0.22, graduate: 0.01 },
  },
};

export const heightParams = {
  male: { mean: 171, sd: 5.7 },
  female: { mean: 158, sd: 5.3 },
} as const;
