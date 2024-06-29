import type {
  ActionCost,
  Card,
  CardContentDefinition,
  Effect,
  GetRandom,
  Idol,
  Lesson,
  LessonUpdateQuery,
  LessonUpdateQueryDiff,
  LessonUpdateQueryReason,
  Modifier,
} from "./types";
import { maxHandSize, patchUpdates } from "./models";
import { shuffleArray } from "./utils";

const getCardContentDefinition = (card: Card): CardContentDefinition => {
  return card.original.definition.enhanced !== undefined &&
    card.enhancements.length > 0
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
  let newDeck = [...deck];
  let newDiscardPile = [...discardPile];
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

/**
 * スキルカードを手札へ加える
 *
 * - 山札から引いた時、レッスン開始時手札を引く時、生成した時、などに使う
 * - 手札が最大枚数の5枚に達した以降は、引いたスキルカードは手札へ加えずに捨札へ移動する
 * - TODO: [仕様確認] 最大手札数は本当に5枚か？
 * - TODO: [仕様確認] 最大手札数を超えて引いた時の捨札へ直行する挙動自体、記憶によるとなので本当かわからない
 */
export const addCardsToHandOrDiscardPile = (
  drawnCards: Array<Card["id"]>,
  hand: Lesson["hand"],
  discardPile: Lesson["discardPile"],
): {
  hand: Lesson["hand"];
  discardPile: Lesson["discardPile"];
} => {
  const newHand = [...hand];
  const newDiscardPile = [...discardPile];
  for (const drawnCard of drawnCards) {
    if (newHand.length < maxHandSize) {
      newHand.push(drawnCard);
    } else {
      newDiscardPile.push(drawnCard);
    }
  }
  return {
    hand: newHand,
    discardPile: newDiscardPile,
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
  const { hand: hand2, discardPile: discardPile2 } =
    addCardsToHandOrDiscardPile(drawnCards, lesson.hand, discardPile);
  let updates: LessonUpdateQuery[] = [
    {
      kind: "hand",
      cardIds: hand2,
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
  if (JSON.stringify(lesson.discardPile) !== JSON.stringify(discardPile2)) {
    updates = [
      ...updates,
      {
        kind: "discardPile",
        cardIds: discardPile2,
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

/** LessonUpdateQueryDiff からコスト消費関係部分を抜き出したもの */
type CostConsumptionUpdateQueryDiff = Extract<
  LessonUpdateQueryDiff,
  { kind: "life" } | { kind: "modifier" } | { kind: "vitality" }
>;

/**
 * コスト消費を計算する
 *
 * - 消費分のコストは足りる前提で呼び出す
 */
const calculateCostConsumption = (
  lesson: Lesson,
  cost: ActionCost,
): CostConsumptionUpdateQueryDiff[] => {
  const idol = lesson.idol;
  switch (cost.kind) {
    case "normal": {
      const updates: CostConsumptionUpdateQueryDiff[] = [];
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
      if (restCost > 0) {
        const result = calculateActualAndMaxComsumution(idol.life, restCost);
        updates.push({
          kind: "life",
          actual: result.actual,
          max: result.max,
        });
      }
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

const computeEffects = (
  lesson: Lesson,
  effects: Effect[],
  getRandom: GetRandom,
  beforeVitality: Idol["vitality"],
): LessonUpdateQueryDiff[] => {
  const diffs: LessonUpdateQueryDiff[] = [];
  for (const effect of effects) {
    // TODO: 効果発動条件の判定

    switch (effect.kind) {
      // 現在は、Pアイテムの「私の「初」の楽譜」にのみ存在し、スキルカードには存在しない効果
      case "drainLife": {
        diffs.push({
          kind: "life",
          actual: Math.max(-effect.value, -lesson.idol.life),
          max: -effect.value,
        });
        break;
      }
      case "drawCards": {
        const { deck, discardPile, drawnCards } = drawCardsFromDeck(
          lesson.deck,
          effect.amount,
          lesson.discardPile,
          getRandom,
        );
        const { hand, discardPile: discardPile2 } = addCardsToHandOrDiscardPile(
          drawnCards,
          lesson.hand,
          discardPile,
        );
        diffs.push({
          kind: "deck",
          cardIds: deck,
        });
        diffs.push({
          kind: "hand",
          cardIds: hand,
        });
        if (
          JSON.stringify(lesson.discardPile) !== JSON.stringify(discardPile2)
        ) {
          diffs.push({
            kind: "discardPile",
            cardIds: discardPile2,
          });
        }
        break;
      }
      case "enhanceHand": {
        diffs.push({
          kind: "cardEnhancement",
          // 手札の中で強化されていないスキルカードのみを対象にする
          cardIds: lesson.hand.filter((id) => {
            const card = lesson.cards.find((card) => card.id === id);
            // この分岐に入ることはない想定、型ガード用
            if (!card) {
              return false;
            }
            return (
              card.enhancements.find(
                (e) => e.kind === "original" || e.kind === "effect",
              ) === undefined
            );
          }),
        });
        break;
      }
      // default:
      //   const unreachable: never = effect.kind;
      //   throw new Error(`Unreachable statement`);
    }
  }
  return diffs;
};

export const useCard = (
  lesson: Lesson,
  historyResultIndex: LessonUpdateQuery["reason"]["historyResultIndex"],
  params: {
    getRandom: GetRandom;
    selectedCardInHandIndex: number;
  },
): LessonMutationResult => {
  const cardId = lesson.hand[params.selectedCardInHandIndex];
  if (cardId === undefined) {
    throw new Error(
      `Card not found in hand: selectedCardInHandIndex=${params.selectedCardInHandIndex}`,
    );
  }
  const card = lesson.cards.find((card) => card.id === cardId);
  if (card === undefined) {
    throw new Error(`Card not found in cards: cardId=${cardId}`);
  }
  const cardContent = getCardContentDefinition(card);
  const beforeVitality = lesson.idol.vitality;
  let newLesson = lesson;
  let nextHistoryResultIndex = historyResultIndex;

  //
  // 手札を捨札か除外へ移動
  //
  const discardOrRemovedCardUpdates: LessonUpdateQuery[] = [];
  discardOrRemovedCardUpdates.push({
    kind: "hand",
    cardIds: newLesson.hand.filter((id) => id !== cardId),
    reason: {
      kind: "cardUsage",
      cardId,
      historyTurnNumber: newLesson.turnNumber,
      historyResultIndex: nextHistoryResultIndex,
    },
  });
  if (cardContent.usableOncePerLesson) {
    discardOrRemovedCardUpdates.push({
      kind: "removedCardPile",
      cardIds: [...newLesson.removedCardPile, cardId],
      reason: {
        kind: "cardUsage",
        cardId,
        historyTurnNumber: newLesson.turnNumber,
        historyResultIndex: nextHistoryResultIndex,
      },
    });
  } else {
    discardOrRemovedCardUpdates.push({
      kind: "discardPile",
      cardIds: [...newLesson.discardPile, cardId],
      reason: {
        kind: "cardUsage",
        cardId,
        historyTurnNumber: newLesson.turnNumber,
        historyResultIndex: nextHistoryResultIndex,
      },
    });
  }
  newLesson = patchUpdates(newLesson, discardOrRemovedCardUpdates);
  nextHistoryResultIndex++;

  //
  // コスト消費
  //
  const costConsumptionUpdates: LessonUpdateQuery[] = calculateCostConsumption(
    newLesson,
    cardContent.cost,
  ).map((diff) => ({
    ...diff,
    reason: {
      kind: "cardUsage",
      cardId: card.id,
      historyTurnNumber: newLesson.turnNumber,
      historyResultIndex: nextHistoryResultIndex,
    },
  }));
  newLesson = patchUpdates(newLesson, costConsumptionUpdates);
  nextHistoryResultIndex++;

  //
  // 効果発動
  //
  const effectUpdates: LessonUpdateQuery[] = computeEffects(
    newLesson,
    cardContent.effects,
    params.getRandom,
    beforeVitality,
  ).map((diff) => ({
    ...diff,
    reason: {
      kind: "cardUsage",
      cardId: card.id,
      historyTurnNumber: newLesson.turnNumber,
      historyResultIndex: nextHistoryResultIndex,
    },
  }));
  newLesson = patchUpdates(newLesson, effectUpdates);
  nextHistoryResultIndex++;

  //
  // TODO: スキルカード再使用
  //

  //
  // TODO: スキルカード使用時トリガー
  //

  //
  // TODO: スキルカード使用による状態修正増加時トリガー
  //

  return {
    nextHistoryResultIndex,
    updates: [
      ...discardOrRemovedCardUpdates,
      ...costConsumptionUpdates,
      ...effectUpdates,
    ],
  };
};
