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
import {
  drawCardsOnLessonStart,
  previewCardUsage,
  useCard,
} from "./lesson-mutation";
import { handSizeOnLessonStart, patchUpdates } from "./models";

//
// UI側での想定の呼び出し方
//
// ゲーム開始:
// ```
// const lessonGamePlay = createLessonGamePlay();
// ```
//
// ターン開始:
// ```
// const newLessonGamePlay = startLessonTurn(lessonGamePlay);
// const recentUpdates = newLessonGamePlay.updates.slice(lessonGamePlay.updates.length);
// set状態遷移アニメーション(recentUpdates);
// // アニメーション設定がある場合は、それが終わるまで表示上反映されない
// setLesson(最新のLessonの状態を返す(newLessonGamePlay));
// ```
//
// カード選択してスキルカード使用プレビュー:
// ```
// // 使用できない状況のカードでもプレビューはできる、また、連鎖するPアイテム効果などはプレビュー表示されない
// const newLessonGamePlay = useCard(lessonGamePlay, cardInHandIndex, { preview: true });
// const recentUpdates = newLessonGamePlay.updates.slice(lessonGamePlay.updates.length);
// // プレビューは差分表示されるがアニメーションはされない
// const setプレビュー用Updates(recentUpdates)
// ```
//
// 手札のスキルカードを表示:
// ```
// // スキルカードIDと選択可能かの状態のリスト
// const 手札リスト = 手札を取得する(lessonGamePlay);
// const set手札リスト(手札リスト)
// ```
//
// カード選択してスキルカード使用:
// ```
// const newLessonGamePlay = useCard(lessonGamePlay, cardInHandIndex);
// const recentUpdates = newLessonGamePlay.updates.slice(lessonGamePlay.updates.length);
// set状態遷移アニメーション(recentUpdates);
// // アニメーション設定がある場合は、それが終わるまで表示上反映されない
// setLesson(最新のLessonの状態を返す(newLessonGamePlay));
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

  // TODO: ターン数増加

  // TODO: 1ターン目なら、レッスン開始時トリガー

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

  // TODO: ターン開始時トリガー

  return {
    ...lessonGamePlay,
    updates: updatesList.flat(),
  };
};

// const playCard、スコアパーフェクト達成によるゲーム終了判定含む（ターン終了時処理を介さずに即座に終了してそう？）
// const previewCardUsage

/**
 * スキルカードを選択する
 *
 * TODO: プレビューはUI側の都合として分けるから、selectCard じゃなくて useCard にすべき。その useCard の updates 結果を使って、プレビューを UI 側で作る。
 *
 * - スキルカードを選択し、結果のプレビュー表示または使用を行う
 * - TODO: Pアイテムなどによる誘発された効果も、プレビューに反映されてる？
 * - TODO: 手札のインデックスが存在しないときのバリデーション
 *
 * @param selectedCardInHandIndex 選択した手札のインデックス。 undefined は選択状態解除を意味し、本家UIでは選択中にスキルカード以外の部分をタップすることに相当する。
 */
export const selectCard = (
  lessonGamePlay: LessonGamePlay,
  selectedCardInHandIndex: number | undefined,
): LessonGamePlay => {
  let updatesList = [lessonGamePlay.updates];
  let lesson = lessonGamePlay.initialLesson;
  let historyResultIndex = 1;

  lesson = patchUpdates(lesson, updatesList[updatesList.length - 1]);
  // 選択中のスキルカードを更に選択した場合は使用する。それ以外は、プレビュー表示かプレビュー表示解除を行う。
  if (
    lesson.selectedCardInHandIndex === selectedCardInHandIndex &&
    selectedCardInHandIndex !== undefined
  ) {
    const result = useCard(lesson, historyResultIndex, {
      getRandom: lessonGamePlay.getRandom,
      selectedCardInHandIndex: selectedCardInHandIndex,
    });
    updatesList = [...updatesList, result.updates];
    historyResultIndex = result.nextHistoryResultIndex;
  } else {
    const result = previewCardUsage(lesson, historyResultIndex, {
      selectedCardInHandIndex: selectedCardInHandIndex,
    });
    updatesList = [...updatesList, result.updates];
    historyResultIndex = result.nextHistoryResultIndex;
  }

  // TODO: スキルカード使用数0ならターン終了

  return {
    ...lessonGamePlay,
    updates: updatesList.flat(),
  };
};

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
  // TODO: ターン数によるゲーム終了判定
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
