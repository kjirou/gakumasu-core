import type {
  ActionCost,
  Card,
  CardContentDefinition,
  GetRandom,
  Lesson,
  LessonUpdateQuery,
  LessonUpdateQueryReason,
  Modifier,
} from "./types";
import { shuffleArray } from "./utils";

const getCardContentDefinition = (card: Card): CardContentDefinition => {
  // TODO: レッスン中強化やサポートカードによる強化
  return card.original.definition.enhanced !== undefined &&
    card.original.enhanced
    ? card.original.definition.enhanced
    : card.original.definition.base;
};

/**
 * 山札から指定数のスキルカードを引く
 *
 * - 山札がなくなった場合は、捨札をシャッフルして山札にする
 */
export const drawCardsFromDeck = (
  deck: Lesson["deck"],
  count: number,
  discardPile: Lesson["discardPile"],
  getRandom: GetRandom,
): {
  deck: Array<Card["id"]>;
  discardPile: Array<Card["id"]>;
  drawnCards: Array<Card["id"]>;
} => {
  let newDeck = deck;
  let newDiscardPile = discardPile;
  let drawnCards = [];
  for (let i = 0; i < count; i++) {
    // 捨札を加えても引く数に足りない状況は考慮しない
    if (newDeck.length === 0) {
      newDeck = shuffleArray(newDiscardPile, getRandom);
      newDiscardPile = [];
    }
    const drawnCard = newDeck.shift();
    if (!drawnCard) {
      throw new Error("Unexpected empty deck");
    }
    drawnCards.push(drawnCard);
  }
  return {
    deck: newDeck,
    discardPile: newDiscardPile,
    drawnCards,
  };
};

type LessonMutationResult = {
  nextHistoryResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"];
  updates: LessonUpdateQuery[];
};

/**
 * ターン開始時に手札を引く
 *
 * - TODO: レッスン開始時に手札
 * - TODO: 手札最大枚数の制限
 */
export const drawCardsOnLessonStart = (
  lesson: Lesson,
  params: {
    count: number;
    getRandom: GetRandom;
    historyResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"];
  },
): LessonUpdateQuery[] => {
  const { deck, discardPile, drawnCards } = drawCardsFromDeck(
    lesson.deck,
    params.count,
    lesson.discardPile,
    params.getRandom,
  );
  let updates: LessonUpdateQuery[] = [
    {
      kind: "hand",
      cardIds: drawnCards,
      reason: {
        kind: "lessonStartTrigger",
        historyTurnNumber: lesson.turnNumber,
        historyResultIndex: params.historyResultIndex,
      },
    },
    {
      kind: "deck",
      cardIds: deck,
      reason: {
        kind: "lessonStartTrigger",
        historyTurnNumber: lesson.turnNumber,
        historyResultIndex: params.historyResultIndex,
      },
    },
  ];
  if (
    lesson.discardPile.some((cardId, index) => cardId !== discardPile[index])
  ) {
    updates = [
      ...updates,
      {
        kind: "discardPile",
        cardIds: discardPile,
        reason: {
          kind: "lessonStartTrigger",
          historyTurnNumber: lesson.turnNumber,
          historyResultIndex: params.historyResultIndex,
        },
      },
    ];
  }
  return updates;
};

/**
 * 手札使用のプレビュー表示をするか表示を解除する
 *
 * - コストを満たさない状態でもプレビューはできる
 *   - 足りないコストは、ゼロとして差分表示される
 * - TODO: 選択→選択解除、を繰り返すことで無限に更新クエリが増えてしまう問題。対策するなら historyResultIndex のスコープ内で圧縮処理を別に入れる。
 */
export const previewCardUsage = (
  lesson: Lesson,
  historyResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"],
  params: {
    selectedCardInHandIndex: number | undefined;
  },
): LessonMutationResult => {
  return {
    nextHistoryResultIndex: historyResultIndex + 1,
    updates: [
      {
        kind: "selectedCardInHandIndex",
        index: params.selectedCardInHandIndex,
        reason: {
          kind: "cardUsagePreview",
          historyTurnNumber: lesson.turnNumber,
          historyResultIndex,
        },
      },
    ],
  };
};

const calculateActualAndMaxComsumution = (
  resourceValue: number,
  costValue: number,
) => {
  return {
    actual: costValue > resourceValue ? -resourceValue : -costValue,
    max: -costValue,
    restCost: resourceValue > costValue ? 0 : costValue - resourceValue,
  };
};

/**
 * LessonUpdateQuery からコスト消費関係部分を抜き出したもの
 *
 * - TODO: LessonUpdateQuery と型を共通化する
 */
type CostConsumptionUpdate = (
  | {
      kind: "life" | "vitality";
    }
  | {
      kind: "modifier";
      modifierKind: Modifier["kind"];
    }
) & {
  actual: number;
  max: number;
};

/**
 * コスト消費を計算する
 *
 * - 消費分のコストは足りる前提で呼び出す
 */
export const calculateCostConsumption = (
  lesson: Lesson,
  cost: ActionCost,
): CostConsumptionUpdate[] => {
  const idol = lesson.idol;
  switch (cost.kind) {
    case "normal": {
      const updates: CostConsumptionUpdate[] = [];
      let restCost = cost.value;
      if (idol.vitality > 0) {
        const result = calculateActualAndMaxComsumution(
          idol.vitality,
          restCost,
        );
        restCost = result.restCost;
        updates.push({
          kind: "vitality",
          actual: result.actual,
          max: result.max,
        });
      }
      const result = calculateActualAndMaxComsumution(idol.life, restCost);
      updates.push({
        kind: "life",
        actual: -result.actual,
        max: -result.max,
      });
      return updates;
    }
    case "life": {
      return [
        {
          kind: "life",
          actual: -cost.value,
          max: -cost.value,
        },
      ];
    }
    case "focus":
    case "goodCondition":
    case "motivation":
    case "positiveImpression":
      return [
        {
          kind: "modifier",
          modifierKind: cost.kind,
          actual: -cost.value,
          max: -cost.value,
        },
      ];
    default:
      const unreachable: never = cost.kind;
      throw new Error(`Unreachable statement`);
  }
};

export const useCard = (
  lesson: Lesson,
  historyResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"],
  params: {
    selectedCardInHandIndex: number;
  },
): LessonMutationResult => {
  const cardId = lesson.hand[params.selectedCardInHandIndex];
  const card = lesson.cards.find((card) => card.id === cardId);
  if (card === undefined) {
    throw new Error("Card not found");
  }
  const cardContent = getCardContentDefinition(card);
  const beforeVitality = lesson.idol.vitality;
  const updates: LessonUpdateQuery[] = [];
  let nextHistoryResultIndex = historyResultIndex;

  // コスト消費
  const costConsumptions = calculateCostConsumption(lesson, cardContent.cost);
  for (const costConsumption of costConsumptions) {
    const reason: LessonUpdateQueryReason = {
      kind: "cardUsage",
      cardId: card.id,
      historyTurnNumber: lesson.turnNumber,
      historyResultIndex: nextHistoryResultIndex,
    };
    if (costConsumption.kind === "modifier") {
      updates.push({
        kind: costConsumption.kind,
        modifierKind: costConsumption.modifierKind,
        actual: costConsumption.actual,
        max: costConsumption.max,
        reason,
      });
    } else {
      updates.push({
        kind: costConsumption.kind,
        actual: costConsumption.actual,
        max: costConsumption.max,
        reason,
      });
    }
  }

  // TODO: スキルカード使用時トリガー

  // TODO: スキルカード使用による状態修正増加時トリガー

  return {
    nextHistoryResultIndex,
    updates,
  };
};
