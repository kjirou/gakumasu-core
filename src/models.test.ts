import { Card, IdolInProduction, Lesson } from "./types";
import { getCardDataById } from "./data/card";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import {
  createIdolInProduction,
  createLessonGamePlay,
  patchUpdates,
  prepareCardsForLesson,
} from "./models";
import { createIdGenerator } from "./utils";

const createCardsForTest = (ids: Array<Card["id"]>): Card[] => {
  return prepareCardsForLesson(
    ids.map((id) => ({
      id,
      definition: getCardDataById("apirunokihon"),
      enhanced: false,
      enabled: true,
    })),
  );
};

describe("createIdolInProduction", () => {
  test("it creates an idol in production", () => {
    const idGenerator = createIdGenerator();
    const idolInProduction = createIdolInProduction({
      id: "hanamisaki-r-1",
      cards: [
        {
          id: idGenerator(),
          definition: getCardDataById("apirunokihon"),
          enhanced: false,
          enabled: true,
        },
      ],
      specificCardEnhanced: false,
      specificProducerItemEnhanced: false,
      idGenerator,
    });
    expect(idolInProduction).toStrictEqual({
      deck: [
        {
          id: "1",
          definition: getCardDataById("apirunokihon"),
          enhanced: false,
          enabled: true,
        },
        {
          id: "2",
          definition: getCardDataById("shinshinkiei"),
          enhanced: false,
          enabled: true,
        },
      ],
      definition: getIdolDataById("hanamisaki-r-1"),
      life: 32,
      maxLife: 32,
      producerItems: [
        {
          id: "3",
          definition: getProducerItemDataById("bakuonraion"),
          enhanced: false,
        },
      ],
    });
  });
});
describe("createLessonGamePlay", () => {
  test("it creates a lesson game play", () => {
    const idGenerator = createIdGenerator();
    const idolInProduction = createIdolInProduction({
      id: "hanamisaki-r-1",
      cards: [
        {
          id: idGenerator(),
          definition: getCardDataById("apirunokihon"),
          enhanced: false,
          enabled: true,
        },
        {
          id: idGenerator(),
          definition: getCardDataById("pozunokihon"),
          enhanced: false,
          enabled: true,
        },
      ],
      specificCardEnhanced: false,
      specificProducerItemEnhanced: false,
      idGenerator,
    });
    const lessonGamePlay = createLessonGamePlay({
      idolInProduction,
      lastTurnNumber: 6,
    });
    expect(lessonGamePlay).toStrictEqual({
      getRandom: expect.any(Function),
      initialLesson: {
        idol: {
          original: idolInProduction,
          life: 32,
          vitality: 0,
          totalCardUsageCount: 0,
        },
        cards: expect.any(Array),
        hand: [],
        deck: expect.any(Array),
        discardPile: [],
        removedCardPile: [],
        selectedCardInHandIndex: undefined,
        score: 0,
        turnNumber: 1,
        lastTurnNumber: 6,
      },
      updates: [],
    });
  });
});
describe("patchUpdates", () => {
  describe("hand", () => {
    test("it works", () => {
      const lessonMock = {
        hand: ["1"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "hand",
          cardIds: ["2", "3"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.hand).toStrictEqual(["2", "3"]);
    });
  });
  describe("deck", () => {
    test("it works", () => {
      const lessonMock = {
        deck: ["1"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "deck",
          cardIds: ["2", "3"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.deck).toStrictEqual(["2", "3"]);
    });
  });
  describe("discardPile", () => {
    test("it works", () => {
      const lessonMock = {
        discardPile: ["1"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "discardPile",
          cardIds: ["2", "3"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.discardPile).toStrictEqual(["2", "3"]);
    });
  });
  describe("removedCardPile", () => {
    test("it works", () => {
      const lessonMock = {
        removedCardPile: ["1"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "removedCardPile",
          cardIds: ["2", "3"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.removedCardPile).toStrictEqual(["2", "3"]);
    });
  });
});
