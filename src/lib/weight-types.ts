import type { Situation, WeightFactorKey, WeightJudgment } from "@/data/weight";

export type WeightGender = "male" | "female";
export type MessageSender = "me" | "them";
export type WeightInputMode = "images" | "text";
export type WeightAnalysisConfidence = "high" | "medium" | "low";
export type MessageContentType = "text" | "sticker" | "image";

export interface AnalyzedMessage {
  index: number;
  sender: MessageSender;
  isMine: boolean;
  text: string;
  charCount: number;
  emojiCount: number;
  hasQuestion: boolean;
  hasSticker: boolean;
  timestamp: string | null;
  contentType: MessageContentType;
}

export interface TopicShift {
  messageIndex: number;
  sender: MessageSender;
}

export interface ConversationSummary {
  myMessageCount: number;
  theirMessageCount: number;
  myTotalChars: number;
  theirTotalChars: number;
  myQuestionMessages: number;
  theirQuestionMessages: number;
  myEmojiCount: number;
  theirEmojiCount: number;
  topicShiftCount: number;
  myTopicShiftCount: number;
  theirTopicShiftCount: number;
}

export interface AnalyzeWeightRequest {
  gender: WeightGender;
  inputMode: WeightInputMode;
  text?: string;
}

export interface WeightReplyExample {
  before: string;
  after: string;
  reason: string;
}

export interface AnalyzeWeightResponse {
  messages: AnalyzedMessage[];
  topicShifts: TopicShift[];
  conversationSummary: ConversationSummary;
  comment: string;
  explanation: string;
  improvement: string;
  example: WeightReplyExample | null;
  parser: "anthropic" | "fallback";
  inputMode: WeightInputMode;
  confidence: WeightAnalysisConfidence;
  imageCount: number;
}

export interface WeightBreakdownItem {
  value: number;
  weight: number;
  detail: string;
}

export interface WeightBreakdown {
  baseWeight: WeightBreakdownItem;
  textRatio: WeightBreakdownItem;
  questionDensity: WeightBreakdownItem;
  emojiGap: WeightBreakdownItem;
  topicInitRate: WeightBreakdownItem;
  lengthVariance: WeightBreakdownItem;
  replySpeed?: WeightBreakdownItem;
}

export interface WeightTopFactor {
  key: WeightFactorKey;
  name: string;
  weight: number;
  detail: string;
}

export interface WeightSituationComparison {
  situation: Situation;
  label: string;
  judgment: WeightJudgment;
  judgmentLabel: string;
}

export interface WeightSourceMeta {
  inputMode: WeightInputMode;
  confidence: WeightAnalysisConfidence;
  imageCount: number;
  myMessageCount: number;
  theirMessageCount: number;
}

export interface WeightResult {
  totalWeight: number;
  partnerWeight: number;
  weightDiff: number;
  judgment: WeightJudgment;
  breakdown: WeightBreakdown;
  topFactor: WeightTopFactor;
  situationComparisons: WeightSituationComparison[];
}
