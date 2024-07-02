import type {
  ActionCost,
  CardDefinition,
  CardContentDefinition,
  CardUsageCondition,
  Effect,
  EffectCondition,
  Modifier,
  ProducerItemContentDefinition,
  ProducerItemTrigger,
  RangedNumber,
  VitalityUpdateQuery,
} from "./types";

// TODO: そもそもそもそも、テキストを動的に生成せず、キーワードだけ考慮して、データとして固定値で持たせた方が良さそうだった

/**
 * 汎用的な数値範囲テキストを生成する
 *
 * - この後に、「の場合、」が続く想定
 * - 現状、本家に存在するのは、「n」と「n以上」のみである
 */
const generateRangedNumberText = (range: RangedNumber): string => {
  if ("min" in range && "max" in range) {
    if (range.min === range.max) {
      return `${range.min}`;
    }
    return `${range.min}以上${range.max}以下`;
  } else if ("min" in range && !("max" in range)) {
    return `${range.min}以上`;
  } else if (!("min" in range) && "max" in range) {
    return `${range.max}以下`;
  }
  throw new Error("Unreachable statement");
};

/**
 * ゲーム全体を通じてキーワード化されている名称
 *
 * - 本家の各種テキスト内で、タップ可能なキーワードになるもの
 *   - 大体はアイコン付きでもあるが、「レッスン中1回」「重複無効」はアイコンが無い
 * - スキルカードの効果説明欄・レッスン中の状態修正一覧・レッスン中の履歴、で同じ表記になる
 * - キーワード化されていそうで無いものも多い
 *   - 例えば、「国民的アイドル」の「次に使用するスキルカードの効果をもう1回発動（1回）」など
 * - 現状、キーの大半は Modifier["kind"] や Effect["kind"] のプロパティ名で構成されているが、それらとの紐付けは守れないので情報として使わないこと
 *   - 1状態修正や1効果の中に複数のキーワードが含まれることも有り得る、また逆に、1キーワードが複数の状態修正や効果に含まれることも有り得る
 */
const globalKeywords = {
  activeSkillCard: "アクティブスキルカード",
  additionalCardUsageCount: "スキルカード使用数追加",
  debuffProtection: "低下状態無効",
  doubleLifeConsumption: "消費体力増加",
  enhanceHand: "レッスン中強化",
  excellentCondition: "絶好調",
  fixedValueVitality: "固定元気",
  focus: "集中",
  generateCard: "生成",
  goodCondition: "好調",
  halfLifeConsumption: "消費体力減少",
  increaseRemainingTurns: "ターン追加",
  lifeConsumptionReduction: "消費体力削減",
  mentalSkillCard: "メンタルスキルカード",
  mightyPerformance: "パラメータ上昇量増加",
  motivation: "やる気",
  noVitalityIncrease: "元気増加無効",
  nonDuplicative: "重複不可",
  positiveImpression: "好印象",
  usableOncePerLesson: "レッスン中1回",
  vitality: "元気",
} as const satisfies Record<string, string>;

const kwd = (key: keyof typeof globalKeywords) => {
  return `{{${globalKeywords[key]}}}`;
};

/** globalKeywords と同じ趣旨で、データ由来のキーワードを分けたもの */
export const globalDataKeywords = {
  cards: {
    adorenarinzenkai: "アドレナリン全開",
  },
} as const satisfies Record<string, Record<string, string>>;

type KeywordCardDefinitionId = keyof typeof globalDataKeywords.cards;

const isKeywordCardDefinitionIdType = (
  idLike: string,
): idLike is KeywordCardDefinitionId => idLike in globalDataKeywords.cards;

const cardKwd = (key: string): string => {
  if (isKeywordCardDefinitionIdType(key)) {
    return `{{${globalDataKeywords.cards[key]}}}`;
  }
  throw new Error(`Global data keyword not found: ${key}`);
};

/**
 * 状態修正種別のみからキーワードを生成する
 *
 * - 基本的にこの関数を通す必要はない
 * - ModifierやEffectの単位よりさらに細かく生成したい場合に使う
 */
const generateModifierKindText = (
  modifierKind: "focus" | "goodCondition" | "motivation" | "positiveImpression",
): string => {
  switch (modifierKind) {
    case "focus":
      return kwd("focus");
    case "goodCondition":
      return kwd("goodCondition");
    case "motivation":
      return kwd("motivation");
    case "positiveImpression":
      return kwd("positiveImpression");
    default:
      const unreachable: never = modifierKind;
      throw new Error(`Unreachable statement`);
  }
};

/**
 * 一つの状態修正を表現したテキストを生成する
 */
const generateModifierText = (modifier: Modifier): string => {
  switch (modifier.kind) {
    case "additionalCardUsageCount":
      return `${kwd("additionalCardUsageCount")}+${modifier.amount}`;
    case "debuffProtection":
      return `${kwd("debuffProtection")}（${modifier.times}回）`;
    case "delayedEffect":
      return (
        (modifier.delay === 1
          ? `次のターン、`
          : `${modifier.delay}ターン後、`) + generateEffectText(modifier.effect)
      );
    case "doubleEffect":
      return `次に使用するスキルカードの効果をもう1回発動（${modifier.times}回）`;
    case "doubleLifeConsumption":
      return `${kwd("doubleLifeConsumption")}${modifier.duration}ターン`;
    case "effectActivationAtEndOfTurn":
      return [
        "以降、ターン終了時",
        // 条件がない場合のみ「、」を挿入する
        // 「内気系少女」は、「以降、ターン終了時、好印象+1」
        // 「天真爛漫」は、「以降、ターン終了時集中が3以上の場合、集中+2」
        modifier.effect.condition ? "" : "、",
        generateEffectText(modifier.effect),
      ].join("");
    case "effectActivationUponCardUsage":
      return (
        "以降、" +
        (modifier.cardKind === "active"
          ? kwd("activeSkillCard")
          : kwd("mentalSkillCard")) +
        "使用時、" +
        generateEffectText(modifier.effect)
      );
    case "excellentCondition":
      return `${kwd("excellentCondition")}${modifier.duration}ターン`;
    case "focus":
      return `${kwd("focus")}+${modifier.amount}`;
    case "goodCondition":
      return `${kwd("goodCondition")}${modifier.duration}ターン`;
    case "halfLifeConsumption":
      return `${kwd("halfLifeConsumption")}${modifier.duration}ターン`;
    case "lifeConsumptionReduction":
      return `${kwd("lifeConsumptionReduction")}${modifier.value}`;
    case "mightyPerformance":
      return `${kwd("mightyPerformance")}50%（${modifier.duration}ターン）`;
    case "motivation":
      return `${kwd("motivation")}+${modifier.amount}`;
    case "noVitalityIncrease":
      return `${kwd("noVitalityIncrease")}${modifier.duration}ターン`;
    case "positiveImpression":
      return `${kwd("positiveImpression")}+${modifier.amount}`;
    default:
      const unreachable: never = modifier;
      throw new Error(`Unreachable statement`);
  }
};

const generateVitalityUpdateQueryText = (
  query: VitalityUpdateQuery,
): string => {
  return (
    (query.fixedValue === true ? kwd("fixedValueVitality") : kwd("vitality")) +
    `+${query.value}` +
    (query.boostPerCardUsed !== undefined
      ? `（レッスン中に使用したスキルカード1枚ごとに、${kwd("vitality")}増加量+${query.boostPerCardUsed}）`
      : "")
  );
};

export const generateActionCostText = (
  cost: ActionCost,
): string | undefined => {
  switch (cost.kind) {
    case "focus":
      return `${kwd("focus")}消費${cost.value}`;
    case "goodCondition":
      return `${kwd("goodCondition")}消費${cost.value}ターン`;
    case "life":
      return `体力消費${cost.value}`;
    case "motivation":
      return `${kwd("motivation")}消費${cost.value}`;
    case "normal":
      // 通常コストは文字列で表示している箇所がないため。表示はスキルカード左下のアイコンのみ。
      return undefined;
    case "positiveImpression":
      return `${kwd("positiveImpression")}消費${cost.value}`;
    default:
      const unreachable: never = cost.kind;
      throw new Error(`Unreachable statement`);
  }
};

const generateEffectConditionText = (condition: EffectCondition): string => {
  switch (condition.kind) {
    case "countModifier":
      return `${generateModifierKindText(condition.modifierKind)}が${condition.min}以上の場合`;
    case "countReminingTurns":
      return condition.max === 1
        ? "最終ターンの場合"
        : `残り${condition.max}ターン以内の場合`;
    case "countVitality":
      return `${kwd("vitality")}が${generateRangedNumberText(condition.range)}の場合`;
    case "hasGoodCondition":
      return `${kwd("goodCondition")}状態の場合`;
    case "measureIfLifeIsEqualGreaterThanHalf":
      return "体力が50%以上の場合";
    default:
      const unreachable: never = condition;
      throw new Error(`Unreachable statement`);
  }
};

const generateEffectWithoutConditionText = (effect: Effect): string => {
  switch (effect.kind) {
    case "drainLife":
      return `体力減少${effect.value}`;
    case "drawCards":
      return effect.amount === 1
        ? "スキルカードを引く"
        : `スキルカードを${effect.amount}枚引く`;
    case "enhanceHand":
      return `手札をすべて${kwd("enhanceHand")}`;
    case "exchangeHand":
      return "手札をすべて入れ替える";
    case "generateCard":
      return `ランダムな強化済みスキルカード（SSR）を、手札に${kwd("generateCard")}`;
    case "increaseRemainingTurns":
      return `${kwd("increaseRemainingTurns")}+${effect.amount}`;
    case "getModifier":
      return generateModifierText(effect.modifier);
    case "multiplyModifier":
      return `${generateModifierKindText(effect.modifierKind)}${effect.multiplier}倍`;
    case "perform":
      return [
        effect.score ? `パラメータ+${effect.score.value}` : "",
        effect.score && effect.score.focusMultiplier !== undefined
          ? `（${kwd("focus")}効果を${effect.score.focusMultiplier}倍適用）`
          : "",
        effect.score && effect.score.times !== undefined
          ? `（${effect.score.times}回）`
          : "",
        effect.vitality ? generateVitalityUpdateQueryText(effect.vitality) : "",
      ].join("");
    case "performLeveragingModifier":
      return `${generateModifierKindText(effect.modifierKind)}の${effect.percentage}%分パラメータ上昇`;
    case "performLeveragingVitality":
      return (
        (() => {
          switch (effect.reductionKind) {
            case "halve":
              return `${kwd("vitality")}を半分にして、減少前の`;
            case "zero":
              return `${kwd("vitality")}を0にして、減少前の`;
            default:
              return "";
          }
        })() + `${kwd("vitality")}の${effect.percentage}%分パラメータ上昇`
      );
    case "recoverLife":
      return `体力回復${effect.value}`;
    default:
      const unreachable: never = effect;
      throw new Error(`Unreachable statement`);
  }
};

/**
 * 一つの効果を表現したテキストを生成する
 */
export const generateEffectText = (effect: Effect): string => {
  return [
    ...(effect.condition
      ? [generateEffectConditionText(effect.condition) + "、"]
      : []),
    generateEffectWithoutConditionText(effect),
  ].join("");
};

export const generateCardUsageConditionText = (
  condition: CardUsageCondition,
): string => {
  switch (condition.kind) {
    case "countTurnNumber":
      return `${condition.min}ターン目以降の場合、使用可`;
    case "countVitalityZero":
      return `${kwd("vitality")}が0の場合、使用可`;
    case "hasGoodCondition":
      return `${kwd("goodCondition")}状態の場合、使用可`;
    case "measureValue":
      return [
        condition.valueKind === "life" ? "体力" : "レッスンCLEAR",
        `の${condition.percentage}%`,
        condition.criterionKind === "greaterEqual" ? "以上" : "以下",
        "の場合、使用可",
      ].join("");
    default:
      const unreachable: never = condition;
      throw new Error(`Unreachable statement`);
  }
};

/**
 * スキルカードの効果説明欄のテキストを生成する
 */
export const generateCardDescription = (params: {
  cost: CardContentDefinition["cost"];
  condition: CardContentDefinition["condition"];
  effects: CardContentDefinition["effects"];
  innate?: CardContentDefinition["innate"];
  nonDuplicative?: CardDefinition["nonDuplicative"];
  usableOncePerLesson?: CardContentDefinition["usableOncePerLesson"];
}): string => {
  let lines: string[] = [];
  const costText = generateActionCostText(params.cost);
  if (costText !== undefined) {
    lines = [...lines, costText];
  }
  if (params.innate) {
    lines = [...lines, "レッスン開始時手札に入る"];
  }
  if (params.condition) {
    lines = [...lines, generateCardUsageConditionText(params.condition)];
  }
  lines = [...lines, ...params.effects.map(generateEffectText)];
  const lastLine =
    (params.usableOncePerLesson === true ? kwd("usableOncePerLesson") : "") +
    (params.nonDuplicative === true ? kwd("nonDuplicative") : "");
  if (lastLine) {
    lines = [...lines, lastLine];
  }
  return lines.join("\n");
};

export const generateProducerItemTriggerAndConditionText = (params: {
  condition?: EffectCondition;
  trigger: ProducerItemTrigger;
}): string => {
  const { condition, trigger } = params;
  let text = "";
  switch (trigger.idolParameterKind) {
    case "vocal":
      text += "【ボイスレッスン・ボイスターンのみ】";
      break;
    case "dance":
      text += "【ダンスレッスン・ダンスターンのみ】";
      break;
    case "visual":
      text += "【ビジュアルレッスン・ビジュアルターンのみ】";
      break;
  }
  switch (trigger.kind) {
    case "cardUsage":
      text += [
        (() => {
          if (trigger.cardDefinitionId !== undefined) {
            return cardKwd(trigger.cardDefinitionId);
          }
          switch (trigger.cardSummaryKind) {
            case "active":
              return kwd("activeSkillCard");
            case "mental":
              return kwd("mentalSkillCard");
            default:
              return "スキルカード";
          }
        })(),
        "使用",
        condition?.kind === "countModifier" ? "後" : "時",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    case "everyTwoTurns":
      text += [
        "2ターンごとに",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    case "lessonStart":
      text += [
        "レッスン開始時",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    case "modifierIncrease":
      text += [
        generateModifierKindText(trigger.modifierKind),
        trigger.modifierKind === "goodCondition" ? "の効果ターン" : "",
        "が増加後",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    case "turnEnd":
      text += [
        "ターン終了時",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    case "turnStart":
      text += [
        "ターン開始時",
        condition ? generateEffectConditionText(condition) : "",
        "、",
      ].join("");
      break;
    default:
      const unreachable: never = trigger;
      throw new Error(`Unreachable statement`);
  }
  return text;
};

const generateProducerItemTimesText = (
  times: ProducerItemContentDefinition["times"],
): string => {
  return `（レッスン内${times}回）`;
};

/**
 * Pアイテムの効果説明欄のテキストを生成する
 */
export const generateProducerItemDescription = (params: {
  condition?: ProducerItemContentDefinition["condition"];
  cost?: ProducerItemContentDefinition["cost"];
  effects: ProducerItemContentDefinition["effects"];
  times?: ProducerItemContentDefinition["times"];
  trigger: ProducerItemContentDefinition["trigger"];
}): string => {
  let lines: string[] = [];
  const triggerAndConditionText = generateProducerItemTriggerAndConditionText({
    condition: params.condition,
    trigger: params.trigger,
  });
  const effectTexts = params.effects.map(generateEffectText);
  lines = [
    ...lines,
    triggerAndConditionText + effectTexts[0],
    ...effectTexts.slice(1, effectTexts.length),
  ];
  if (params.cost !== undefined) {
    const costText = generateActionCostText(params.cost);
    // 通常コストがどこにも表記がなくなってしまいそうだが、現状、Pアイテムのコストに通常コストは存在しないので考慮しない
    if (costText !== undefined) {
      lines = [...lines, costText];
    }
  }
  if (params.times !== undefined) {
    lines = [...lines, generateProducerItemTimesText(params.times)];
  }
  return lines.join("\n");
};
