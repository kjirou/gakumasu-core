import { CardDefinition, ProducePlan } from "../../types";

export const findCardDataById = (
  id: CardDefinition["id"],
): CardDefinition | undefined => cards.find((card) => card.id === id);

export const getCardDataById = (id: CardDefinition["id"]): CardDefinition => {
  const card = findCardDataById(id);
  if (!card) {
    throw new Error(`Card not found: ${id}`);
  }
  return card;
};

/** 「ランダムな強化済みスキルカード（SSR）を、手札に生成」用の候補を返す */
export const filterGeneratableCardsData = (
  producePlanKind: ProducePlan["kind"],
) =>
  cards.filter(
    (card) =>
      card.cardProviderKind === "others" &&
      (card.cardPossessionKind === "free" ||
        card.cardPossessionKind === producePlanKind) &&
      card.rarity === "ssr",
  );

/**
 * スキルカードデータの定義
 *
 * - データ定義のルール
 *   - id は、名称を機械的に変換したもの
 *     - 名称が日本語の時は、カード名をヘボン式のローマ字で表記し、記号は除去するかハイフンに置き換えたもの
 *       - ヘボン式ローマ字書式参考資料: https://www.ezairyu.mofa.go.jp/passport/hebon.html
 *     - 名称が英語の時は、スペルのまま小文字表記にする
 *   - レコードの定義順は、本家のP図鑑のスキルカードの「通常」表示順へ合わせる。現状は以下の順になってそう、上から優先順位が高い。
 *     - rarity: "c" > "r" > "sr" > "ssr"
 *     - 固有種別: 非固有 > アイドル固有 > サポカ固有
 *     - cardKind: "active" > "mental" > "trouble"
 *     - アイドル固有カードなら: さき > てまり > なお > りなみ > せいか > ことね > ひろ > リーリヤ > ちな > うめ > (新規アイドルはおそらくは追加順)
 *     - cardPossessionKind: "free" > "sence" > "logic"
 *     - necessaryProducerLevel: ASC
 *   - プロパティの定義順
 *     - 第1階層
 *       - id, name は先頭
 *       - base と enhanced を除いて、先にアルファベット順
 *       - base > enhanced
 *     - 第2階層以降
 *       - kind > *Kind > それ以外をアルファベット順
 * - TODO: eslint
 */
export const cards: CardDefinition[] = [
  {
    id: "apirunokihon",
    name: "アピールの基本",
    basic: true,
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { value: 9 } }],
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [{ kind: "perform", score: { value: 13 } }],
    },
  },
  {
    id: "pozunokihon",
    name: "ポーズの基本",
    basic: true,
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "perform",
          score: { value: 2 },
          vitality: { value: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "perform",
          score: { value: 6 },
          vitality: { value: 4 },
        },
      ],
    },
  },
  {
    id: "chosen",
    name: "挑戦",
    basic: true,
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 7 },
      effects: [{ kind: "perform", score: { value: 25 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 7 },
      effects: [{ kind: "perform", score: { value: 37 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "shikosakugo",
    name: "試行錯誤",
    basic: true,
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 7 },
      effects: [{ kind: "perform", score: { times: 2, value: 8 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [{ kind: "perform", score: { times: 2, value: 10 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kawaiishigusa",
    name: "可愛い仕草",
    basic: true,
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "positiveImpression",
            amount: 2,
          },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 100,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "positiveImpression",
            amount: 3,
          },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 120,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kibuntenkan",
    name: "気分転換",
    basic: true,
    cardProviderKind: "others",
    cardPossessionKind: "logic",
    cardSummaryKind: "active",
    rarity: "c",
    base: {
      cost: { kind: "life", value: 5 },
      effects: [{ kind: "performLeveragingVitality", percentage: 100 }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [{ kind: "performLeveragingVitality", percentage: 110 }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hyogennokihon",
    name: "表現の基本",
    basic: true,
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [{ kind: "perform", vitality: { value: 4 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [{ kind: "perform", vitality: { value: 7 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "furumainokihon",
    name: "振る舞いの基本",
    basic: true,
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
    },
  },
  {
    id: "hyojonokihon",
    name: "表情の基本",
    basic: true,
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
    },
  },
  {
    id: "mesennokihon",
    name: "目線の基本",
    basic: true,
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
      ],
    },
  },
  {
    id: "ishikinokihon",
    name: "意識の基本",
    basic: true,
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
    },
  },
  {
    id: "nemuke",
    name: "眠気",
    basic: true,
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "trouble",
    rarity: "c",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [],
      usableOncePerLesson: true,
    },
  },
  {
    id: "karuiashidori",
    name: "軽い足取り",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 9 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
    },
  },
  {
    id: "aikyo",
    name: "愛嬌",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { value: 13 } }],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { value: 21 } }],
    },
  },
  {
    id: "jumbiundo",
    name: "準備運動",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 9 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
    },
  },
  {
    id: "fansa",
    name: "ファンサ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 2,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [{ kind: "perform", score: { value: 10 } }],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [{ kind: "perform", score: { value: 16 } }],
    },
  },
  {
    id: "ikioimakase",
    name: "勢い任せ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 9,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 9 } },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 4 },
        },
      ],
    },
  },
  {
    id: "haitatchi",
    name: "ハイタッチ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 13,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { focusMultiplier: 1.5, value: 17 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { focusMultiplier: 2, value: 23 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "tokutaimu",
    name: "トークタイム",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 14,
    rarity: "r",
    base: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 6 },
      effects: [{ kind: "perform", score: { value: 27 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 6 },
      effects: [{ kind: "perform", score: { value: 38 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kyomoohayo",
    name: "今日もおはよう",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 9 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
    },
  },
  {
    id: "yurufuwaoshaveri",
    name: "ゆるふわおしゃべり",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
        { kind: "performLeveragingVitality", percentage: 60 },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
        { kind: "performLeveragingVitality", percentage: 80 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "mosukoshidake",
    name: "もう少しだけ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 10 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 15 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
      ],
    },
  },
  {
    id: "tebyoshi",
    name: "手拍子",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 13,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 150,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 200,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "genkinaaisatsu",
    name: "元気な挨拶",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 14,
    rarity: "r",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [{ kind: "performLeveragingVitality", percentage: 110 }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [{ kind: "performLeveragingVitality", percentage: 120 }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kiaijubun",
    name: "気合十分！",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 16,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
      ],
    },
  },
  {
    id: "fasutosuteppu",
    name: "ファーストステップ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 16,
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "baransukankaku",
    name: "バランス感覚",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
      ],
    },
  },
  {
    id: "rakkanteki",
    name: "楽観的",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 4,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 1 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 1 },
        },
      ],
    },
  },
  {
    id: "shinkokyu",
    name: "深呼吸",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 19,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 2 },
        },
        {
          kind: "getModifier",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
        {
          kind: "getModifier",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
    },
  },
  {
    id: "risutato",
    name: "リスタート",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
    },
  },
  {
    id: "eieio",
    name: "えいえいおー",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
      ],
    },
  },
  {
    id: "rizumikaru",
    name: "リズミカル",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 2,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [{ kind: "perform", vitality: { value: 6 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [{ kind: "perform", vitality: { value: 8 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "omoidashiwarai",
    name: "思い出し笑い",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 4,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "positiveImpression",
            min: 3,
          },
          modifier: { kind: "motivation", amount: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "positiveImpression",
            min: 3,
          },
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
    },
  },
  {
    id: "pasuterukibun",
    name: "パステル気分",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 9,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 3,
          },
          modifier: { kind: "positiveImpression", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 7 } },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 3,
          },
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
    },
  },
  {
    id: "hagemashi",
    name: "励まし",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 19,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "getModifier", modifier: { kind: "motivation", amount: 3 } },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 6,
          },
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "getModifier", modifier: { kind: "motivation", amount: 4 } },
        {
          kind: "getModifier",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 6,
          },
          modifier: { kind: "positiveImpression", amount: 5 },
        },
      ],
    },
  },
  {
    id: "shinshinkiei",
    name: "新進気鋭",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [{ kind: "perform", score: { value: 17 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [{ kind: "perform", score: { value: 25 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "ijippari",
    name: "意地っ張り",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "ritorupurinsu",
    name: "リトル・プリンス",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { value: 8 } },
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { value: 13 } },
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hoyoryoku",
    name: "包容力",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 2 }, vitality: { value: 1 } },
        { kind: "recoverLife", value: 2 },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 3 }, vitality: { value: 4 } },
        { kind: "recoverLife", value: 2 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "furendori",
    name: "フレンドリー",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 10 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 6 },
          score: { value: 10 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [{ kind: "perform", score: { times: 2, value: 12 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "arubaita",
    name: "アルバイター",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 6 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "chokougakurekiaidoru",
    name: "超高学歴アイドル",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "perform",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 6,
          },
          vitality: { value: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 4 } },
        {
          kind: "perform",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 6,
          },
          vitality: { value: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "uchikikeishojo",
    name: "内気系少女",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 1 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "genkiippai",
    name: "元気いっぱい",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        { kind: "performLeveragingVitality", percentage: 50 },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        { kind: "performLeveragingVitality", percentage: 70 },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "mikannotaiki",
    name: "未完成の大器",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "r",
    base: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { boostPerCardUsed: 3, value: 2 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { boostPerCardUsed: 3, value: 4 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "zentoyoyo",
    name: "前途洋々",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 3,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 8 }, vitality: { value: 7 } },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 12 }, vitality: { value: 10 } },
      ],
    },
  },
  {
    id: "kimepozu",
    name: "決めポーズ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { value: 18 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [{ kind: "perform", score: { value: 27 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "adoribu",
    name: "アドリブ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { value: 9 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
      ],
    },
  },
  {
    id: "jonetsutan",
    name: "情熱ターン",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 11 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 18 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
      ],
    },
  },
  {
    id: "hiyaku",
    name: "飛躍",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 6,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 13 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 6 },
          score: { value: 15 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", score: { value: 13 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 6 },
          score: { value: 15 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "shukufuku",
    name: "祝福",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 7,
    rarity: "sr",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", score: { value: 26 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", score: { value: 40 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "sutatodasshu",
    name: "スタートダッシュ",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 22,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 30 }, vitality: { value: 10 } },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 40 }, vitality: { value: 10 } },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
    },
  },
  {
    id: "sutandopure",
    name: "スタンドプレー",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 24,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 12 }, vitality: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 12 }, vitality: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 7 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
    },
  },
  {
    id: "shupurehikoru",
    name: "シュプレヒコール",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 33,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "focus", value: 3 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
    enhanced: {
      cost: { kind: "focus", value: 2 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
  },
  {
    id: "raburiuinku",
    name: "ラブリーウインク",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 60,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 80,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "arigatonokotoba",
    name: "ありがとうの言葉",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    rarity: "sr",
    base: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 9 } },
        {
          kind: "performLeveragingVitality",
          percentage: 40,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 11 } },
        {
          kind: "performLeveragingVitality",
          percentage: 70,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hatonoaizu",
    name: "ハートの合図",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 6,
    rarity: "sr",
    base: {
      cost: { kind: "life", value: 3 },
      effects: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "halve",
          percentage: 130,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "halve",
          percentage: 180,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kirameki",
    name: "キラメキ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 24,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 200,
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 250,
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "minnadaisuki",
    name: "みんな大好き",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 34,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "motivation", value: 3 },
      effects: [
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 90,
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
    enhanced: {
      cost: { kind: "motivation", value: 2 },
      effects: [
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 120,
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
  },
  {
    id: "aidorusengen",
    name: "アイドル宣言",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 23,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "life", value: 1 },
      effects: [
        { kind: "drawCards", amount: 2 },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        {
          kind: "drawCards",
          amount: 2,
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "haitenshon",
    name: "ハイテンション",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 23,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 11 } },
        {
          kind: "getModifier",
          modifier: { kind: "noVitalityIncrease", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 13 } },
        {
          kind: "getModifier",
          modifier: { kind: "noVitalityIncrease", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "ganriki",
    name: "眼力",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 8 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "daiseien",
    name: "大声援",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 8 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "enshutsukeikaku",
    name: "演出計画",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 17,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "active",
            effect: {
              kind: "perform",
              vitality: { fixedValue: true, value: 2 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "active",
            effect: {
              kind: "perform",
              vitality: { fixedValue: true, value: 2 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "negainochikari",
    name: "願いの力",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 18,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "active",
            effect: {
              kind: "getModifier",
              modifier: { kind: "focus", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "active",
            effect: {
              kind: "getModifier",
              modifier: { kind: "focus", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "shizukanaishi",
    name: "静かな意志",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 20,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
  },
  {
    id: "hajimarinoaizu",
    name: "始まりの合図",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 28,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 7 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "iji",
    name: "意地",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 29,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "sonzaikan",
    name: "存在感",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 31,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "goodCondition", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
    enhanced: {
      cost: { kind: "goodCondition", value: 1 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
  },
  {
    id: "seikohenomichisuji",
    name: "成功への道筋",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 36,
    rarity: "sr",
    base: {
      cost: { kind: "goodCondition", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 7 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "goodCondition", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 9 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "afureruomoide",
    name: "あふれる思い出",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", vitality: { value: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
      ],
    },
  },
  {
    id: "fureai",
    name: "ふれあい",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
      ],
    },
  },
  {
    id: "shiawasenajikan",
    name: "幸せな時間",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 7,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 6 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 8 },
        },
      ],
    },
  },
  {
    id: "fanshichamu",
    name: "ファンシーチャーム",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 17,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "mental",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "mental",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "wakuwakugatomaranai",
    name: "ワクワクが止まらない",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 18,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "mental",
            effect: {
              kind: "getModifier",
              modifier: { kind: "motivation", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "mental",
            effect: {
              kind: "getModifier",
              modifier: { kind: "motivation", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hombanzenya",
    name: "本番前夜",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 20,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
  },
  {
    id: "hinatabokko",
    name: "ひなたぼっこ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 22,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 11 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 11 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 7 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "imetore",
    name: "イメトレ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 28,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 7 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 11 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "yarukihamanten",
    name: "やる気は満点",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 29,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 1 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "yumemigokochi",
    name: "ゆめみごこち",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 32,
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "positiveImpression", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
    enhanced: {
      cost: { kind: "positiveImpression", value: 1 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
    },
  },
  {
    id: "ichibanhayuzuranai",
    name: "一番は譲らない",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 18 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 26 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "ronurufu",
    name: "ローン・ウルフ",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 12 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          score: { value: 12 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", score: { value: 12 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          score: { value: 12 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "rashisa",
    name: "らしさ",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 4 } },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 6 } },
        {
          kind: "getModifier",
          condition: { kind: "hasGoodCondition" },
          modifier: { kind: "focus", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "yorisokimochi",
    name: "寄り添う気持ち",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", vitality: { value: 10 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", vitality: { value: 12 } },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "yukinoippo",
    name: "勇気の一歩",
    cardPossessionKind: "sense",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [{ kind: "perform", score: { focusMultiplier: 2, value: 17 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { focusMultiplier: 2.5, value: 24 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "colorfulcute",
    // 半角のように見える、少なくとも「!」は「届いて！」の「！」より横幅が短い
    name: "Colorful Cute!",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 6 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 8 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kurushinogasuki",
    name: "苦しいのが好き",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "performLeveragingModifier",
          modifierKind: "motivation",
          percentage: 250,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 7 } },
        {
          kind: "performLeveragingModifier",
          modifierKind: "motivation",
          percentage: 350,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "jumpakunoyose",
    name: "純白の妖精",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 2 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 120,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 2 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 160,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "isshokemmei",
    name: "いっしょけんめい",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 6 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "datoonechan",
    name: "打倒お姉ちゃん",
    cardPossessionKind: "logic",
    cardProviderKind: "idol",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "performLeveragingVitality",
          percentage: 100,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "performLeveragingVitality",
          percentage: 140,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "onechandamono",
    name: "お姉ちゃんだもの！",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      condition: {
        kind: "measureValue",
        criterionKind: "lessEqual",
        valueKind: "score",
        percentage: 100,
      },
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { value: 6 }, vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: {
        kind: "measureValue",
        criterionKind: "lessEqual",
        valueKind: "score",
        percentage: 100,
      },
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { value: 10 }, vitality: { value: 9 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "oatsuishisen",
    name: "おアツイ視線",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      condition: { kind: "countVitalityZero" },
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: { kind: "countVitalityZero" },
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "goshidogobentatsu",
    name: "ご指導ご鞭撻",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      condition: {
        kind: "measureValue",
        criterionKind: "greaterEqual",
        valueKind: "life",
        percentage: 50,
      },
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 4 }, vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: {
        kind: "measureValue",
        criterionKind: "greaterEqual",
        valueKind: "life",
        percentage: 50,
      },
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", score: { value: 4 }, vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "sutoretchidangi",
    name: "ストレッチ談義",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      condition: {
        kind: "countTurnNumber",
        min: 3,
      },
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { value: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: {
        kind: "countTurnNumber",
        min: 3,
      },
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "zenryokusapoto",
    name: "全力サポート",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 2 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kimegaodejidori",
    name: "キメ顔で自撮り",
    cardPossessionKind: "sense",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 2 },
        },
        {
          kind: "getModifier",
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 3 },
        },
        {
          kind: "getModifier",
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "nanikiteruno",
    name: "なに聴いてるの？",
    cardPossessionKind: "logic",
    cardProviderKind: "supportCard",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "sr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        { kind: "recoverLife", value: 3 },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        { kind: "recoverLife", value: 5 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "koruresuponsu",
    name: "コール＆レスポンス",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 11,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", vitality: { value: 15 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          score: { value: 15 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", vitality: { value: 15 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 3 },
          score: { value: 34 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "bazuwado",
    name: "バズワード",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 12,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 7 },
      effects: [
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 38 },
        },
      ],
    },
    enhanced: {
      cost: { kind: "normal", value: 7 },
      effects: [
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 54 },
        },
      ],
    },
  },
  {
    id: "joju",
    name: "成就",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 41,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 10 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "perform", score: { value: 32 } },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 10 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 7 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "perform", score: { value: 40 } },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "miwakunopafomansu",
    name: "魅惑のパフォーマンス",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 43,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 8 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "perform", score: { value: 38 } },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      condition: { kind: "hasGoodCondition" },
      cost: { kind: "normal", value: 8 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "perform", score: { value: 47 } },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "200sumairu",
    name: "２００％スマイル",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 11,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 100,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 6 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 170,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kaika",
    name: "開花",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 12,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 6 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "motivation",
          percentage: 200,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 8 },
        },
        {
          kind: "performLeveragingModifier",
          modifierKind: "motivation",
          percentage: 300,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "todoite",
    name: "届いて！",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "active",
    necessaryProducerLevel: 44,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 2 },
      effects: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "zero",
          percentage: 160,
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 2 },
      effects: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "zero",
          percentage: 220,
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "terebishutsuen",
    name: "テレビ出演",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 5,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kanaetaiyume",
    name: "叶えたい夢",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 10,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 8 } },
        {
          kind: "getModifier",
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 9 } },
        {
          kind: "getModifier",
          modifier: { kind: "lifeConsumptionReduction", value: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "aidorudamashii",
    name: "アイドル魂",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 35,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "debuffProtection", times: 1 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 6 } },
        {
          kind: "getModifier",
          modifier: { kind: "debuffProtection", times: 1 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "shikirinaoshi",
    name: "仕切り直し",
    cardPossessionKind: "free",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 40,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "exchangeHand" },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "exchangeHand" },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kokumintekiaidoru",
    name: "国民的アイドル",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 25,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "goodCondition", value: 1 },
      effects: [
        { kind: "getModifier", modifier: { kind: "doubleEffect", times: 1 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "goodCondition", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 8 } },
        { kind: "getModifier", modifier: { kind: "doubleEffect", times: 1 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "miwakunoshisen",
    name: "魅惑の視線",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 30,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "focus", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "focus", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 5 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 5 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "nariyamanaihakushu",
    name: "鳴り止まない拍手",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 38,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 5 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "tenshinramman",
    name: "天真爛漫",
    cardPossessionKind: "sense",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 45,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 1 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              condition: {
                kind: "countModifier",
                modifierKind: "focus",
                min: 3,
              },
              modifier: { kind: "focus", amount: 2 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 1 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              condition: {
                kind: "countModifier",
                modifierKind: "focus",
                min: 3,
              },
              modifier: { kind: "focus", amount: 2 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "watashigasta",
    name: "私がスター",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 25,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "positiveImpression", value: 2 },
      effects: [
        { kind: "increaseRemainingTurns", amount: 1 },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "positiveImpression", value: 1 },
      effects: [
        { kind: "increaseRemainingTurns", amount: 1 },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        { kind: "drawCards", amount: 1 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hoshikuzusenseshon",
    name: "星屑センセーション",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 30,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "motivation", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "motivation", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 7 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        { kind: "drawCards", amount: 1 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "notonohashinoketsui",
    name: "ノートの端の決意",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 37,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 3 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "tegakinomesseji",
    name: "手書きのメッセージ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 39,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "goodCondition", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 9 } },
        { kind: "perform", vitality: { value: 9 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "goodCondition", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 10 } },
        { kind: "perform", vitality: { value: 10 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "tokimeki",
    name: "トキメキ",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 42,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 10 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 8 },
        },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 5 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 9 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 10 },
        },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 6 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "nijiirodorima",
    name: "虹色ドリーマー",
    cardPossessionKind: "logic",
    cardProviderKind: "others",
    cardSummaryKind: "mental",
    necessaryProducerLevel: 45,
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 9 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 1 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              condition: {
                kind: "countModifier",
                modifierKind: "positiveImpression",
                min: 3,
              },
              modifier: { kind: "positiveImpression", amount: 3 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 9 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              condition: {
                kind: "countModifier",
                modifierKind: "positiveImpression",
                min: 3,
              },
              modifier: { kind: "positiveImpression", amount: 3 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "zettainimakenai",
    name: "絶対に負けない",
    cardPossessionKind: "sense",
    cardSummaryKind: "active",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [{ kind: "perform", score: { value: 34 } }],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [{ kind: "perform", score: { value: 48 } }],
      usableOncePerLesson: true,
    },
  },
  {
    id: "sorezorenomichi",
    name: "それぞれの道",
    cardPossessionKind: "sense",
    cardSummaryKind: "active",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 14 } },
        { kind: "getModifier", modifier: { kind: "focus", amount: 4 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", score: { value: 15 } },
        { kind: "getModifier", modifier: { kind: "focus", amount: 5 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "seisonohanagata",
    name: "盛装の華形",
    cardPossessionKind: "sense",
    cardSummaryKind: "active",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 12 } },
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 14 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", score: { value: 18 } },
        {
          kind: "perform",
          condition: { kind: "hasGoodCondition" },
          score: { value: 20 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kyorikan",
    name: "距離感",
    cardPossessionKind: "sense",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 4 } },
        { kind: "recoverLife", value: 4 },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 5 } },
        { kind: "recoverLife", value: 5 },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "wammoasuteppu",
    name: "ワンモアステップ",
    cardPossessionKind: "sense",
    cardSummaryKind: "active",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "perform", score: { times: 2, value: 7 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 6 },
          score: { value: 7 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "perform", score: { times: 2, value: 9 } },
        {
          kind: "perform",
          condition: { kind: "countModifier", modifierKind: "focus", min: 6 },
          score: { value: 9 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "adorenarinzenkai",
    name: "アドレナリン全開",
    cardPossessionKind: "sense",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 3 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 5 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "yosomihadame",
    name: "よそ見はダメ♪",
    cardPossessionKind: "logic",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 7 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "perform", vitality: { value: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 9 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "honkinoshumi",
    name: "本気の趣味",
    cardPossessionKind: "logic",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        {
          kind: "perform",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 3,
          },
          vitality: { value: 4 },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", vitality: { value: 7 } },
        {
          kind: "perform",
          condition: {
            kind: "countModifier",
            modifierKind: "motivation",
            min: 3,
          },
          vitality: { value: 7 },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "mokowakunaikara",
    name: "もう怖くないから",
    cardPossessionKind: "logic",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 3 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationAtEndOfTurn",
            effect: {
              kind: "getModifier",
              modifier: { kind: "positiveImpression", amount: 1 },
            },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "ojosamanoharebutai",
    name: "お嬢様の晴れ舞台",
    cardPossessionKind: "logic",
    cardSummaryKind: "active",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 2 } },
        { kind: "performLeveragingVitality", percentage: 100 },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 2 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 4 },
      effects: [
        { kind: "perform", vitality: { value: 5 } },
        { kind: "performLeveragingVitality", percentage: 120 },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 3 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "karamaruomoi",
    name: "絡まる想い",
    cardPossessionKind: "logic",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 8 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 8 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 8 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 10 },
        },
      ],
      innate: true,
      usableOncePerLesson: true,
    },
  },
  {
    id: "okkinaonigiri",
    name: "おっきなおにぎり",
    cardPossessionKind: "logic",
    cardSummaryKind: "mental",
    cardProviderKind: "idol",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { boostPerCardUsed: 5, value: 2 } },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 3 },
      effects: [
        { kind: "perform", vitality: { boostPerCardUsed: 8, value: 2 } },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hanamoyukisetsu",
    name: "花萌ゆ季節",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 4 },
      effects: [
        { kind: "generateCard" },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        { kind: "generateCard" },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hidamarinoseitokaishitsu",
    name: "陽だまりの生徒会室",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        { kind: "recoverLife", value: 3 },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "recoverLife", value: 5 },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kokoronoarubamu",
    name: "心のアルバム",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "active",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 3 }, vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 2,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        { kind: "perform", score: { value: 6 }, vitality: { value: 5 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 2,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "teipatei",
    name: "ティーパーティ",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        { kind: "enhanceHand" },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 1 },
      effects: [
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
        { kind: "drawCards", amount: 1 },
        { kind: "enhanceHand" },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "hikarinosuteji",
    name: "光のステージ",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 3 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 0 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "shinseitokaibakutan",
    name: "新生徒会爆誕！",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 4 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "usureyukukabe",
    name: "薄れゆく壁",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 5 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 2,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 2 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 2,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "mizutamarisuteppu",
    name: "みずたまりステップ",
    cardPossessionKind: "free",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "life", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 3 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "life", value: 1 },
      effects: [
        { kind: "perform", vitality: { value: 8 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "kenkasuruhodonakagaii",
    name: "喧嘩するほど仲がいい",
    cardPossessionKind: "sense",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 3 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 2 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        { kind: "getModifier", modifier: { kind: "focus", amount: 4 } },
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 4 },
        },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
  {
    id: "damedamekukkingu",
    name: "ダメダメクッキング",
    cardPossessionKind: "logic",
    cardProviderKind: "supportCard",
    cardSummaryKind: "mental",
    nonDuplicative: true,
    rarity: "ssr",
    base: {
      cost: { kind: "normal", value: 7 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 4 },
        },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 3 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
    enhanced: {
      cost: { kind: "normal", value: 6 },
      effects: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 5 },
        },
        { kind: "getModifier", modifier: { kind: "motivation", amount: 4 } },
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "enhanceHand" },
          },
        },
      ],
      usableOncePerLesson: true,
    },
  },
];
