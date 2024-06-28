import {
  Card,
  CardInProduction,
  IdolDefinition,
  IdolInProduction,
  Lesson,
} from "./types";
import { cards, getCardDataById } from "./data/card";
import {
  addCardsToHandOrDiscardPile,
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
describe("drawCardsOnLessonStart", () => {
  test("山札に引く数が残っている時、山札はその分減り、捨札に変化はない", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2", "3"],
      discardPile: ["4"],
    } as Lesson;
    const updates: any = drawCardsOnLessonStart(lessonMock, {
      count: 3,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    expect(updates).toHaveLength(2);
    // NOTE: 本来は順不同な更新クエリの順番に依存しているが、手間省略のため許容する
    expect(updates[0].kind).toBe("hand");
    expect(updates[0].cardIds).toHaveLength(3);
    expect(updates[1].kind).toBe("deck");
    expect(updates[1].cardIds).toHaveLength(0);
  });
  test("山札に引く数が残っていない時、山札は再構築された上で残りの引く数分減り、捨札は空になる", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2"],
      discardPile: ["3", "4"],
    } as Lesson;
    const updates: any = drawCardsOnLessonStart(lessonMock, {
      count: 3,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    expect(updates).toHaveLength(3);
    expect(updates[0].kind).toBe("hand");
    expect(updates[0].cardIds).toHaveLength(3);
    expect(updates[1].kind).toBe("deck");
    expect(updates[1].cardIds).toHaveLength(1);
    expect(updates[2].kind).toBe("discardPile");
    expect(updates[2].cardIds).toHaveLength(0);
  });
  test("手札最大数を超える枚数を引いた時、入らないスキルカードは捨札へ移動する", () => {
    const lessonMock = {
      hand: [] as Lesson["hand"],
      deck: ["1", "2", "3", "4", "5", "6"],
      discardPile: [] as Lesson["discardPile"],
    } as Lesson;
    const updates: any = drawCardsOnLessonStart(lessonMock, {
      count: 6,
      historyResultIndex: 1,
      getRandom: Math.random,
    });
    expect(updates).toHaveLength(3);
    expect(updates[0].kind).toBe("hand");
    expect(updates[0].cardIds).toHaveLength(5);
    expect(updates[1].kind).toBe("deck");
    expect(updates[1].cardIds).toHaveLength(0);
    expect(updates[2].kind).toBe("discardPile");
    expect(updates[2].cardIds).toHaveLength(1);
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
      getRandom: Math.random,
      idolInProduction,
      lastTurnNumber: 6,
    });
  };
  describe("手札を捨札または除外へ移動", () => {
    test("「レッスン中1回」ではない手札を使った時は、除外へ移動", () => {
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
      });
      expect(updates.find((e) => e.kind === "hand")).toStrictEqual({
        kind: "hand",
        cardIds: [],
        reason: expect.any(Object),
      });
      expect(updates.find((e) => e.kind === "discardPile")).toStrictEqual({
        kind: "discardPile",
        cardIds: ["a"],
        reason: expect.any(Object),
      });
      expect(updates.find((e) => e.kind === "removedCardPile")).toBeUndefined();
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
      });
      expect(updates.find((e) => e.kind === "hand")).toStrictEqual({
        kind: "hand",
        cardIds: [],
        reason: expect.any(Object),
      });
      expect(updates.find((e) => e.kind === "discardPile")).toBeUndefined();
      expect(updates.find((e) => e.kind === "removedCardPile")).toStrictEqual({
        kind: "removedCardPile",
        cardIds: ["a"],
        reason: expect.any(Object),
      });
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
      });
      expect(updates.find((e) => e.kind === "life")).toStrictEqual({
        kind: "life",
        actual: -4,
        max: -4,
        reason: expect.any(Object),
      });
    });
    test("modifierのひとつ", () => {
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
      });
      expect(updates.find((e) => e.kind === "modifier")).toStrictEqual({
        kind: "modifier",
        modifierKind: "motivation",
        actual: -3,
        max: -3,
        reason: expect.any(Object),
      });
    });
  });
});
