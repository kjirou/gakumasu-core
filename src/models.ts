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
  Card,
  CardInProduction,
  GetRandom,
  IdGenerator,
  Idol,
  IdolInProduction,
  Lesson,
  LessonGamePlay,
  LessonUpdateQuery,
} from "./types";
import { shuffleArray } from "./utils";

/** 手札の最大枚数 */
export const maxHandSize = 5;

// TODO: 初期カードセットをどこかに定義する
//       - 集中型: 試行錯誤、アピールの基本x2, ポーズの基本, 表情の基本x2, 表現の基本x2
export const createIdolInProduction = (params: {
  cards: CardInProduction[];
  id: string;
  idGenerator: IdGenerator;
  specificCardEnhanced: boolean;
  specificProducerItemEnhanced: boolean;
}): IdolInProduction => {
  const idolDefinition = getIdolDataById(params.id);
  const characterDefinition = getCharacterDataById(idolDefinition.characterId);
  const specificCardDefinition = getCardDataById(idolDefinition.specificCardId);
  const specificProducerItemDefinition = getProducerItemDataById(
    idolDefinition.specificProducerItemId,
  );
  return {
    deck: [
      ...params.cards,
      {
        id: params.idGenerator(),
        definition: specificCardDefinition,
        enhanced: params.specificCardEnhanced,
        enabled: true,
      },
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
      temporaryEnhancements: [],
    };
  });
};

const createLesson = (params: {
  getRandom: GetRandom;
  idolInProduction: IdolInProduction;
  lastTurnNumber: Lesson["lastTurnNumber"];
}): Lesson => {
  const cards = shuffleArray(
    prepareCardsForLesson(params.idolInProduction.deck),
    params.getRandom,
  );
  return {
    cards,
    deck: cards.map((card) => card.id),
    discardPile: [],
    hand: [],
    idol: createIdol({
      idolInProduction: params.idolInProduction,
    }),
    lastTurnNumber: params.lastTurnNumber,
    removedCardPile: [],
    score: 0,
    turnNumber: 1,
  };
};

export const createLessonGamePlay = (params: {
  idolInProduction: IdolInProduction;
  getRandom?: GetRandom;
  lastTurnNumber: Lesson["lastTurnNumber"];
}): LessonGamePlay => {
  const getRandom = params.getRandom ? params.getRandom : Math.random;
  return {
    getRandom,
    initialLesson: createLesson({
      getRandom,
      idolInProduction: params.idolInProduction,
      lastTurnNumber: params.lastTurnNumber,
    }),
    updates: [],
  };
};

export const patchUpdates = (
  lesson: Lesson,
  updates: LessonUpdateQuery[],
): Lesson => {
  let newLesson = lesson;
  for (const update of updates) {
    switch (update.kind) {
      case "deck": {
        newLesson = {
          ...newLesson,
          deck: update.cardIds,
        };
        break;
      }
      case "discardPile": {
        newLesson = {
          ...newLesson,
          discardPile: update.cardIds,
        };
        break;
      }
      case "hand": {
        newLesson = {
          ...newLesson,
          hand: update.cardIds,
        };
        break;
      }
      case "removedCardPile": {
        newLesson = {
          ...newLesson,
          removedCardPile: update.cardIds,
        };
        break;
      }
      // TODO: 後で never を使うのに書き直す
      default: {
        throw new Error(`Unexpected update kind: ${update.kind}`);
      }
    }
  }
  return newLesson;
};
