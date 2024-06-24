import { Card, IdolInProduction, Lesson } from "./types";
import { getCardDataById } from "./data/card";
import { drawCardsFromDeck, drawCardsOnLessonStart } from "./lesson-mutation";
import { prepareCardsForLesson } from "./models";

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
describe("drawCardsOnLessonStart", () => {
  test("山札に引く数が残っている時、山札はその分減り、捨札に変化はない", () => {
    const lessonMock = {
      hand: [] as string[],
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
      hand: [] as string[],
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
});
