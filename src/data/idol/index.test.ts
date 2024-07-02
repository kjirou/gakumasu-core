import { cards } from "../card";
import { characters } from "../character";
import { producerItems } from "../producer-item";
import { idols } from "./index";

test("any id is not duplicated", () => {
  let ids: string[] = [];
  for (const idol of idols) {
    expect(ids).not.toContain(idol.id);
    ids = [...ids, idol.id];
  }
});

// 存在するデータのパターンから、法則を推測し、それに適合しているかでデータの検証を行う。
// 今後、新しいデータの出現によって、法則が崩れてテストが成立しなくなる可能性はある。
for (const idol of idols) {
  describe(`${idol.characterId} - ${idol.title}`, () => {
    test("`characterId` should exist in characters", () => {
      expect(
        characters.some((character) => character.id === idol.characterId),
      ).toBe(true);
    });
    test("`specificCardId` should exist in cards", () => {
      expect(cards.some((card) => card.id === idol.specificCardId)).toBe(true);
    });
    test("`specificProducerItemId` should exist in producerItems", () => {
      expect(
        producerItems.some(
          (producerItem) => producerItem.id === idol.specificProducerItemId,
        ),
      ).toBe(true);
    });
  });
}
