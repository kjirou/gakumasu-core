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
} from "./types";
import { createIdGenerator, shuffleArray } from "./utils";

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

const createCards = (params: { original: CardInProduction[] }): Card[] => {
  return params.original.map((cardInProduction) => {
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
  return {
    deck: shuffleArray(
      createCards({ original: params.idolInProduction.deck }),
      params.getRandom,
    ),
    discardPile: [],
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

/**
 * レッスンのターンを開始する
 *
 * - レッスン開始時に関わる処理も含む
 */
export const startLessonTurn = (
  lessonGamePlay: LessonGamePlay,
): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  // TODO: 手札の抽出
  // TODO: レッスン開始時トリガー
  // TODO: ターン開始時トリガー
  return newLessonGamePlay;
};

// const playCard
// const previewCardUsage

/**
 * レッスンのターンを終了する
 *
 * - レッスン終了時に関わる処理は、現在はなさそう
 */
const endLessonTurn = (lessonGamePlay: LessonGamePlay): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  // TODO: ターン終了時トリガー
  // TODO: 小目標発動
  return newLessonGamePlay;
};

/**
 * スキルカードを選択する
 *
 * - スキルカードを選択し、結果のプレビュー表示または使用を行う
 * - TODO: Pアイテムなどによる誘発された効果も、プレビューに反映されてる？
 */
export const selectCard = (
  lessonGamePlay: LessonGamePlay,
  cardInHandIndex: number,
): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  // TODO: もしプレビュー表示中で同じカード選択なら or not
  // TODO: スキルカード使用
  // TODO: スキルカード使用時トリガー
  // TODO: スキルカード使用による状態修正増加時トリガー
  return newLessonGamePlay;
};

/**
 * ターンをスキップする
 *
 * - 本家のボタンについているラベルは「Skip」
 * - プレビューはない
 */
export const skipTurn = (lessonGamePlay: LessonGamePlay): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  return newLessonGamePlay;
};

//
// UI側での想定の呼び出し方
//
// ```
// const lessonGamePlay = createLessonGamePlay();
//
// const onStartGame = () => {
//   setState(startLessonTurn(lessonGamePlay))
// };
//
// const onPressCard = () => {
//   setState(selectCard(lessonGamePlay, cardInHandIndex))
// };
//
// const onPress休憩 = () => {
//   setState(skipTurn(lessonGamePlay));
// };
// ```
//
