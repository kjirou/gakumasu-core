import { IdolInProduction } from "./types";
import { getCardDataById } from "./data/card";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import { createIdGenerator, createIdolInProduction } from "./index";

// const createIdolInProduction = (
//   overwrites: Partial<IdolInProduction>,
// ): IdolInProduction => {
//   return {
//     definition: getIdolDataById("hanamisaki-r-1"),
//   };
// };

describe("createIdolInProduction", () => {
  test("it creates an idol in production", () => {
    const cardIdGenerator = createIdGenerator();
    const idolInProduction = createIdolInProduction({
      id: "hanamisaki-r-1",
      cards: [],
      specificCardEnhanced: false,
      specificProducerItemEnhanced: false,
      cardIdGenerator,
    });
    expect(idolInProduction).toStrictEqual({
      deck: [],
      definition: getIdolDataById("hanamisaki-r-1"),
      life: 32,
      maxLife: 32,
      producerItems: [],
    });
  });
});
