import { axisPriority, questions, type AxisKey, type Scores } from "@/data/questions";
import { results, type ResultType } from "@/data/results";

function createEmptyScores(): Scores {
  return { o: 0, s: 0, f: 0, a: 0 };
}

export function calculateScores(answerIndexes: number[]) {
  return questions.reduce<Scores>((totals, question, questionIndex) => {
    const choiceIndex = answerIndexes[questionIndex];
    const choice = question.choices[choiceIndex];

    if (!choice) {
      return totals;
    }

    return {
      o: totals.o + choice.scores.o,
      s: totals.s + choice.scores.s,
      f: totals.f + choice.scores.f,
      a: totals.a + choice.scores.a,
    };
  }, createEmptyScores());
}

export function rankAxes(scores: Scores) {
  return [...axisPriority].sort((left, right) => {
    const scoreDiff = scores[right] - scores[left];
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return axisPriority.indexOf(left) - axisPriority.indexOf(right);
  });
}

export function getResultType(scores: Scores): ResultType {
  const ranked = rankAxes(scores);
  return `${ranked[0]}_${ranked[1]}` as ResultType;
}

export function isResultType(value: string): value is ResultType {
  return value in results;
}

export function diagnoseAnswers(answerIndexes: number[]) {
  const scores = calculateScores(answerIndexes);
  const type = getResultType(scores);
  const result = results[type];

  if (!result) {
    throw new Error(`Unknown result type: ${type}`);
  }

  return { scores, type, result };
}

export function getDominantAxisLabel(axis: AxisKey) {
  return {
    o: "攻勢度",
    s: "条件度",
    f: "疲労度",
    a: "覚醒度",
  }[axis];
}
