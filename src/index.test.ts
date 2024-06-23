import { IdolInProduction } from "./types";
import { getCardDataById } from "./data/card";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import { createIdolInProduction, createLessonGamePlay } from "./index";
import { createIdGenerator } from "./utils";
import exp from "constants";

// const createIdolInProduction = (
//   overwrites: Partial<IdolInProduction>,
// ): IdolInProduction => {
//   return {
//     definition: getIdolDataById("hanamisaki-r-1"),
//   };
// };

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
