import { Card, Idol, IdolInProduction, Lesson, Modifier } from "./types";
import { getCardDataById } from "./data/card";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import {
  calculateClearScoreProgress,
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
describe("calculateClearScoreProgress", () => {
  const testCases: Array<{
    args: Parameters<typeof calculateClearScoreProgress>;
    expected: ReturnType<typeof calculateClearScoreProgress>;
  }> = [
    {
      args: [0, { clear: 100 }],
      expected: {
        necessaryClearScore: 100,
        necessaryPerfectScore: undefined,
        remainingClearScore: 100,
        remainingPerfectScore: undefined,
        clearScoreProgressPercentage: 0,
      },
    },
    {
      args: [10, { clear: 1000 }],
      expected: {
        necessaryClearScore: 1000,
        necessaryPerfectScore: undefined,
        remainingClearScore: 990,
        remainingPerfectScore: undefined,
        clearScoreProgressPercentage: 1,
      },
    },
    {
      args: [9, { clear: 1000 }],
      expected: {
        necessaryClearScore: 1000,
        necessaryPerfectScore: undefined,
        remainingClearScore: 991,
        remainingPerfectScore: undefined,
        clearScoreProgressPercentage: 0,
      },
    },
    {
      args: [50, { clear: 100, perfect: 300 }],
      expected: {
        necessaryClearScore: 100,
        necessaryPerfectScore: 300,
        remainingClearScore: 50,
        remainingPerfectScore: 250,
        clearScoreProgressPercentage: 50,
      },
    },
  ];
  test.each(testCases)(
    "$args.0, $args.1 => $expected",
    ({ args, expected }) => {
      expect(calculateClearScoreProgress(...args)).toStrictEqual(expected);
    },
  );
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
      idGenerator: expect.any(Function),
      initialLesson: {
        clearScoreThresholds: undefined,
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
        remainingTurns: 0,
      },
      updates: [],
    });
  });
});
describe("patchUpdates", () => {
  describe("cardEnhancement", () => {
    test("it works", () => {
      const lessonMock = {
        cards: [
          {
            id: "1",
            enhancements: [] as Card["enhancements"],
          },
          {
            id: "2",
            enhancements: [] as Card["enhancements"],
          },
        ],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "cardEnhancement",
          cardIds: ["1"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.cards[0].enhancements).toStrictEqual([{ kind: "effect" }]);
      expect(lesson.cards[1].enhancements).toStrictEqual([]);
    });
  });
  describe("cardPlacement", () => {
    test("全てのプロパティが存在する", () => {
      const lessonMock = {
        deck: ["1"],
        discardPile: ["2"],
        hand: ["3"],
        removedCardPile: ["4"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "cardPlacement",
          deck: ["11", "111"],
          discardPile: ["22", "222"],
          hand: ["33", "333"],
          removedCardPile: ["44", "444"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.deck).toStrictEqual(["11", "111"]);
      expect(lesson.discardPile).toStrictEqual(["22", "222"]);
      expect(lesson.hand).toStrictEqual(["33", "333"]);
      expect(lesson.removedCardPile).toStrictEqual(["44", "444"]);
    });
    test("deckとdiscardPileのみ", () => {
      const lessonMock = {
        deck: ["1"],
        discardPile: ["2"],
        hand: ["3"],
        removedCardPile: ["4"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "cardPlacement",
          deck: ["11", "111"],
          discardPile: ["22", "222"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.deck).toStrictEqual(["11", "111"]);
      expect(lesson.discardPile).toStrictEqual(["22", "222"]);
      expect(lesson.hand).toStrictEqual(["3"]);
      expect(lesson.removedCardPile).toStrictEqual(["4"]);
    });
    test("handとremovedCardPileのみ", () => {
      const lessonMock = {
        deck: ["1"],
        discardPile: ["2"],
        hand: ["3"],
        removedCardPile: ["4"],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "cardPlacement",
          hand: ["33", "333"],
          removedCardPile: ["44", "444"],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.deck).toStrictEqual(["1"]);
      expect(lesson.discardPile).toStrictEqual(["2"]);
      expect(lesson.hand).toStrictEqual(["33", "333"]);
      expect(lesson.removedCardPile).toStrictEqual(["44", "444"]);
    });
  });
  describe("cards", () => {
    test("it works", () => {
      const lessonMock = {
        cards: [
          {
            id: "1",
          },
          {
            id: "2",
          },
        ],
      } as Lesson;
      const lesson = patchUpdates(lessonMock, [
        {
          kind: "cards",
          cards: [],
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lesson.cards).toStrictEqual([]);
    });
  });
  describe("modifier", () => {
    describe("新規追加", () => {
      test("同種の状態修正が存在しない時、末尾へ新規追加する", () => {
        let lessonMock = {
          idol: {
            modifiers: [
              {
                kind: "focus",
                amount: 1,
              },
            ],
          },
        } as Lesson;
        lessonMock = patchUpdates(lessonMock, [
          {
            kind: "modifier",
            modifier: {
              kind: "goodCondition",
              duration: 2,
            },
            reason: {
              kind: "lessonStartTrigger",
              historyTurnNumber: 1,
              historyResultIndex: 1,
            },
          },
        ]);
        expect(lessonMock.idol.modifiers).toStrictEqual([
          {
            kind: "focus",
            amount: 1,
          },
          {
            kind: "goodCondition",
            duration: 2,
          },
        ]);
      });
      test("一部の状態修正は、同種のものが存在しても新規追加する", () => {
        let lessonMock = {
          idol: {
            modifiers: [
              {
                kind: "delayedEffect",
              },
            ],
          },
        } as Lesson;
        lessonMock = patchUpdates(lessonMock, [
          {
            kind: "modifier",
            modifier: {
              kind: "delayedEffect",
            } as Extract<Modifier, { kind: "delayedEffect" }>,
            reason: {
              kind: "lessonStartTrigger",
              historyTurnNumber: 1,
              historyResultIndex: 1,
            },
          },
        ]);
        expect(lessonMock.idol.modifiers).toStrictEqual([
          {
            kind: "delayedEffect",
          },
          {
            kind: "delayedEffect",
          },
        ]);
      });
    });
    describe("増減対象のプロパティがamountのものの合算", () => {
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
                modifier: {
                  kind: modifierKind,
                  amount: 2,
                },
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
                modifier: {
                  kind: modifierKind,
                  amount: -1,
                },
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
                modifier: {
                  kind: modifierKind,
                  amount: -5,
                },
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
    describe("増減対象のプロパティがdurationのものの合算", () => {
      const modifierKinds = ["excellentCondition", "goodCondition"] as const;
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
                modifier: {
                  kind: modifierKind,
                  duration: 2,
                },
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
                modifier: {
                  kind: modifierKind,
                  duration: -1,
                },
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
                modifier: {
                  kind: modifierKind,
                  duration: -5,
                },
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
    describe("増減対象のプロパティがtimesのものの合算", () => {
      const modifierKinds = ["debuffProtection", "doubleEffect"] as const;
      for (const modifierKind of modifierKinds) {
        describe(modifierKind, () => {
          test("増加する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    times: 1,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  times: 2,
                },
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
                times: 3,
              },
            ]);
          });
          test("減少する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    times: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  times: -1,
                },
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
                times: 4,
              },
            ]);
          });
          test("減少した結果0になった時、削除する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    times: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  times: -5,
                },
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
    describe("増減対象のプロパティがvalueのものの合算", () => {
      const modifierKinds = ["lifeConsumptionReduction"] as const;
      for (const modifierKind of modifierKinds) {
        describe(modifierKind, () => {
          test("増加する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    value: 1,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  value: 2,
                },
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
                value: 3,
              },
            ]);
          });
          test("減少する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    value: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  value: -1,
                },
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
                value: 4,
              },
            ]);
          });
          test("減少した結果0になった時、削除する", () => {
            let lessonMock = {
              idol: {
                modifiers: [
                  {
                    kind: modifierKind,
                    value: 5,
                  },
                ],
              },
            } as Lesson;
            lessonMock = patchUpdates(lessonMock, [
              {
                kind: "modifier",
                modifier: {
                  kind: modifierKind,
                  value: -5,
                },
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
  describe("remainingTurns", () => {
    test("it works", () => {
      let lessonMock = {
        remainingTurns: 0,
      } as Lesson;
      lessonMock = patchUpdates(lessonMock, [
        {
          kind: "remainingTurns",
          amount: 1,
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lessonMock.remainingTurns).toBe(1);
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
  describe("score", () => {
    test("it works", () => {
      let lessonMock = {
        score: 1,
      } as Lesson;
      lessonMock = patchUpdates(lessonMock, [
        {
          kind: "score",
          actual: 2,
          max: 3,
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lessonMock.score).toBe(3);
    });
  });
  describe("turnNumberIncrease", () => {
    test("it works", () => {
      let lessonMock = {
        turnNumber: 0,
      } as Lesson;
      lessonMock = patchUpdates(lessonMock, [
        {
          kind: "turnNumberIncrease",
          reason: {
            kind: "lessonStartTrigger",
            historyTurnNumber: 1,
            historyResultIndex: 1,
          },
        },
      ]);
      expect(lessonMock.turnNumber).toBe(1);
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
