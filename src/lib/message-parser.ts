import { countEmojis } from "@/lib/text-analysis";
import type { AnalyzedMessage, ConversationSummary, MessageContentType, MessageSender, TopicShift, WeightReplyExample } from "@/lib/weight-types";

const ME_MARKERS = /^(自分|わたし|私|me|ME|Me|あなた|自分側)\s*[:：]\s*(.*)$/;
const THEM_MARKERS = /^(相手|彼|彼女|them|THEM|Them|相手側)\s*[:：]\s*(.*)$/;
const IOS_HEADER_PATTERN = /^\[[^\]]+\]\s+\d{1,2}:\d{2}$/;
const EXPORT_LINE_PATTERN = /^\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{2}\s+\S+\s+.+$/;

function getContentType(text: string, explicitContentType?: unknown): MessageContentType {
  if (explicitContentType === "sticker" || explicitContentType === "image" || explicitContentType === "text") {
    return explicitContentType;
  }

  if (text === "[スタンプ]") {
    return "sticker";
  }
  if (text === "[画像]") {
    return "image";
  }

  return "text";
}

function getMetricText(text: string, contentType: MessageContentType) {
  return contentType === "text" ? text : "";
}

function normalizeMessage(
  sender: MessageSender,
  text: string,
  index: number,
  options?: {
    timestamp?: string | null;
    hasSticker?: boolean;
    contentType?: unknown;
  }
): AnalyzedMessage | null {
  const normalizedText = text.replace(/\r/g, "").trim();

  if (!normalizedText) {
    return null;
  }

  const contentType = getContentType(normalizedText, options?.contentType);
  const metricText = getMetricText(normalizedText, contentType);

  return {
    index,
    sender,
    isMine: sender === "me",
    text: normalizedText,
    charCount: metricText.length,
    emojiCount: countEmojis(metricText),
    hasQuestion: /[?？]/.test(metricText),
    hasSticker: Boolean(options?.hasSticker) || contentType === "sticker",
    timestamp: options?.timestamp ?? null,
    contentType,
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSender(value: unknown): MessageSender | null {
  if (value === "me" || value === "them") {
    return value;
  }

  return null;
}

export function sanitizeAiComment(value: unknown) {
  const text = getString(value).replace(/\s+/g, " ");
  return text.slice(0, 80);
}

export function sanitizeAiParagraph(value: unknown, maxLength = 260) {
  const text = getString(value).replace(/\s+/g, " ");
  return text.slice(0, maxLength);
}

export function sanitizeAiExample(value: unknown): WeightReplyExample | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const before = sanitizeAiParagraph(candidate.before, 120);
  const after = sanitizeAiParagraph(candidate.after, 120);
  const reason = sanitizeAiParagraph(candidate.reason, 80);

  if (!before || !after || !reason) {
    return null;
  }

  return {
    before,
    after,
    reason,
  };
}

export function normalizeAnalyzedMessages(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  const messages: AnalyzedMessage[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const sender = getSender(candidate.sender);
    const text = getString(candidate.text);
    const normalized = sender
      ? normalizeMessage(sender, text, messages.length, {
          timestamp: typeof candidate.timestamp === "string" ? candidate.timestamp : null,
          hasSticker: candidate.hasSticker === true,
          contentType: candidate.contentType,
        })
      : null;

    if (normalized) {
      messages.push(normalized);
    }
  }

  return messages;
}

export function normalizeTopicShifts(input: unknown, messages: AnalyzedMessage[]) {
  if (!Array.isArray(input)) {
    return [];
  }

  const lastIndex = Math.max(-1, messages.length - 1);
  const shifts: TopicShift[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const sender = getSender(candidate.sender);
    const messageIndex = typeof candidate.messageIndex === "number" && Number.isInteger(candidate.messageIndex)
      ? candidate.messageIndex
      : null;

    if (!sender || messageIndex === null || messageIndex < 0 || messageIndex > lastIndex) {
      continue;
    }

    shifts.push({ messageIndex, sender });
  }

  return shifts;
}

export function buildConversationSummary(messages: AnalyzedMessage[], topicShifts: TopicShift[]): ConversationSummary {
  const myMessages = messages.filter((message) => message.isMine);
  const theirMessages = messages.filter((message) => !message.isMine);

  return {
    myMessageCount: myMessages.length,
    theirMessageCount: theirMessages.length,
    myTotalChars: myMessages.reduce((sum, message) => sum + message.charCount, 0),
    theirTotalChars: theirMessages.reduce((sum, message) => sum + message.charCount, 0),
    myQuestionMessages: myMessages.filter((message) => message.hasQuestion).length,
    theirQuestionMessages: theirMessages.filter((message) => message.hasQuestion).length,
    myEmojiCount: myMessages.reduce((sum, message) => sum + message.emojiCount, 0),
    theirEmojiCount: theirMessages.reduce((sum, message) => sum + message.emojiCount, 0),
    topicShiftCount: topicShifts.length,
    myTopicShiftCount: topicShifts.filter((shift) => shift.sender === "me").length,
    theirTopicShiftCount: topicShifts.filter((shift) => shift.sender === "them").length,
  };
}

export function parseConversationByMarkers(text: string) {
  const lines = text.replace(/\r/g, "").split("\n");
  const drafts: Array<{ sender: MessageSender; lines: string[] }> = [];
  let current: { sender: MessageSender; lines: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (current && current.lines.length > 0) {
        current.lines.push("");
      }
      continue;
    }

    const meMatch = line.match(ME_MARKERS);
    if (meMatch) {
      current = { sender: "me", lines: [meMatch[2] ?? ""] };
      drafts.push(current);
      continue;
    }

    const themMatch = line.match(THEM_MARKERS);
    if (themMatch) {
      current = { sender: "them", lines: [themMatch[2] ?? ""] };
      drafts.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    current.lines.push(line);
  }

  const messages = drafts
    .map((item, index) => normalizeMessage(item.sender, item.lines.join("\n").trim(), index))
    .filter((message): message is AnalyzedMessage => Boolean(message));

  if (messages.length < 2) {
    return null;
  }

  return messages;
}

export function estimateMessageCount(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  const explicit = parseConversationByMarkers(normalized);
  if (explicit) {
    return explicit.length;
  }

  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const iosHeaders = lines.filter((line) => IOS_HEADER_PATTERN.test(line)).length;
  if (iosHeaders >= 2) {
    return iosHeaders;
  }

  const exportLines = lines.filter((line) => EXPORT_LINE_PATTERN.test(line)).length;
  if (exportLines >= 2) {
    return exportLines;
  }

  return Math.min(lines.length, 200);
}
