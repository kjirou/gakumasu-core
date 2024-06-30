import { findCardDataById, getCardDataById } from "./data/card";
import { getProducerItemDataById } from "./data/producer-item";
import {
  generateActionCostText,
  generateCardDescription,
  generateCardUsageConditionText,
  generateEffectText,
  generateProducerItemDescription,
  generateProducerItemTriggerAndConditionText,
  globalDataKeywords,
} from "./text-generation";
import type { CardDefinition, ProducerItemDefinition } from "./types";

describe("globalDataKeywords", () => {
  describe("`cards`のキーがデータ定義のidに存在する", () => {
    const testCases = Object.keys(globalDataKeywords.cards).map((key) => ({
      key,
    }));
    test.each(testCases)("$key", ({ key }) => {
      expect(findCardDataById(key)).not.toBeUndefined();
    });
  });
});

describe("generateEffectText", () => {
  const testCases: Array<{
    args: Parameters<typeof generateEffectText>;
    expected: ReturnType<typeof generateEffectText>;
    name: string;
  }> = [
    {
      args: [{ kind: "drainLife", value: 1 }],
      expected: "体力減少1",
      name: "drainLife",
    },
    {
      args: [{ kind: "drawCards", amount: 1 }],
      expected: "スキルカードを引く",
      name: "drawCards - 1枚の時",
    },
    {
      args: [{ kind: "drawCards", amount: 2 }],
      expected: "スキルカードを2枚引く",
      name: "drawCards - 2枚の時",
    },
    {
      args: [{ kind: "enhanceHand" }],
      expected: "手札をすべて{{レッスン中強化}}",
      name: "enhanceHand",
    },
    {
      args: [{ kind: "exchangeHand" }],
      expected: "手札をすべて入れ替える",
      name: "exchangeHand",
    },
    {
      args: [{ kind: "generateCard" }],
      expected: "ランダムな強化済みスキルカード（SSR）を、手札に{{生成}}",
      name: "generateCard",
    },
    {
      args: [{ kind: "increaseRemainingTurns", amount: 1 }],
      expected: "{{ターン追加}}+1",
      name: "increaseRemainingTurns",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: {
            kind: "additionalCardUsageCount",
            amount: 1,
            duration: 1,
          },
        },
      ],
      expected: "{{スキルカード使用数追加}}+1",
      name: "getModifier - additionalCardUsageCount",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "debuffProtection", times: 1 },
        },
      ],
      expected: "{{低下状態無効}}（1回）",
      name: "getModifier - debuffProtection",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: { kind: "perform", score: { value: 1 } },
          },
        },
      ],
      expected: "次のターン、パラメータ+1",
      name: "getModifier - delayedEffect - 次のターンに perform",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 1,
            effect: {
              kind: "getModifier",
              modifier: { kind: "goodCondition", duration: 1 },
            },
          },
        },
      ],
      expected: "次のターン、{{好調}}1ターン",
      name: "getModifier - delayedEffect - 次のターンに getModifier",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: {
            kind: "delayedEffect",
            delay: 2,
            effect: { kind: "drawCards", amount: 1 },
          },
        },
      ],
      expected: "2ターン後、スキルカードを引く",
      name: "getModifier - delayedEffect - 2ターン後に drawCards",
    },
    {
      args: [
        { kind: "getModifier", modifier: { kind: "doubleEffect", times: 1 } },
      ],
      expected: "次に使用するスキルカードの効果をもう1回発動（1回）",
      name: "getModifier - doubleEffect",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "doubleLifeConsumption", duration: 1 },
        },
      ],
      expected: "{{消費体力増加}}1ターン",
      name: "getModifier - doubleLifeConsumption",
    },
    {
      args: [
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
      expected: "以降、ターン終了時、{{好印象}}+1",
      name: "getModifier - effectActivationAtEndOfTurn",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: {
            kind: "effectActivationUponCardUsage",
            cardKind: "active",
            effect: {
              kind: "perform",
              vitality: { fixedValue: true, value: 1 },
            },
          },
        },
      ],
      expected: "以降、{{アクティブスキルカード}}使用時、{{固定元気}}+1",
      name: "getModifier - effectActivationUponCardUsage - active",
    },
    {
      args: [
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
      expected: "以降、{{メンタルスキルカード}}使用時、{{好印象}}+1",
      name: "getModifier - effectActivationUponCardUsage - mental",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "excellentCondition", duration: 1 },
        },
      ],
      expected: "{{絶好調}}1ターン",
      name: "getModifier - excellentCondition",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "focus", amount: 1 },
        },
      ],
      expected: "{{集中}}+1",
      name: "getModifier - focus",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "goodCondition", duration: 1 },
        },
      ],
      expected: "{{好調}}1ターン",
      name: "getModifier - goodCondition",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "halfLifeConsumption", duration: 1 },
        },
      ],
      expected: "{{消費体力減少}}1ターン",
      name: "getModifier - halfLifeConsumption",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "lifeConsumptionReduction", value: 1 },
        },
      ],
      expected: "{{消費体力削減}}1",
      name: "getModifier - lifeConsumptionReduction",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "mightyPerformance", duration: 1 },
        },
      ],
      expected: "{{パラメータ上昇量増加}}50%（1ターン）",
      name: "getModifier - mightyPerformance",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "motivation", amount: 1 },
        },
      ],
      expected: "{{やる気}}+1",
      name: "getModifier - motivation",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "noVitalityIncrease", duration: 1 },
        },
      ],
      expected: "{{元気増加無効}}1ターン",
      name: "getModifier - noVitalityIncrease",
    },
    {
      args: [
        {
          kind: "getModifier",
          modifier: { kind: "positiveImpression", amount: 1 },
        },
      ],
      expected: "{{好印象}}+1",
      name: "getModifier - positiveImpression",
    },
    {
      args: [
        {
          kind: "multiplyModifier",
          modifierKind: "positiveImpression",
          multiplier: 1.5,
        },
      ],
      expected: "{{好印象}}1.5倍",
      name: "multiplyModifier",
    },
    {
      args: [{ kind: "perform", score: { value: 1 } }],
      expected: "パラメータ+1",
      name: "perform - score",
    },
    {
      args: [{ kind: "perform", score: { focusMultiplier: 1.5, value: 1 } }],
      expected: "パラメータ+1（{{集中}}効果を1.5倍適用）",
      name: "perform - score - focusMultiplier",
    },
    {
      args: [{ kind: "perform", score: { times: 2, value: 1 } }],
      expected: "パラメータ+1（2回）",
      name: "perform - score - times",
    },
    {
      args: [{ kind: "perform", vitality: { value: 1 } }],
      expected: "{{元気}}+1",
      name: "perform - vitality",
    },
    {
      args: [{ kind: "perform", vitality: { fixedValue: true, value: 1 } }],
      expected: "{{固定元気}}+1",
      name: "perform - vitality - fixedValue",
    },
    {
      args: [{ kind: "perform", vitality: { boostPerCardUsed: 2, value: 1 } }],
      expected:
        "{{元気}}+1（レッスン中に使用したスキルカード1枚ごとに、{{元気}}増加量+2）",
      name: "perform - vitality - boostPerCardUsed",
    },
    {
      args: [{ kind: "perform", score: { value: 1 }, vitality: { value: 2 } }],
      expected: "パラメータ+1{{元気}}+2",
      name: "perform - score & vitality",
    },
    {
      args: [
        {
          kind: "perform",
          score: { focusMultiplier: 2, times: 3, value: 1 },
          vitality: { boostPerCardUsed: 12, fixedValue: true, value: 11 },
        },
      ],
      expected:
        "パラメータ+1（{{集中}}効果を2倍適用）（3回）{{固定元気}}+11（レッスン中に使用したスキルカード1枚ごとに、{{元気}}増加量+12）",
      name: "perform - 全てのオプションを付与",
    },
    {
      args: [
        {
          kind: "performLeveragingModifier",
          modifierKind: "positiveImpression",
          percentage: 100,
        },
      ],
      expected: "{{好印象}}の100%分パラメータ上昇",
      name: "performLeveragingModifier",
    },
    {
      args: [{ kind: "performLeveragingVitality", percentage: 100 }],
      expected: "{{元気}}の100%分パラメータ上昇",
      name: "performLeveragingVitality",
    },
    {
      args: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "halve",
          percentage: 100,
        },
      ],
      expected: "{{元気}}を半分にして、減少前の{{元気}}の100%分パラメータ上昇",
      name: "performLeveragingVitality - reductionKind - halve",
    },
    {
      args: [
        {
          kind: "performLeveragingVitality",
          reductionKind: "zero",
          percentage: 100,
        },
      ],
      expected: "{{元気}}を0にして、減少前の{{元気}}の100%分パラメータ上昇",
      name: "performLeveragingVitality - reductionKind - zero",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "countModifier", modifierKind: "focus", min: 1 },
        },
      ],
      expected: "{{集中}}が1以上の場合、パラメータ+10",
      name: "condition - countModifier",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "countReminingTurns", max: 1 },
        },
      ],
      expected: "最終ターンの場合、パラメータ+10",
      name: "condition - countReminingTurns - 1",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "countReminingTurns", max: 2 },
        },
      ],
      expected: "残り2ターン以内の場合、パラメータ+10",
      name: "condition - countReminingTurns - 2",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "countVitality", range: { min: 1 } },
        },
      ],
      expected: "{{元気}}が1以上の場合、パラメータ+10",
      name: "condition - countVitality - min",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "countVitality", range: { min: 2, max: 2 } },
        },
      ],
      expected: "{{元気}}が2の場合、パラメータ+10",
      name: "condition - countVitality - min & max",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "hasGoodCondition" },
        },
      ],
      expected: "{{好調}}状態の場合、パラメータ+10",
      name: "condition - hasGoodCondition",
    },
    {
      args: [
        {
          kind: "perform",
          score: { value: 10 },
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
        },
      ],
      expected: "体力が50%以上の場合、パラメータ+10",
      name: "condition - measureIfLifeIsEqualGreaterThanHalf",
    },
  ];
  test.each(testCases)('$name => "$expected"', ({ args, expected }) => {
    expect(generateEffectText(...args)).toBe(expected);
  });
});

describe("generateCardUsageConditionText", () => {
  const testCases: Array<{
    args: Parameters<typeof generateCardUsageConditionText>;
    expected: ReturnType<typeof generateCardUsageConditionText>;
    name: string;
  }> = [
    {
      args: [{ kind: "countTurnNumber", min: 1 }],
      expected: "1ターン目以降の場合、使用可",
      name: "countTurnNumber",
    },
    {
      args: [{ kind: "countVitalityZero" }],
      expected: "{{元気}}が0の場合、使用可",
      name: "countVitalityZero",
    },
    {
      args: [{ kind: "hasGoodCondition" }],
      expected: "{{好調}}状態の場合、使用可",
      name: "hasGoodCondition",
    },
    {
      args: [
        {
          kind: "measureValue",
          criterionKind: "greaterEqual",
          percentage: 50,
          valueKind: "life",
        },
      ],
      expected: "体力の50%以上の場合、使用可",
      name: "measureValue - 1",
    },
    {
      args: [
        {
          kind: "measureValue",
          criterionKind: "lessEqual",
          percentage: 100,
          valueKind: "score",
        },
      ],
      expected: "レッスンCLEARの100%以下の場合、使用可",
      name: "measureValue - 2",
    },
  ];
  test.each(testCases)('$name => "$expected"', ({ args, expected }) => {
    expect(generateCardUsageConditionText(...args)).toBe(expected);
  });
});

describe("generateActionCostText", () => {
  const testCases: Array<{
    args: Parameters<typeof generateActionCostText>;
    expected: ReturnType<typeof generateActionCostText>;
  }> = [
    { args: [{ kind: "focus", value: 1 }], expected: "{{集中}}消費1" },
    {
      args: [{ kind: "goodCondition", value: 1 }],
      expected: "{{好調}}消費1ターン",
    },
    { args: [{ kind: "life", value: 1 }], expected: "体力消費1" },
    { args: [{ kind: "motivation", value: 1 }], expected: "{{やる気}}消費1" },
    { args: [{ kind: "normal", value: 1 }], expected: undefined },
    {
      args: [{ kind: "positiveImpression", value: 1 }],
      expected: "{{好印象}}消費1",
    },
  ];
  test.each(testCases)('$args.0 => "$expected"', ({ args, expected }) => {
    expect(generateActionCostText(...args)).toBe(expected);
  });
});

describe("generateCardDescription", () => {
  const testCases: Array<{
    cardId: CardDefinition["id"];
    expected: ReturnType<typeof generateCardDescription>;
  }> = [
    {
      cardId: "apirunokihon",
      expected: ["パラメータ+9"].join("\n"),
    },
    {
      cardId: "pozunokihon",
      expected: ["パラメータ+2{{元気}}+2"].join("\n"),
    },
    {
      cardId: "chosen",
      expected: [
        "{{好調}}状態の場合、使用可",
        "パラメータ+25",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "shikosakugo",
      expected: ["パラメータ+8（2回）", "{{レッスン中1回}}"].join("\n"),
    },
    {
      cardId: "kawaiishigusa",
      expected: [
        "{{好印象}}+2",
        "{{好印象}}の100%分パラメータ上昇",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "kibuntenkan",
      expected: [
        "体力消費5",
        "{{元気}}の100%分パラメータ上昇",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "hyogennokihon",
      expected: ["{{元気}}+4", "{{レッスン中1回}}"].join("\n"),
    },
    {
      cardId: "furumainokihon",
      expected: ["{{元気}}+1", "{{好調}}2ターン"].join("\n"),
    },
    {
      cardId: "mesennokihon",
      expected: ["{{元気}}+1", "{{好印象}}+2"].join("\n"),
    },
    {
      cardId: "ishikinokihon",
      expected: ["{{元気}}+1", "{{やる気}}+2"].join("\n"),
    },
    {
      cardId: "nemuke",
      expected: ["{{レッスン中1回}}"].join("\n"),
    },
    {
      cardId: "ikioimakase",
      expected: ["パラメータ+6", "{{好調}}状態の場合、{{集中}}+3"].join("\n"),
    },
    {
      cardId: "haitatchi",
      expected: [
        "パラメータ+17（{{集中}}効果を1.5倍適用）",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "fasutosuteppu",
      expected: [
        "{{元気}}+3",
        "体力が50%以上の場合、{{消費体力削減}}1",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "hoyoryoku",
      expected: [
        "パラメータ+2{{元気}}+1",
        "体力回復2",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "uchikikeishojo",
      expected: [
        "{{好印象}}+1",
        "以降、ターン終了時、{{好印象}}+1",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "mikannotaiki",
      expected: [
        "体力消費3",
        "{{元気}}+2（レッスン中に使用したスキルカード1枚ごとに、{{元気}}増加量+3）",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "shupurehikoru",
      expected: [
        "{{集中}}消費3",
        "パラメータ+6",
        "{{好調}}2ターン",
        "{{スキルカード使用数追加}}+1",
        "{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "hatonoaizu",
      expected: [
        "体力消費3",
        "{{元気}}を半分にして、減少前の{{元気}}の130%分パラメータ上昇",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "enshutsukeikaku",
      expected: [
        "{{絶好調}}3ターン",
        "以降、{{アクティブスキルカード}}使用時、{{固定元気}}+2",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "shizukanaishi",
      expected: [
        "レッスン開始時手札に入る",
        "{{集中}}+3",
        "{{好調}}2ターン",
        "{{レッスン中1回}}",
      ].join("\n"),
    },
    {
      cardId: "onechandamono",
      expected: [
        "レッスンCLEARの100%以下の場合、使用可",
        "パラメータ+6{{元気}}+6",
        "次のターン、スキルカードを引く",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "sutoretchidangi",
      expected: [
        "3ターン目以降の場合、使用可",
        "パラメータ+3",
        "{{消費体力減少}}2ターン",
        "次のターン、手札をすべて{{レッスン中強化}}",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "kimegaodejidori",
      expected: [
        "{{好調}}3ターン",
        "{{集中}}+2",
        "体力が50%以上の場合、次のターン、スキルカードを引く",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "shikirinaoshi",
      expected: [
        "手札をすべて入れ替える",
        "{{消費体力減少}}4ターン",
        "{{スキルカード使用数追加}}+1",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "kokumintekiaidoru",
      expected: [
        "{{好調}}消費1ターン",
        "次に使用するスキルカードの効果をもう1回発動（1回）",
        "{{スキルカード使用数追加}}+1",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "tenshinramman",
      expected: [
        "{{集中}}+1",
        "以降、ターン終了時{{集中}}が3以上の場合、{{集中}}+2",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "wammoasuteppu",
      expected: [
        "パラメータ+7（2回）",
        "{{集中}}が6以上の場合、パラメータ+7",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
    {
      cardId: "usureyukukabe",
      expected: [
        "{{元気}}+3",
        "次のターン、手札をすべて{{レッスン中強化}}",
        "2ターン後、手札をすべて{{レッスン中強化}}",
        "{{レッスン中1回}}{{重複不可}}",
      ].join("\n"),
    },
  ];
  test.each(testCases)('$cardId => "$expected"', ({ cardId, expected }) => {
    const card = getCardDataById(cardId);
    expect(
      generateCardDescription({
        cost: card.base.cost,
        condition: card.base.condition,
        effects: card.base.effects,
        innate: card.base.innate,
        usableOncePerLesson: card.base.usableOncePerLesson,
        nonDuplicative: card.nonDuplicative,
      }),
    ).toBe(expected);
  });
});

describe("generateProducerItemTriggerAndConditionText", () => {
  const testCases: Array<{
    args: Parameters<typeof generateProducerItemTriggerAndConditionText>;
    expected: ReturnType<typeof generateProducerItemTriggerAndConditionText>;
    name: string;
  }> = [
    {
      args: [
        {
          trigger: { kind: "cardUsage" },
        },
      ],
      expected: "スキルカード使用時、",
      name: "cardUsage - no options",
    },
    {
      args: [
        {
          trigger: { kind: "cardUsage", cardSummaryKind: "active" },
        },
      ],
      expected: "{{アクティブスキルカード}}使用時、",
      name: "cardUsage - cardSummaryKind: active",
    },
    {
      args: [
        {
          trigger: { kind: "cardUsage", cardSummaryKind: "mental" },
        },
      ],
      expected: "{{メンタルスキルカード}}使用時、",
      name: "cardUsage - cardSummaryKind: mental",
    },
    {
      args: [
        {
          trigger: { kind: "cardUsage", cardDefinitionId: "adorenarinzenkai" },
        },
      ],
      expected: "{{アドレナリン全開}}使用時、",
      name: "cardUsage - cardDefinitionId",
    },
    {
      args: [
        {
          condition: { kind: "measureIfLifeIsEqualGreaterThanHalf" },
          trigger: { kind: "cardUsage" },
        },
      ],
      expected: "スキルカード使用時体力が50%以上の場合、",
      name: "cardUsage - condition - not countModifier",
    },
    {
      args: [
        {
          condition: { kind: "countModifier", modifierKind: "focus", min: 1 },
          trigger: { kind: "cardUsage" },
        },
      ],
      expected: "スキルカード使用後{{集中}}が1以上の場合、",
      name: "cardUsage - condition - countModifier",
    },
    {
      args: [
        {
          trigger: { kind: "everyTwoTurns" },
        },
      ],
      expected: "2ターンごとに、",
      name: "everyTwoTurns",
    },
    {
      args: [
        {
          condition: { kind: "hasGoodCondition" },
          trigger: { kind: "everyTwoTurns" },
        },
      ],
      expected: "2ターンごとに{{好調}}状態の場合、",
      name: "everyTwoTurns - condition",
    },
    {
      args: [
        {
          trigger: { kind: "modifierIncrease", modifierKind: "focus" },
        },
      ],
      expected: "{{集中}}が増加後、",
      name: "modifierIncrease - not goodCondition",
    },
    {
      args: [
        {
          trigger: { kind: "modifierIncrease", modifierKind: "goodCondition" },
        },
      ],
      expected: "{{好調}}の効果ターンが増加後、",
      name: "modifierIncrease - goodCondition",
    },
    {
      args: [
        {
          condition: { kind: "hasGoodCondition" },
          trigger: { kind: "modifierIncrease", modifierKind: "focus" },
        },
      ],
      expected: "{{集中}}が増加後{{好調}}状態の場合、",
      name: "modifierIncrease - condition",
    },
    {
      args: [
        {
          trigger: { kind: "turnEnd" },
        },
      ],
      expected: "ターン終了時、",
      name: "turnEnd",
    },
    {
      args: [
        {
          condition: { kind: "hasGoodCondition" },
          trigger: { kind: "turnEnd" },
        },
      ],
      expected: "ターン終了時{{好調}}状態の場合、",
      name: "turnEnd - condition",
    },
    {
      args: [
        {
          trigger: { kind: "turnStart" },
        },
      ],
      expected: "ターン開始時、",
      name: "turnStart",
    },
    {
      args: [
        {
          condition: { kind: "hasGoodCondition" },
          trigger: { kind: "turnStart" },
        },
      ],
      expected: "ターン開始時{{好調}}状態の場合、",
      name: "turnStart - condition",
    },
    {
      args: [
        {
          trigger: { kind: "turnStart", idolParameterKind: "vocal" },
        },
      ],
      expected: "【ボイスレッスン・ボイスターンのみ】ターン開始時、",
      name: "idolParameterKind - vocal",
    },
    {
      args: [
        {
          trigger: { kind: "turnStart", idolParameterKind: "dance" },
        },
      ],
      expected: "【ダンスレッスン・ダンスターンのみ】ターン開始時、",
      name: "idolParameterKind - dance",
    },
    {
      args: [
        {
          trigger: { kind: "turnStart", idolParameterKind: "visual" },
        },
      ],
      expected: "【ビジュアルレッスン・ビジュアルターンのみ】ターン開始時、",
      name: "idolParameterKind - visual",
    },
  ];
  test.each(testCases)('$name => "$expected"', ({ args, expected }) => {
    expect(generateProducerItemTriggerAndConditionText(...args)).toBe(expected);
  });
});

describe("generateProducerItemDescription", () => {
  const testCases: Array<{
    expected: ReturnType<typeof generateProducerItemDescription>;
    producerItemId: ProducerItemDefinition["id"];
  }> = [
    {
      producerItemId: "itsumonomeikupochi",
      expected: [
        "{{アクティブスキルカード}}使用時体力が50%以上の場合、{{集中}}+2",
        "（レッスン内1回）",
      ].join("\n"),
    },
    {
      producerItemId: "pinkunoosoroiburesu",
      expected: ["ターン開始時、{{集中}}+1", "（レッスン内2回）"].join("\n"),
    },
    {
      producerItemId: "chibidomotezukurimedaru",
      expected: [
        "ターン終了時{{好印象}}が6以上の場合、{{好印象}}+2",
        "（レッスン内2回）",
      ].join("\n"),
    },
    {
      producerItemId: "chozetsuammimmasuku",
      expected: [
        "ターン開始時最終ターンの場合、{{元気}}の50%分パラメータ上昇",
        "体力消費1",
      ].join("\n"),
    },
    {
      producerItemId: "watashinohatsunogakufu",
      expected: [
        "ターン開始時{{元気}}が0の場合、体力減少1",
        "{{集中}}+3",
        "（レッスン内2回）",
      ].join("\n"),
    },
    {
      producerItemId: "saikonihappinominamoto",
      expected: [
        "{{アドレナリン全開}}使用時、{{好調}}3ターン",
        "{{固定元気}}+5",
        "（レッスン内1回）",
      ].join("\n"),
    },
    {
      producerItemId: "korogaritsuzukerugenkinominamoto",
      expected: [
        "{{メンタルスキルカード}}使用後{{やる気}}が5以上の場合、{{やる気}}+3",
        "{{スキルカード使用数追加}}+1",
        "（レッスン内1回）",
      ].join("\n"),
    },
    {
      producerItemId: "etainoshirenaimono",
      expected: [
        "【ビジュアルレッスン・ビジュアルターンのみ】ターン開始時、{{パラメータ上昇量増加}}50%（1ターン）",
        "（レッスン内3回）",
      ].join("\n"),
    },
  ];
  test.each(testCases)(
    '$producerItemId => "$expected"',
    ({ expected, producerItemId }) => {
      const producerItem = getProducerItemDataById(producerItemId);
      expect(
        generateProducerItemDescription({
          cost: producerItem.base.cost,
          condition: producerItem.base.condition,
          effects: producerItem.base.effects,
          times: producerItem.base.times,
          trigger: producerItem.base.trigger,
        }),
      ).toBe(expected);
    },
  );
});
