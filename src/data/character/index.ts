import { CharacterDefinition } from "../../types";

export const findCharacterDataById = (
  id: CharacterDefinition["id"],
): CharacterDefinition | undefined =>
  characters.find((character) => character.id === id);

export const getCharacterDataById = (
  id: CharacterDefinition["id"],
): CharacterDefinition => {
  const character = findCharacterDataById(id);
  if (!character) {
    throw new Error(`Character not found: ${id}`);
  }
  return character;
};

/**
 * アイドル個性の定義
 *
 * - データ定義のルール
 *   - id は、名前を機械的に変換したもの
 *     - 名称が日本語の時は、名前をヘボン式のローマ字で表記し、記号は除去するかハイフンに置き換えたもの
 *       - ヘボン式ローマ字書式参考資料: https://www.ezairyu.mofa.go.jp/passport/hebon.html
 *   - レコードの定義順は、本家の「コミュ」＞「アイドルコミュ」の順番に合わせる
 *     - なお、これはおそらく「アイドル」＞「Pアイドル育成」＞「アイドル」順、と同じ
 *   - プロパティの定義順は、 id を先頭にして、他はアルファベット順
 * - TODO: eslint
 */
export const characters: CharacterDefinition[] = [
  {
    id: "hanamisaki",
    firstName: "咲季",
    lastName: "花海",
    maxLife: 32,
  },
  {
    id: "tsukimuratemari",
    firstName: "手毬",
    lastName: "月村",
    maxLife: 32,
  },
  {
    id: "fujitakotone",
    firstName: "ことね",
    lastName: "藤田",
    maxLife: 31,
  },
  {
    id: "arimuramao",
    firstName: "麻央",
    lastName: "有村",
    maxLife: 31,
  },
  {
    id: "katsuragiririya",
    firstName: "リーリヤ",
    lastName: "葛城",
    maxLife: 31,
  },
  {
    id: "kuramotochina",
    firstName: "千奈",
    lastName: "倉本",
    maxLife: 28,
  },
  {
    id: "shiunsumika",
    firstName: "清夏",
    lastName: "紫雲",
    maxLife: 30,
  },
  {
    id: "shinosawahiro",
    firstName: "広",
    lastName: "篠澤",
    maxLife: 27,
  },
  {
    id: "hanamiume",
    firstName: "佑芽",
    lastName: "花海",
    maxLife: 30,
  },
  {
    id: "himesakirinami",
    firstName: "莉波",
    lastName: "姫崎",
    maxLife: 30,
  },
];
