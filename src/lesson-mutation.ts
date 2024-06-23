import { Card, GetRandom, Lesson, LessonUpdateQuery } from "./types";
import { shuffleArray } from "./utils";

/**
 * 山札から指定数のスキルカードを引く
 *
 * - 山札がなくなった場合は、捨札をシャッフルして山札にする
 */
export const drawCardsFromDeck = (
  deck: Lesson["deck"],
  count: number,
  discardPile: Lesson["discardPile"],
  getRandom: GetRandom,
): {
  deck: Array<Card["id"]>;
  discardPile: Array<Card["id"]>;
  drawnCards: Array<Card["id"]>;
} => {
  let newDeck = deck;
  let newDiscardPile = discardPile;
  let drawnCards = [];
  for (let i = 0; i < count; i++) {
    if (newDeck.length === 0) {
      newDeck = shuffleArray(newDiscardPile, getRandom);
      newDiscardPile = [];
    }
    const drawnCard = newDeck.shift();
    if (!drawnCard) {
      throw new Error("Unexpected empty deck");
    }
    drawnCards.push(drawnCard);
  }
  return {
    deck: newDeck,
    discardPile: newDiscardPile,
    drawnCards,
  };
};

/**
 * ターン開始時に手札を引く
 *
 * - TODO: レッスン開始時に手札
 * - TODO: 手札最大枚数の制限
 */
export const drawCardsInHandOnLessonStart = (
  lesson: Lesson,
  params: {
    count: number;
    getRandom: GetRandom;
    historyResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"];
  },
): LessonUpdateQuery[] => {
  const { deck, discardPile, drawnCards } = drawCardsFromDeck(
    lesson.deck,
    params.count,
    lesson.discardPile,
    params.getRandom,
  );
  return [
    {
      kind: "hand",
      cardIds: drawnCards,
      reason: {
        kind: "lessonStartTrigger",
        historyTurnNumber: lesson.turnNumber,
        historyResultIndex: params.historyResultIndex,
      },
    },
    {
      kind: "deck",
      cardIds: deck,
      reason: {
        kind: "lessonStartTrigger",
        historyTurnNumber: lesson.turnNumber,
        historyResultIndex: params.historyResultIndex,
      },
    },
    {
      kind: "discardPile",
      cardIds: discardPile,
      reason: {
        kind: "lessonStartTrigger",
        historyTurnNumber: lesson.turnNumber,
        historyResultIndex: params.historyResultIndex,
      },
    },
  ];
};
