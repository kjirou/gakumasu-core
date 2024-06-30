import {
  Card,
  CardDefinition,
  CardInProduction,
  Idol,
  IdolDefinition,
  IdolInProduction,
  Lesson,
} from "./types";
import { cards, getCardDataById } from "./data/card";
import {
  addCardsToHandOrDiscardPile,
  calculatePerformingScoreEffect,
  calculatePerformingVitalityEffect,
  createCardPlacementDiff,
  drawCardsFromDeck,
  drawCardsOnLessonStart,
  useCard,
} from "./lesson-mutation";
import {
  createIdolInProduction,
  createLesson,
  prepareCardsForLesson,
} from "./models";
import { createIdGenerator } from "./utils";

describe("drawCardsFromDeck", () => {
  test("山札がなくならない状態で1枚引いた時、1枚引けて、山札が1枚減る", () => {
    const deck = ["1", "2", "3"];
    const { drawnCards, deck: newDeck } = drawCardsFromDeck(
      deck,
      1,
      [],
      Math.random,
    );
    expect(drawnCards).toHaveLength(1);
    expect(newDeck).toHaveLength(2);
  });
  test("山札の最後の1枚を1枚だけ引いた時、1枚引けて、山札が1枚減り、捨札は変わらない", () => {
    const deck = ["1", "2", "3"];
    const discardPile = ["4"];
    const {
      drawnCards,
      deck: newDeck,
      discardPile: newDiscardPile,
    } = drawCardsFromDeck(deck, 1, discardPile, Math.random);
    expect(drawnCards).toHaveLength(1);
    expect(newDeck).toHaveLength(2);
    expect(newDiscardPile).toStrictEqual(discardPile);
  });
  test("山札が残り1枚で2枚引いた時、2枚引けて、捨札は山札に移動して空になり、山札は捨札の-1枚の数になる", () => {
    const deck = ["1"];
    const discardPile = ["2", "3", "4", "5"];
    const {
      drawnCards,
      deck: newDeck,
      discardPile: newDiscardPile,
    } = drawCardsFromDeck(deck, 2, discardPile, Math.random);
    expect(drawnCards).toHaveLength(2);
    expect(newDeck).toHaveLength(3);
    expect(newDiscardPile).toStrictEqual([]);
    expect([...drawnCards, ...newDeck].sort()).toStrictEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });
});
describe("addCardsToHandOrDiscardPile", () => {
  const testCases: {
    args: Parameters<typeof addCardsToHandOrDiscardPile>;
    expected: ReturnType<typeof addCardsToHandOrDiscardPile>;
  }[] = [
    {
      args: [["1", "2", "3", "4", "5"], [], []],
      expected: {
        hand: ["1", "2", "3", "4", "5"],
        discardPile: [],
      },
    },
    {
      args: [["1", "2", "3", "4", "5", "6", "7"], [], []],
      expected: {
        hand: ["1", "2", "3", "4", "5"],
        discardPile: ["6", "7"],
      },
    },
    {
      args: [["3", "4", "5"], ["1", "2"], []],
      expected: {
        hand: ["1", "2", "3", "4", "5"],
        discardPile: [],
      },
    },
    {
      args: [["3", "4", "5", "6", "7"], ["1", "2"], []],
      expected: {
        hand: ["1", "2", "3", "4", "5"],
        discardPile: ["6", "7"],
      },
    },
    {
      args: [
        ["8", "9"],
        ["1", "2", "3", "4", "5"],
        ["6", "7"],
      ],
      expected: {
        hand: ["1", "2", "3", "4", "5"],
        discardPile: ["6", "7", "8", "9"],
      },
    },
  ];
  test.each(testCases)(
    "Drawn:$args.0, Hand:$args.1, Discard:$args.2 => Hand:$expected.hand, Discard:$expected.discardPile",
    ({ args, expected }) => {
      expect(addCardsToHandOrDiscardPile(...args)).toStrictEqual(expected);
    },
  );
});
describe("createCardPlacementDiff", () => {
  const testCases: {
    args: Parameters<typeof createCardPlacementDiff>;
    expected: ReturnType<typeof createCardPlacementDiff>;
    name: string;
  }[] = [
    {
      name: "before側だけ存在しても差分は返さない",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {},
      ],
      expected: { kind: "cardPlacement" },
    },
    {
      name: "after側だけ存在しても差分は返さない",
      args: [
        {},
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
      ],
      expected: { kind: "cardPlacement" },
    },
    {
      name: "全ての値がbefore/afterで同じ場合は差分を返さない",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
      ],
      expected: { kind: "cardPlacement" },
    },
    {
      name: "deckのみの差分を返せる",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {
          deck: ["11"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
      ],
      expected: { kind: "cardPlacement", deck: ["11"] },
    },
    {
      name: "discardPileのみの差分を返せる",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {
          deck: ["1"],
          discardPile: ["22"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
      ],
      expected: { kind: "cardPlacement", discardPile: ["22"] },
    },
    {
      name: "handのみの差分を返せる",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["33"],
          removedCardPile: ["4"],
        },
      ],
      expected: { kind: "cardPlacement", hand: ["33"] },
    },
    {
      name: "removedCardPileのみの差分を返せる",
      args: [
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["4"],
        },
        {
          deck: ["1"],
          discardPile: ["2"],
          hand: ["3"],
          removedCardPile: ["44"],
        },
      ],
      expected: { kind: "cardPlacement", removedCardPile: ["44"] },
    },
  ];
  test.each(testCases)("$name", ({ args, expected }) => {
    expect(createCardPlacementDiff(...args)).toStrictEqual(expected);
  });
});
describe("drawCardsOnLessonStart", () => {
  test("山札に引く数が残っている時、山札はその分減り、捨札に変化はない", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2", "3"],
      discardPile: ["4"],
    } as Lesson;
    const updates = drawCardsOnLessonStart(lessonMock, {
      count: 3,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    const update = updates.find((e) => e.kind === "cardPlacement") as any;
    expect(update.hand).toHaveLength(3);
    expect(update.deck).toHaveLength(0);
    expect(update.discardPile).toBeUndefined();
    expect(update.removedCardPile).toBeUndefined();
  });
  test("山札に引く数が残っていない時、山札は再構築された上で残りの引く数分減り、捨札は空になる", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2"],
      discardPile: ["3", "4"],
    } as Lesson;
    const updates = drawCardsOnLessonStart(lessonMock, {
      count: 3,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    const update = updates.find((e) => e.kind === "cardPlacement") as any;
    expect(update.hand).toHaveLength(3);
    expect(update.deck).toHaveLength(1);
    expect(update.discardPile).toHaveLength(0);
    expect(update.removedCardPile).toBeUndefined();
  });
  test("手札最大数を超える枚数を引いた時、入らないスキルカードは捨札へ移動する", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2", "3", "4", "5", "6"],
      discardPile: [] as Lesson["discardPile"],
    } as Lesson;
    const updates = drawCardsOnLessonStart(lessonMock, {
      count: 6,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    const update = updates.find((e) => e.kind === "cardPlacement") as any;
    expect(update.hand).toHaveLength(5);
    expect(update.deck).toHaveLength(0);
    expect(update.discardPile).toHaveLength(1);
    expect(update.removedCardPile).toBeUndefined();
  });
});
describe("calculatePerformingScoreEffect", () => {
  const testCases: {
    args: Parameters<typeof calculatePerformingScoreEffect>;
    expected: ReturnType<typeof calculatePerformingScoreEffect>;
    name: string;
  }[] = [
    {
      name: "状態変化などの条件がない時、指定通りのスコアを返す",
      args: [
        {
          modifiers: [] as Idol["modifiers"],
        } as Idol,
        undefined,
        { value: 9 },
      ],
      expected: [{ kind: "score", actual: 9, max: 9 }],
    },
    {
      name: "アイドルへ好調のみが付与されている時、1.5倍（端数切り上げ）したスコアを返す",
      args: [
        {
          modifiers: [{ kind: "goodCondition", duration: 1 }],
        } as Idol,
        undefined,
        { value: 9 },
      ],
      expected: [{ kind: "score", actual: 14, max: 14 }],
    },
    {
      name: "アイドルへ集中のみが付与されている時、その分を加算したスコアを返す",
      args: [
        {
          modifiers: [{ kind: "focus", amount: 1 }],
        } as Idol,
        undefined,
        { value: 9 },
      ],
      expected: [{ kind: "score", actual: 10, max: 10 }],
    },
    {
      name: "アイドルへ好調と集中が付与されている時、集中分も好調の倍率の影響を受ける",
      args: [
        {
          modifiers: [
            { kind: "goodCondition", duration: 1 },
            { kind: "focus", amount: 3 },
          ],
        } as Idol,
        undefined,
        { value: 1 },
      ],
      expected: [{ kind: "score", actual: 6, max: 6 }],
    },
    {
      name: "アイドルへ好調と絶好調が付与されている時、(1.5 + 好調ターン数 * 0.1)倍したスコアを返す",
      args: [
        {
          modifiers: [
            { kind: "goodCondition", duration: 5 },
            { kind: "excellentCondition", duration: 1 },
          ],
        } as Idol,
        undefined,
        { value: 10 },
      ],
      expected: [{ kind: "score", actual: 20, max: 20 }],
    },
    {
      name: "アイドルへ絶好調のみが付与されている時、好調の効果は発動しない",
      args: [
        {
          modifiers: [{ kind: "excellentCondition", duration: 1 }],
        } as Idol,
        undefined,
        { value: 10 },
      ],
      expected: [{ kind: "score", actual: 10, max: 10 }],
    },
    {
      name: "スコアのクエリに集中増幅効果が指定されている時、集中の効果をその倍率分増加する",
      args: [
        {
          modifiers: [{ kind: "focus", amount: 1 }],
        } as Idol,
        undefined,
        { value: 1, focusMultiplier: 2.0 },
      ],
      expected: [{ kind: "score", actual: 3, max: 3 }],
    },
    {
      name: "スコアのクエリに回数が指定されている時、状態修正や集中増幅効果などの影響を反映した結果を回数分の結果で返す",
      args: [
        {
          modifiers: [{ kind: "focus", amount: 1 }],
        } as Idol,
        undefined,
        { value: 1, focusMultiplier: 2.0, times: 2 },
      ],
      expected: [
        { kind: "score", actual: 3, max: 3 },
        { kind: "score", actual: 3, max: 3 },
      ],
    },
    {
      name: "スコア増加値の上限が設定されている時、actualはその値を超えない",
      args: [
        {
          modifiers: [] as Idol["modifiers"],
        } as Idol,
        6,
        { value: 10 },
      ],
      expected: [{ kind: "score", actual: 6, max: 10 }],
    },
    {
      name: "スコア増加値の上限が設定されている中で複数回スコア増加の時、スコア増加の累計と上限を比較する",
      args: [
        {
          modifiers: [] as Idol["modifiers"],
        } as Idol,
        16,
        { value: 10, times: 3 },
      ],
      expected: [
        { kind: "score", actual: 10, max: 10 },
        { kind: "score", actual: 6, max: 10 },
        { kind: "score", actual: 0, max: 10 },
      ],
    },
    {
      name: "集中:4,好調:6,絶好調:有,ハイタッチ{未強化,+17,集中*1.5} は `(17 + 4 * 1.5) * (1.5 + 0.6) = 48.30` で 49 を返す",
      args: [
        {
          modifiers: [
            { kind: "focus", amount: 4 },
            { kind: "goodCondition", duration: 6 },
            { kind: "excellentCondition", duration: 1 },
          ] as Idol["modifiers"],
        } as Idol,
        undefined,
        { value: 17, focusMultiplier: 1.5 },
      ],
      expected: [{ kind: "score", actual: 49, max: 49 }],
    },
  ];
  test.each(testCases)("$name", ({ args, expected }) => {
    expect(calculatePerformingScoreEffect(...args)).toStrictEqual(expected);
  });
});
describe("calculatePerformingVitalityEffect", () => {
  const testCases: {
    args: Parameters<typeof calculatePerformingVitalityEffect>;
    expected: ReturnType<typeof calculatePerformingVitalityEffect>;
    name: string;
  }[] = [
    {
      name: "通常の元気増加",
      args: [
        {
          vitality: 0,
          modifiers: [] as Idol["modifiers"],
        } as Idol,
        { value: 1 },
      ],
      expected: {
        kind: "vitality",
        actual: 1,
        max: 1,
      },
    },
    {
      name: "やる気の数値を元気増加時に加算する",
      args: [
        {
          vitality: 0,
          modifiers: [{ kind: "motivation", amount: 10 }] as Idol["modifiers"],
        } as Idol,
        { value: 1 },
      ],
      expected: {
        kind: "vitality",
        actual: 11,
        max: 11,
      },
    },
    {
      name: "「レッスン中に使用したスキルカード1枚ごとに、元気増加量+n」の効果",
      args: [
        {
          vitality: 0,
          modifiers: [] as Idol["modifiers"],
          totalCardUsageCount: 3,
        } as Idol,
        { value: 1, boostPerCardUsed: 2 },
      ],
      expected: {
        kind: "vitality",
        actual: 7,
        max: 7,
      },
    },
    {
      name: "固定元気の時、他のいかなる修正も無視する",
      args: [
        {
          vitality: 0,
          modifiers: [{ kind: "motivation", amount: 10 }] as Idol["modifiers"],
          totalCardUsageCount: 3,
        } as Idol,
        { value: 1, boostPerCardUsed: 2, fixedValue: true },
      ],
      expected: {
        kind: "vitality",
        actual: 1,
        max: 1,
      },
    },
  ];
  test.each(testCases)("$name", ({ args, expected }) => {
    expect(calculatePerformingVitalityEffect(...args)).toStrictEqual(expected);
  });
});
describe("useCard", () => {
  const createLessonForTest = (
    overwrites: Partial<Parameters<typeof createIdolInProduction>[0]> = {},
  ): Lesson => {
    const idolInProduction = createIdolInProduction({
      // Pアイテムが最終ターンにならないと発動しないので、テストデータとして優秀
      idolDefinitionId: "shinosawahiro-r-1",
      cards: [],
      specificCardEnhanced: false,
      specificProducerItemEnhanced: false,
      idGenerator: createIdGenerator(),
      ...overwrites,
    });
    return createLesson({
      clearScoreThresholds: undefined,
      getRandom: Math.random,
      idolInProduction,
      lastTurnNumber: 6,
    });
  };
  describe("使用した手札を捨札か除外へ移動", () => {
    test("「レッスン中1回」ではない手札を使った時は、捨札へ移動", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("apirunokihon"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      const update = updates.find((e) => e.kind === "cardPlacement") as any;
      expect(update.hand).toStrictEqual([]);
      expect(update.deck).toBeUndefined();
      expect(update.discardPile).toStrictEqual(["a"]);
      expect(update.removedCardPile).toBeUndefined();
    });
    test("「レッスン中1回」の手札を使った時は、除外へ移動", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("hyogennokihon"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      const update = updates.find((e) => e.kind === "cardPlacement") as any;
      expect(update.hand).toStrictEqual([]);
      expect(update.deck).toBeUndefined();
      expect(update.discardPile).toBeUndefined();
      expect(update.removedCardPile).toStrictEqual(["a"]);
    });
  });
  describe("コスト消費", () => {
    test("全て元気で賄った時のnormal", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("apirunokihon"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      lesson.idol.vitality = 4;
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      expect(updates.find((e) => e.kind === "vitality")).toStrictEqual({
        kind: "vitality",
        actual: -4,
        max: -4,
        reason: expect.any(Object),
      });
      expect(updates.find((e) => e.kind === "life")).toBeUndefined();
    });
    test("一部を元気で賄った時のnormal", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("apirunokihon"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      lesson.idol.vitality = 3;
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      expect(updates.find((e) => e.kind === "vitality")).toStrictEqual({
        kind: "vitality",
        actual: -3,
        max: -4,
        reason: expect.any(Object),
      });
      expect(updates.find((e) => e.kind === "life")).toStrictEqual({
        kind: "life",
        actual: -1,
        max: -1,
        reason: expect.any(Object),
      });
    });
    test("life", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("genkinaaisatsu"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      expect(updates.find((e) => e.kind === "life")).toStrictEqual({
        kind: "life",
        actual: -4,
        max: -4,
        reason: expect.any(Object),
      });
    });
    test("プロパティにamountがあるmodifier", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("minnadaisuki"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      expect(updates.find((e) => e.kind === "modifier")).toStrictEqual({
        kind: "modifier",
        modifier: {
          kind: "motivation",
          amount: 3,
        },
        reason: expect.any(Object),
      });
    });
    test("プロパティにdurationがあるmodifier", () => {
      const lesson = createLessonForTest({
        cards: [
          {
            id: "a",
            definition: getCardDataById("sonzaikan"),
            enabled: true,
            enhanced: false,
          },
        ],
      });
      lesson.hand = ["a"];
      const { updates } = useCard(lesson, 1, {
        selectedCardInHandIndex: 0,
        getRandom: () => 0,
        idGenerator: createIdGenerator(),
      });
      expect(updates.find((e) => e.kind === "modifier")).toStrictEqual({
        kind: "modifier",
        modifier: {
          kind: "goodCondition",
          duration: 2,
        },
        reason: expect.any(Object),
      });
    });
  });
  describe("効果発動", () => {
    describe("drawCards", () => {
      test("「アイドル宣言」を、山札が足りる・手札最大枚数を超えない状況で使った時、手札が2枚増え、捨札は不変で、除外が1枚増える", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("aidorusengen"),
              enabled: true,
              enhanced: false,
            },
            ...["b", "c"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            })),
          ],
        });
        lesson.hand = ["a"];
        lesson.deck = ["b", "c"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        // 手札使用時の更新があるため、効果による手札増加は2番目の更新になる
        const update = updates.filter(
          (e) => e.kind === "cardPlacement",
        )[1] as any;
        expect(update.hand).toHaveLength(2);
        expect(update.deck).toHaveLength(0);
        expect(update.discardPile).toBeUndefined();
        expect(update.removedCardPile).toBeUndefined();
      });
      test("「アイドル宣言」を、山札が足りない状況で使った時、山札と捨札は再構築される", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("aidorusengen"),
              enabled: true,
              enhanced: false,
            },
            ...["b", "c", "d"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            })),
          ],
        });
        lesson.hand = ["a"];
        lesson.deck = ["b"];
        lesson.discardPile = ["c", "d"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        // 手札使用時の更新があるため、効果による手札増加は2番目の更新になる
        const update = updates.filter(
          (e) => e.kind === "cardPlacement",
        )[1] as any;
        expect(update.hand).toHaveLength(2);
        expect(update.deck).toHaveLength(1);
        expect(update.discardPile).toHaveLength(0);
        expect(update.removedCardPile).toBeUndefined();
      });
      test("「アイドル宣言」を、手札最大枚数が超える状況で使った時、手札は最大枚数で、捨札が増える", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("aidorusengen"),
              enabled: true,
              enhanced: false,
            },
            ...["b", "c", "d", "e", "f", "g"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            })),
          ],
        });
        lesson.hand = ["a", "b", "c", "d", "e"];
        lesson.deck = ["f", "g"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        // 手札使用時の更新があるため、効果による手札増加は2番目の更新になる
        const update = updates.filter(
          (e) => e.kind === "cardPlacement",
        )[1] as any;
        expect(update.hand).toHaveLength(5);
        expect(update.deck).toHaveLength(0);
        expect(update.discardPile).toHaveLength(1);
        expect(update.removedCardPile).toBeUndefined();
      });
    });
    describe("enhanceHand", () => {
      test("「ティーパーティ」は、自分以外の、プロデュース中またはレッスン中に強化していない手札のみを強化する", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("teipatei"),
              enabled: true,
              enhanced: false,
            },
            ...["b", "c", "d"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            })),
            ...["e"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: true,
            })),
          ],
        });
        lesson.hand = ["a", "b", "c", "d", "e"];
        const dCard = lesson.cards.find((e) => e.id === "d") as Card;
        dCard.enhancements = [{ kind: "effect" }];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const enhancedCardIds = (
          updates.find((e) => e.kind === "cardEnhancement") as any
        ).cardIds;
        expect(enhancedCardIds).not.toContain("a");
        expect(enhancedCardIds).toContain("b");
        expect(enhancedCardIds).toContain("c");
        expect(enhancedCardIds).not.toContain("d");
        expect(enhancedCardIds).not.toContain("e");
      });
    });
    describe("exchangeHand", () => {
      test("「仕切り直し」を、手札3枚の状況で使った時、残りの手札は捨札へ入り、手札は山札から引いた新しい2枚になる", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("shikirinaoshi"),
              enabled: true,
              enhanced: false,
            },
            ...["b", "c", "d", "e", "f"].map((id) => ({
              id,
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            })),
          ],
        });
        lesson.hand = ["a", "b", "c"];
        lesson.deck = ["d", "e"];
        lesson.discardPile = ["f"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        // 手札使用時の更新があるため、効果による手札増加は2番目の更新になる
        const update = updates.filter(
          (e) => e.kind === "cardPlacement",
        )[1] as any;
        expect(update.hand).toHaveLength(2);
        expect(update.hand).toContain("d");
        expect(update.hand).toContain("e");
        expect(update.deck).toHaveLength(0);
        expect(update.discardPile).toHaveLength(3);
        expect(update.discardPile).toContain("b");
        expect(update.discardPile).toContain("c");
        expect(update.discardPile).toContain("f");
        expect(update.removedCardPile).toBeUndefined();
      });
    });
    describe("generateCard", () => {
      test("強化済みのSSRカードを生成して手札に入る", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("hanamoyukisetsu"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const cardsUpdate = updates.find((e) => e.kind === "cards") as any;
        // アイドル固有 + 上記で足している hanamoyukisetsu + 生成したカード
        expect(cardsUpdate.cards).toHaveLength(3);
        expect(cardsUpdate.cards[2].enhancements).toStrictEqual([
          {
            kind: "original",
          },
        ]);
        expect(cardsUpdate.cards[2].original.definition.rarity).toBe("ssr");
        const cardPlacementUpdate = updates
          .slice()
          .reverse()
          .find((e) => e.kind === "cardPlacement") as any;
        expect(cardPlacementUpdate).toStrictEqual({
          kind: "cardPlacement",
          hand: expect.any(Array),
          reason: expect.any(Object),
        });
      });
    });
    describe("getModifier", () => {
      test("it works", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("furumainokihon"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "modifier") as any;
        expect(update).toStrictEqual({
          kind: "modifier",
          modifier: {
            kind: "goodCondition",
            duration: 2,
          },
          reason: expect.any(Object),
        });
      });
    });
    describe("increaseRemainingTurns", () => {
      test("it works", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("watashigasta"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "remainingTurns") as any;
        expect(update).toStrictEqual({
          kind: "remainingTurns",
          amount: 1,
          reason: expect.any(Object),
        });
      });
    });
    describe("multiplyModifier", () => {
      test("it works", () => {
        // この効果を持つスキルカードがないので、モックを作る
        const cardDefinitionMock = {
          base: {
            cost: { kind: "normal", value: 0 },
            effects: [
              {
                kind: "multiplyModifier",
                modifierKind: "positiveImpression",
                multiplier: 1.5,
              },
            ],
          },
        } as CardDefinition;
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: cardDefinitionMock,
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.idol.modifiers = [
          { kind: "focus", amount: 20 },
          { kind: "positiveImpression", amount: 10 },
        ];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "modifier") as any;
        expect(update).toStrictEqual({
          kind: "modifier",
          modifier: {
            kind: "positiveImpression",
            amount: 5,
          },
          reason: expect.any(Object),
        });
      });
    });
    // calculatePerformingScoreEffect と calculatePerformingVitalityEffect のテストで検証できる内容はそちらで行う
    describe("perform", () => {
      test("レッスンにスコア上限がある時、スコアはそれを超えない増加値を返す", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.score = 9;
        lesson.clearScoreThresholds = {
          clear: 5,
          perfect: 10,
        };
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const filtered = updates.filter((e) => e.kind === "score") as any[];
        expect(filtered).toStrictEqual([
          {
            kind: "score",
            actual: 1,
            max: 9,
            reason: expect.any(Object),
          },
        ]);
      });
      test("クリアスコアの設定だけありパーフェクトの設定がない時、レッスンにスコア上限はないと判断する", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("apirunokihon"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.clearScoreThresholds = {
          clear: 1,
        };
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const filtered = updates.filter((e) => e.kind === "score") as any[];
        expect(filtered).toStrictEqual([
          {
            kind: "score",
            actual: 9,
            max: 9,
            reason: expect.any(Object),
          },
        ]);
      });
      test("複数の更新を生成するスコア増加を返す", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("shikosakugo"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const filtered = updates.filter((e) => e.kind === "score") as any[];
        expect(filtered).toStrictEqual([
          {
            kind: "score",
            actual: 8,
            max: 8,
            reason: expect.any(Object),
          },
          {
            kind: "score",
            actual: 8,
            max: 8,
            reason: expect.any(Object),
          },
        ]);
      });
      test("スコアと元気の更新を同時に返す", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("pozunokihon"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const filtered = updates.filter(
          (e) => e.kind === "score" || e.kind === "vitality",
        ) as any[];
        expect(filtered).toStrictEqual([
          {
            kind: "score",
            actual: 2,
            max: 2,
            reason: expect.any(Object),
          },
          {
            kind: "vitality",
            actual: 2,
            max: 2,
            reason: expect.any(Object),
          },
        ]);
      });
    });
    describe("performLeveragingModifier", () => {
      test("motivation", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("kaika"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.idol.modifiers = [{ kind: "motivation", amount: 10 }];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "score") as any;
        expect(update).toStrictEqual({
          kind: "score",
          actual: 20,
          max: 20,
          reason: expect.any(Object),
        });
      });
      test("positiveImpression", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("200sumairu"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.idol.modifiers = [{ kind: "positiveImpression", amount: 10 }];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "score") as any;
        expect(update).toStrictEqual({
          kind: "score",
          actual: 10,
          max: 10,
          reason: expect.any(Object),
        });
      });
      test("スコア上限の設定がある時は、actualはその値を超えない", () => {
        const lesson = createLessonForTest({
          cards: [
            {
              id: "a",
              definition: getCardDataById("kaika"),
              enabled: true,
              enhanced: false,
            },
          ],
        });
        lesson.hand = ["a"];
        lesson.clearScoreThresholds = {
          clear: 1,
          perfect: 6,
        };
        lesson.idol.modifiers = [{ kind: "motivation", amount: 5 }];
        const { updates } = useCard(lesson, 1, {
          selectedCardInHandIndex: 0,
          getRandom: () => 0,
          idGenerator: createIdGenerator(),
        });
        const update = updates.find((e) => e.kind === "score") as any;
        expect(update).toStrictEqual({
          kind: "score",
          actual: 6,
          max: 10,
          reason: expect.any(Object),
        });
      });
    });
  });
});
