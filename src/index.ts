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
import { drawCardsOnLessonStart } from "./lesson-mutation";
import { handSizeOnLessonStart, patchUpdates } from "./models";
import { shuffleArray } from "./utils";

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

/**
 * レッスンのターンを開始する
 *
 * - レッスン開始時に関わる処理も含む
 */
export const startLessonTurn = (
  lessonGamePlay: LessonGamePlay,
): LessonGamePlay => {
  let updatesList = [lessonGamePlay.updates];
  let lesson = lessonGamePlay.initialLesson;
  let historyResultIndex = 1;

  // 手札を山札から引く
  lesson = patchUpdates(lesson, updatesList[updatesList.length - 1]);
  updatesList = [
    ...updatesList,
    drawCardsOnLessonStart(lesson, {
      // 一時的なメモ: 次のターンにスキルカードを引く効果は、本家を見ると手札に後で足すアニメーションなので、この後のレッスン開始トリガーで別にやってそう
      count: handSizeOnLessonStart,
      historyResultIndex: historyResultIndex,
      getRandom: lessonGamePlay.getRandom,
    }),
  ];
  historyResultIndex++;

  // TODO: レッスン開始時トリガー

  // TODO: ターン開始時トリガー

  return {
    ...lessonGamePlay,
    updates: updatesList.flat(),
  };
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
  // TODO: 手札を捨てる
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
