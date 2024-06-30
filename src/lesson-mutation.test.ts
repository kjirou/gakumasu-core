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
import exp from "constants";

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
  });
});
