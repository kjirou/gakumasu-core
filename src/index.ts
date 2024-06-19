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
// TODO: レッスン内の小目標
// TODO: データの永続化サポート
// TODO: コンテスト、後のためのメモ
//       - AIの挙動を解読する必要がある、多少眺めた限りだとわからなかった
//       - レッスン中に放置するとカードがうっすら光っておすすめカードを教えてくれるが、それがコンテストと同じAIかもしれない
//         - もしそうだとすると、AIはサーバ側ではなくてクライアント側が計算しているのかもしれない

import { Idol, IdolInProduction, Lesson, LessonGamePlay } from "./types";

const createIdol = (params: { idolInProduction: IdolInProduction }): Idol => {
  return {
    life: params.idolInProduction.life,
    original: params.idolInProduction,
    totalCardUsageCount: 0,
    vitality: 0,
  };
};

const createLesson = (params: {
  idolInProduction: IdolInProduction;
  lastTurnNumber: Lesson["lastTurnNumber"];
}): Lesson => {
  return {
    idol: createIdol({
      idolInProduction: params.idolInProduction,
    }),
    lastTurnNumber: params.lastTurnNumber,
    score: 0,
    turnNumber: 1,
  };
};

export const createLessonGamePlay = (): LessonGamePlay => {};

/**
 * レッスンのターンを開始する
 *
 * - レッスン開始時に関わる処理も含む
 */
export const startLessonTurn = (
  lessonGamePlay: LessonGamePlay,
): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  // TODO: レッスン開始時トリガー
  // TODO: ターン開始時トリガー
  return newLessonGamePlay;
};

// const playCard
// const previewCardUsage

/**
 * スキルカードを選択する
 *
 * - スキルカードを選択し、結果のプレビュー表示または使用を行う
 * - TODO: スキルカード使用による状態修正増加時トリガーによる効果も、プレビューに反映されてる？
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
 * レッスンのターンを終了する
 *
 * - レッスン終了時に関わる処理は、現在はなさそう
 */
export const endLessonTurn = (
  lessonGamePlay: LessonGamePlay,
): LessonGamePlay => {
  let newLessonGamePlay = lessonGamePlay;
  // TODO: ターン終了時トリガー
  // TODO: 小目標発動
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
//   setState(休憩する(lessonGamePlay));
// };
// ```
//
