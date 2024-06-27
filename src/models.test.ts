import { Card, Idol, IdolInProduction, Lesson } from "./types";
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
      idolDefinitionId: "hanamisaki-r-1",
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
          id: "2",
          definition: getCardDataById("shinshinkiei"),
          enhanced: false,
          enabled: true,
        },
        {
          id: "1",
          definition: getCardDataById("apirunokihon"),
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
      idolDefinitionId: "hanamisaki-r-1",
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
          modifiers: [],
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
  describe("modifier", () => {
    describe("増減対象のプロパティがamountのもの", () => {
      const modifierKinds = [
        "focus",
        "motivation",
        "positiveImpression",
      ] as const;
      for (const modifierKind of modifierKinds) {
        describe(modifierKind, () => {
          test("増加する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    amount: 1,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: 2,
                max: 5,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([
              {
                kind: modifierKind,
                amount: 3,
              },
            ]);
          });
          test("減少する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    amount: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: -1,
                max: -2,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([
              {
                kind: modifierKind,
                amount: 4,
              },
            ]);
          });
          test("減少した結果0になった時、削除する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    amount: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: -5,
                max: -6,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([]);
          });
        });
      }
    });
    describe("増減対象のプロパティがdurationのもの", () => {
      const modifierKinds = ["goodCondition"] as const;
      for (const modifierKind of modifierKinds) {
        describe(modifierKind, () => {
          test("増加する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    duration: 1,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: 2,
                max: 5,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([
              {
                kind: modifierKind,
                duration: 3,
              },
            ]);
          });
          test("減少する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    duration: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: -1,
                max: -2,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([
              {
                kind: modifierKind,
                duration: 4,
              },
            ]);
          });
          test("減少した結果0になった時、削除する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    duration: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifierKind: modifierKind,
                actual: -5,
                max: -6,
                reason: {
                  kind: "lessonStartTrigger",
                  historyTurnNumber: 1,
                  historyResultIndex: 1,
                },
              },
            ]);
            expect(lessonMock.idol.modifiers).toStrictEqual([]);
          });
        });
      }
    });
  });
  describe("life", () => {
    test("it works", () => {
      let lessonMock = {
        idol: {
          life: 5,
        },
      } as Lesson;
      lessonMock = patchUpdates(lessonMock, [
        {
          kind: "life",
          actual: -2,
          max: -3,
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lessonMock.idol.life).toBe(3);
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
  describe("selectedCardInHandIndex", () => {
    test("it works", () => {
      const lessonMock = {
        selectedCardInHandIndex: undefined,
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "selectedCardInHandIndex",
          index: 1,
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.selectedCardInHandIndex).toBe(1);
    });
  });
  describe("vitality", () => {
    test("it works", () => {
      let lessonMock = {
        idol: {
          vitality: 5,
        },
      } as Lesson;
      lessonMock = patchUpdates(lessonMock, [
        {
          kind: "vitality",
          actual: -2,
          max: -3,
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lessonMock.idol.vitality).toBe(3);
    });
  });
});
