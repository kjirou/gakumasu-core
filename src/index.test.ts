import { Card, IdolInProduction, Lesson } from "./types";
import { getCardDataById } from "./data/card";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import {
  createIdolInProduction,
  createLessonGamePlay,
  drawCardsFromDeck,
  prepareCardsForLesson,
} from "./index";
import { createIdGenerator } from "./utils";
import exp from "constants";

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
    const deck = createTestCards(["1", "2", "3"]);
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
    const deck = createTestCards(["1", "2", "3"]);
    const discardPile = createTestCards(["4"]);
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
    const deck = createTestCards(["1"]);
    const discardPile = createTestCards(["2", "3", "4", "5"]);
    const {
      drawnCards,
      deck: newDeck,
      discardPile: newDiscardPile,
    } = drawCardsFromDeck(deck, 2, discardPile, Math.random);
    expect(drawnCards).toHaveLength(2);
    expect(newDeck).toHaveLength(3);
    expect(newDiscardPile).toStrictEqual([]);
    expect([...drawnCards, ...newDeck].map((e) => e.id).sort()).toStrictEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });
});
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
        deck: expect.any(Array),
        discardPile: [],
        removedCardPile: [],
        score: 0,
        turnNumber: 1,
        lastTurnNumber: 6,
      },
      updates: [],
    });
  });
});
