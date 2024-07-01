// このコメントブロックは、主にCopilotに対する指示を記述するためのものである。
//
// - このファイル及び関連するファイル群は、ある既存のデッキ構築型カードバトルローグライトゲームのコアライブラリである。
// - ライブラリ名もしくはプロジェクト名は、"gakumasu-core"である。
// - このファイルは、npm packageのエントリーポイントである。
// - UIに関する実装は行わない。
// - TypeScriptの型のプロパティ名を列挙する際は、キャメルケースを使い、アルファベット降順に並べる。
// - TypeScriptの型でstringのUnion型を列挙する際は、アルファベット降順に並べる。
// - MUST: ソースコードのコメント内では、Copilotは**絶対に**提案や補完を行わないこと。

// TODO: Pドリンク
// TODO: サポートアビリティ
// TODO: レッスン内の応援/トラブル
// TODO: レッスン履歴
// TODO: データの永続化サポート
// TODO: コンテスト、後のためのメモ
//       - AIの挙動を解読する必要がある、多少眺めた限りだとわからなかった
//       - レッスン中に放置するとカードがうっすら光っておすすめカードを教えてくれるが、それがコンテストと同じAIかもしれない
//         - もしそうだとすると、AIはサーバ側ではなくてクライアント側が計算しているのかもしれない

import { getCardDataById } from "./data/card";
import { getCharacterDataById } from "./data/character";
import { getIdolDataById } from "./data/idol";
import { getProducerItemDataById } from "./data/producer-item";
import {
  ActionCost,
  Card,
  CardInProduction,
  GetRandom,
  IdGenerator,
  Idol,
  IdolInProduction,
  Lesson,
  LessonGamePlay,
  LessonUpdateQuery,
  LessonUpdateQueryDiff,
  Modifier,
} from "./types";
import { createIdGenerator, shuffleArray } from "./utils";

/** ターン開始時の手札数 */
export const handSizeOnLessonStart = 3;

/** 手札の最大枚数 */
export const maxHandSize = 5;

// TODO: 初期カードセットをどこかに定義する
//       - 集中型: 試行錯誤、アピールの基本x2, ポーズの基本, 表情の基本x2, 表現の基本x2
export const createIdolInProduction = (params: {
  cards: CardInProduction[];
  idGenerator: IdGenerator;
  idolDefinitionId: string;
  specificCardEnhanced: boolean;
  specificProducerItemEnhanced: boolean;
}): IdolInProduction => {
  const idolDefinition = getIdolDataById(params.idolDefinitionId);
  const characterDefinition = getCharacterDataById(idolDefinition.characterId);
  const specificCardDefinition = getCardDataById(idolDefinition.specificCardId);
  const specificProducerItemDefinition = getProducerItemDataById(
    idolDefinition.specificProducerItemId,
  );
  return {
    // アイドル固有 ＞ メモリーカード供給 ＞ 初期カード、の順でデッキを構築する
    deck: [
      {
        id: params.idGenerator(),
        definition: specificCardDefinition,
        enhanced: params.specificCardEnhanced,
        enabled: true,
      },
      ...params.cards,
    ],
    definition: idolDefinition,
    life: characterDefinition.maxLife,
    maxLife: characterDefinition.maxLife,
    producerItems: [
      {
        id: params.idGenerator(),
        definition: specificProducerItemDefinition,
        enhanced: params.specificProducerItemEnhanced,
      },
    ],
  };
};

const createIdol = (params: { idolInProduction: IdolInProduction }): Idol => {
  return {
    life: params.idolInProduction.life,
    modifiers: [],
    original: params.idolInProduction,
    totalCardUsageCount: 0,
    vitality: 0,
  };
};

export const prepareCardsForLesson = (
  cardsInProduction: CardInProduction[],
): Card[] => {
  return cardsInProduction.map((cardInProduction) => {
    return {
      id: cardInProduction.id,
      original: cardInProduction,
      enhancements: cardInProduction.enhanced ? [{ kind: "original" }] : [],
    };
  });
};

export const createLesson = (params: {
  clearScoreThresholds: Lesson["clearScoreThresholds"];
  getRandom: GetRandom;
  idolInProduction: IdolInProduction;
  lastTurnNumber: Lesson["lastTurnNumber"];
}): Lesson => {
  const cards = prepareCardsForLesson(params.idolInProduction.deck);
  return {
    cards,
    clearScoreThresholds: params.clearScoreThresholds,
    deck: shuffleArray(
      cards.map((card) => card.id),
      params.getRandom,
    ),
    discardPile: [],
    hand: [],
    idol: createIdol({
      idolInProduction: params.idolInProduction,
    }),
    lastTurnNumber: params.lastTurnNumber,
    removedCardPile: [],
    selectedCardInHandIndex: undefined,
    score: 0,
    turnNumber: 1,
    remainingTurns: 0,
  };
};

/**
 * レッスンのクリアに対するスコア進捗を計算する
 */
export const calculateClearScoreProgress = (
  score: Lesson["score"],
  clearScoreThresholds: NonNullable<Lesson["clearScoreThresholds"]>,
): {
  clearScoreProgressPercentage: number;
  necessaryClearScore: number;
  necessaryPerfectScore: number | undefined;
  remainingClearScore: number;
  remainingPerfectScore: number | undefined;
} => {
  return {
    necessaryClearScore: clearScoreThresholds.clear,
    necessaryPerfectScore: clearScoreThresholds.perfect,
    remainingClearScore: Math.max(0, clearScoreThresholds.clear - score),
    remainingPerfectScore:
      clearScoreThresholds.perfect !== undefined
        ? Math.max(0, clearScoreThresholds.perfect - score)
        : undefined,
    clearScoreProgressPercentage: Math.floor(
      (score * 100) / clearScoreThresholds.clear,
    ),
  };
};

export const createLessonGamePlay = (params: {
  clearScoreThresholds?: Lesson["clearScoreThresholds"];
  idolInProduction: IdolInProduction;
  getRandom?: GetRandom;
  idGenerator?: IdGenerator;
  lastTurnNumber: Lesson["lastTurnNumber"];
}): LessonGamePlay => {
  const clearScoreThresholds =
    params.clearScoreThresholds !== undefined
      ? params.clearScoreThresholds
      : undefined;
  const getRandom = params.getRandom ? params.getRandom : Math.random;
  const idGenerator = params.idGenerator
    ? params.idGenerator
    : createIdGenerator();
  return {
    getRandom,
    idGenerator,
    initialLesson: createLesson({
      clearScoreThresholds,
      getRandom,
      idolInProduction: params.idolInProduction,
      lastTurnNumber: params.lastTurnNumber,
    }),
    updates: [],
  };
};

/** 「消費体力減少」・「消費体力削減」・「消費体力増加」を反映したコストを返す */
export const calculateActualActionCost = (
  cost: ActionCost,
  modifiers: Modifier[],
): ActionCost => {
  switch (cost.kind) {
    case "focus":
    case "motivation":
    case "goodCondition":
    case "positiveImpression": {
      return cost;
    }
    case "life":
    case "normal": {
      const lifeConsumptionReduction = modifiers.find(
        (e) => e.kind === "lifeConsumptionReduction",
      );
      const lifeConsumptionReductionValue =
        lifeConsumptionReduction !== undefined &&
        "value" in lifeConsumptionReduction
          ? lifeConsumptionReduction.value
          : 0;
      const halfLifeConsumption =
        modifiers.find((e) => e.kind === "halfLifeConsumption") !== undefined;
      const hasDoubleLifeConsumption =
        modifiers.find((e) => e.kind === "doubleLifeConsumption") !== undefined;
      const value = Math.max(cost.value - lifeConsumptionReductionValue, 0);
      let rate = hasDoubleLifeConsumption ? 2 : 1;
      rate = rate / (halfLifeConsumption ? 2 : 1);
      return {
        kind: cost.kind,
        value: Math.ceil(value * rate),
      };
    }
    default: {
      const unreachable: never = cost.kind;
      throw new Error(`Unreachable statement`);
    }
  }
};

/**
 * レッスン更新クエリを適用した結果のレッスンを返す
 *
 * - Redux の Action のような、単純な setter の塊
 *   - ロジックはなるべく含まない
 *     - 例えば、バリデーションや閾値処理などは、更新クエリを生成する際に行う
 */
export const patchUpdates = (
  lesson: Lesson,
  updates: LessonUpdateQuery[],
): Lesson => {
  let newLesson = { ...lesson };
  for (const update of updates) {
    switch (update.kind) {
      case "cardEnhancement": {
        newLesson = {
          ...newLesson,
          cards: newLesson.cards.map((card) => {
            return update.cardIds.includes(card.id)
              ? {
                  ...card,
                  enhancements: [...card.enhancements, { kind: "effect" }],
                }
              : card;
          }),
        };
        break;
      }
      case "cardPlacement": {
        newLesson = {
          ...newLesson,
          ...(update.deck ? { deck: update.deck } : {}),
          ...(update.discardPile ? { discardPile: update.discardPile } : {}),
          ...(update.hand ? { hand: update.hand } : {}),
          ...(update.removedCardPile
            ? { removedCardPile: update.removedCardPile }
            : {}),
        };
        break;
      }
      case "cards": {
        newLesson = {
          ...newLesson,
          cards: update.cards,
        };
        break;
      }
      case "life": {
        newLesson = {
          ...newLesson,
          idol: {
            ...newLesson.idol,
            life: newLesson.idol.life + update.actual,
          },
        };
        break;
      }
      case "modifier": {
        const sameKindIndex = newLesson.idol.modifiers.findIndex(
          (e) => e.kind === update.modifier.kind,
        );
        // 同種の状態修正がない場合は新規追加、または特殊な状態修正の場合は新規追加
        if (
          sameKindIndex === -1 ||
          update.modifier.kind === "delayedEffect" ||
          update.modifier.kind === "effectActivationAtEndOfTurn" ||
          update.modifier.kind === "effectActivationUponCardUsage"
        ) {
          return {
            ...newLesson,
            idol: {
              ...newLesson.idol,
              modifiers: [...newLesson.idol.modifiers, update.modifier],
            },
          };
        } else {
          let newModifiers: Modifier[] = newLesson.idol.modifiers.map(
            (modifier) => {
              let newModifier: Modifier = modifier;
              switch (update.modifier.kind) {
                // duration の設定もあるが、現在は常に 1 なので無視する
                case "additionalCardUsageCount": {
                  if (modifier.kind === update.modifier.kind) {
                    newModifier = {
                      ...modifier,
                      amount: modifier.amount + update.modifier.amount,
                    };
                  }
                  break;
                }
                case "debuffProtection":
                case "doubleEffect": {
                  if (modifier.kind === update.modifier.kind) {
                    newModifier = {
                      ...modifier,
                      times: modifier.times + update.modifier.times,
                    };
                  }
                  break;
                }
                case "doubleLifeConsumption":
                case "excellentCondition":
                case "halfLifeConsumption":
                case "goodCondition":
                case "mightyPerformance":
                case "noVitalityIncrease": {
                  if (modifier.kind === update.modifier.kind) {
                    newModifier = {
                      ...modifier,
                      duration: modifier.duration + update.modifier.duration,
                    };
                  }
                  break;
                }
                case "focus":
                case "motivation":
                case "positiveImpression": {
                  if (modifier.kind === update.modifier.kind) {
                    newModifier = {
                      ...modifier,
                      amount: modifier.amount + update.modifier.amount,
                    };
                  }
                  break;
                }
                case "lifeConsumptionReduction": {
                  if (modifier.kind === update.modifier.kind) {
                    newModifier = {
                      ...modifier,
                      value: modifier.value + update.modifier.value,
                    };
                  }
                  break;
                }
                case "delayedEffect":
                case "effectActivationAtEndOfTurn":
                case "effectActivationUponCardUsage": {
                  throw new Error("Unreachable statement");
                  break;
                }
                default:
                  const unreachable: never = update.modifier;
                  throw new Error(`Unreachable statement`);
              }
              return newModifier;
            },
          );
          newModifiers = newModifiers.filter((modifier) => {
            return (
              ("amount" in modifier && modifier.amount > 0) ||
              ("duration" in modifier && modifier.duration > 0) ||
              ("times" in modifier && modifier.times > 0) ||
              ("value" in modifier && modifier.value > 0)
            );
          });
          return {
            ...newLesson,
            idol: {
              ...newLesson.idol,
              modifiers: newModifiers,
            },
          };
        }
      }
      case "remainingTurns": {
        newLesson = {
          ...newLesson,
          remainingTurns: newLesson.remainingTurns + update.amount,
        };
        break;
      }
      case "score": {
        newLesson = {
          ...newLesson,
          score: newLesson.score + update.actual,
        };
        break;
      }
      case "selectedCardInHandIndex": {
        newLesson = {
          ...newLesson,
          selectedCardInHandIndex: update.index,
        };
        break;
      }
      case "turnNumberIncrease": {
        newLesson = {
          ...newLesson,
          turnNumber: newLesson.turnNumber + 1,
        };
        break;
      }
      case "vitality": {
        newLesson = {
          ...newLesson,
          idol: {
            ...newLesson.idol,
            vitality: newLesson.idol.vitality + update.actual,
          },
        };
        break;
      }
      default: {
        const unreachable: never = update;
        throw new Error(`Unreachable statement`);
      }
    }
  }
  return newLesson;
};
