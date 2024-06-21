import { IdolDefinition } from "../../types";

export const findIdolDataById = (
  id: IdolDefinition["id"],
): IdolDefinition | undefined => idols.find((idol) => idol.id === id);

export const getIdolDataById = (id: IdolDefinition["id"]): IdolDefinition => {
  const card = findIdolDataById(id);
  if (!card) {
    throw new Error(`Idol not found: ${id}`);
  }
  return card;
};

/**
 * プロデュースアイドルの定義
 *
 * - データ定義のルール
 *   - レコードの定義順は、本家の「コミュ」＞「アイドルコミュ」の順番に合わせる
 *     - なお、これはおそらく「アイドル」＞「Pアイドル育成」＞「アイドル」順、と同じ
 *   - プロパティの定義順は、アルファベット順
 * - TODO: eslint
 */
export const idols: IdolDefinition[] = [
  // TODO: さきのBoom Boom Powを足す
  {
    id: "hanamisaki-ssr-1",
    characterId: "hanamisaki",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "ssr",
    specificCardId: "zettainimakenai",
    specificProducerItemId: "tomonitatakautaoru",
    title: "Fighting My Way",
  },
  {
    id: "hanamisaki-sr-1",
    characterId: "hanamisaki",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "sr",
    specificCardId: "zettainimakenai",
    specificProducerItemId: "tomonitatakautaoru",
    title: "わたしが一番！",
  },
  {
    id: "hanamisaki-r-1",
    characterId: "hanamisaki",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "r",
    specificCardId: "shinshinkiei",
    specificProducerItemId: "bakuonraion",
    title: "学園生活",
  },
  {
    id: "tsukimuratemari-ssr-2",
    characterId: "tsukimuratemari",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "ssr",
    specificCardId: "karamaruomoi",
    specificProducerItemId: "koregawatashi",
    title: "アイヴイ",
  },
  {
    id: "tsukimuratemari-ssr-1",
    characterId: "tsukimuratemari",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "ssr",
    specificCardId: "sorezorenomichi",
    specificProducerItemId: "jibunwomamoruiyahon",
    title: "Luna say maybe",
  },
  {
    id: "tsukimuratemari-sr-1",
    characterId: "tsukimuratemari",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "sr",
    specificCardId: "ronurufu",
    specificProducerItemId: "watashinohatsunogakufu",
    title: "一匹狼",
  },
  {
    id: "tsukimuratemari-r-1",
    characterId: "tsukimuratemari",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "r",
    specificCardId: "ijippari",
    specificProducerItemId: "hikkeisutenresubotoru",
    title: "学園生活",
  },
  {
    id: "fujitakotone-ssr-2",
    characterId: "fujitakotone",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "ssr",
    specificCardId: "adorenarinzenkai",
    specificProducerItemId: "saikonihappinominamoto",
    title: "Yellow Big Bang！",
  },
  {
    id: "fujitakotone-ssr-1",
    characterId: "fujitakotone",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "ssr",
    specificCardId: "yosomihadame",
    specificProducerItemId: "biggudorimuchokimbako",
    title: "世界一可愛い私",
  },
  {
    id: "fujitakotone-sr-1",
    characterId: "fujitakotone",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "sr",
    specificCardId: "colorfulcute",
    specificProducerItemId: "okininosunika",
    title: "カワイイ♡はじめました",
  },
  {
    id: "fujitakotone-r-1",
    characterId: "fujitakotone",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "r",
    specificCardId: "arubaita",
    specificProducerItemId: "chibidomotezukurimedaru",
    title: "学園生活",
  },
  {
    id: "arimuramao-ssr-1",
    characterId: "arimuramao",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "ssr",
    specificCardId: "seisonohanagata",
    specificProducerItemId: "uchinaruhikarinomimikazari",
    title: "Fluorite",
  },
  {
    id: "arimuramao-sr-1",
    characterId: "arimuramao",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "sr",
    specificCardId: "rashisa",
    specificProducerItemId: "dearritorupurinsu",
    title: "はじまりはカッコよく",
  },
  {
    id: "arimuramao-r-1",
    characterId: "arimuramao",
    producePlan: {
      kind: "sense",
      recommendedEffect: "goodCondition",
    },
    rarity: "r",
    specificCardId: "ritorupurinsu",
    specificProducerItemId: "shinshifuhankachifu",
    title: "学園生活",
  },
  {
    id: "katsuragiririya-ssr-1",
    characterId: "katsuragiririya",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "ssr",
    specificCardId: "mokowakunaikara",
    specificProducerItemId: "yumehenoraifurogu",
    title: "白線",
  },
  {
    id: "katsuragiririya-sr-1",
    characterId: "katsuragiririya",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "sr",
    specificCardId: "jumpakunoyose",
    specificProducerItemId: "omoiderobo",
    title: "一つ踏み出した先に",
  },
  {
    id: "katsuragiririya-r-1",
    characterId: "katsuragiririya",
    producePlan: {
      kind: "logic",
      recommendedEffect: "positiveImpression",
    },
    rarity: "r",
    specificCardId: "uchikikeishojo",
    specificProducerItemId: "midorinoosoroiburesu",
    title: "学園生活",
  },
  {
    id: "kuramotochina-ssr-1",
    characterId: "kuramotochina",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "ssr",
    specificCardId: "ojosamanoharebutai",
    specificProducerItemId: "himitsutokkunkade",
    title: "Wonder Scale",
  },
  {
    id: "kuramotochina-sr-1",
    characterId: "kuramotochina",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "sr",
    specificCardId: "isshokemmei",
    specificProducerItemId: "shogenaihankachi",
    title: "胸を張って一歩ずつ",
  },
  {
    id: "kuramotochina-r-1",
    characterId: "kuramotochina",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "r",
    specificCardId: "genkiippai",
    specificProducerItemId: "negaiwokanaeruomamori",
    title: "学園生活",
  },
  {
    id: "shiunsumika-ssr-1",
    characterId: "shiunsumika",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "ssr",
    specificCardId: "wammoasuteppu",
    specificProducerItemId: "gesennosenrihin",
    title: "Time-Lie-One-Step",
  },
  {
    id: "shiunsumika-sr-1",
    characterId: "shiunsumika",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "sr",
    specificCardId: "yukinoippo",
    specificProducerItemId: "hokagonorakugaki",
    title: "夢へのリスタート",
  },
  {
    id: "shiunsumika-r-1",
    characterId: "shiunsumika",
    producePlan: {
      kind: "sense",
      recommendedEffect: "focus",
    },
    rarity: "r",
    specificCardId: "furendori",
    specificProducerItemId: "pinkunoosoroiburesu",
    title: "学園生活",
  },
  {
    id: "shinosawahiro-ssr-1",
    characterId: "shinosawahiro",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "ssr",
    specificCardId: "honkinoshumi",
    specificProducerItemId: "michikusakenkyunoto",
    title: "光景",
  },
  {
    id: "shinosawahiro-sr-1",
    characterId: "shinosawahiro",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "sr",
    specificCardId: "kurushinogasuki",
    specificProducerItemId: "daredemowakarunyumonsho",
    title: "一番向いてないこと",
  },
  {
    id: "shinosawahiro-r-1",
    characterId: "shinosawahiro",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "r",
    specificCardId: "chokougakurekiaidoru",
    specificProducerItemId: "chozetsuammimmasuku",
    title: "学園生活",
  },
  {
    id: "hanamiume-ssr-1",
    characterId: "hanamiume",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "ssr",
    specificCardId: "okkinaonigiri",
    specificProducerItemId: "korogaritsuzukerugenkinominamoto",
    title: "The Rolling Riceball",
  },
  {
    id: "hanamiume-sr-1",
    characterId: "hanamiume",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "sr",
    specificCardId: "datoonechan",
    specificProducerItemId: "shibainuposhetto",
    title: "アイドル、はじめっ！",
  },
  {
    id: "hanamiume-r-1",
    characterId: "hanamiume",
    producePlan: {
      kind: "logic",
      recommendedEffect: "motivation",
    },
    rarity: "r",
    specificCardId: "mikannotaiki",
    specificProducerItemId: "tekunodoggu",
    title: "学園生活",
  },
];
