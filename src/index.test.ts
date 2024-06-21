import { IdolInProduction } from "./types";
import { getIdolDataById } from "./data/idol";

const createIdolInProduction = (
  overwrites: Partial<IdolInProduction>,
): IdolInProduction => {
  return {
    definition: getIdolDataById("hanamisaki-r-1"),
  };
};
