import { GetRandom, IdGenerator, RangedNumber } from "./types";

/**
 * Shuffle an array with the Fisher–Yates algorithm.
 *
 * Ref) https://www.30secondsofcode.org/js/s/shuffle/
 */
export const shuffleArray = <Element>(
  array: Element[],
  getRandom: GetRandom,
): Element[] => {
  const copied = array.slice();
  let m = copied.length;
  while (m) {
    const i = Math.floor(getRandom() * m);
    m--;
    [copied[m], copied[i]] = [copied[i], copied[m]];
  }
  return copied;
};

/**
 * 一意のIDを生成する
 *
 * - 1レッスンまたは1プロデュース毎に1インスタンスを生成して共有する
 * - TODO: データロードの際の始点の復元
 */
export const createIdGenerator = (): IdGenerator => {
  // 整数のオーバーフローは考えない、 Number.MAX_SAFE_INTEGER を超えることはなさそう
  let counter = 0;
  return () => {
    counter++;
    return `${counter}`;
  };
};

export const validateNumberInRange = (
  target: number,
  range: RangedNumber,
): boolean => {
  if ("min" in range && "max" in range) {
    return range.min <= target && target <= range.max;
  } else if ("min" in range) {
    return range.min <= target;
  } else if ("max" in range) {
    return target <= range.max;
  }
  throw new Error("Invalid range");
};
