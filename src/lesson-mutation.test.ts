import { Card, IdolInProduction, Lesson } from "./types";
import { getCardDataById } from "./data/card";
import { drawCardsFromDeck } from "./lesson-mutation";
import { prepareCardsForLesson } from "./models";

describe("drawCardsFromDeck", () => {
  const createTestCards = (ids: Array<Card["id"]>): Card[] => {
    return prepareCardsForLesson(
      ids.map((id) => ({
        id,
        definition: getCardDataById("apirunokihon"),
        enhanced: false,
        enabled: true,
      })),
    );
  };
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
