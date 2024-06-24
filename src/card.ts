import {
  Card,
  CardContentDefinition,
  CardInProduction,
  GetRandom,
  IdGenerator,
  Idol,
  IdolInProduction,
  Lesson,
  LessonGamePlay,
  LessonUpdateQuery,
} from "./types";

export const getCardContentDefinition = (card: Card): CardContentDefinition => {
  // TODO: レッスン中強化やサポートカードによる強化
  return card.original.definition.enhanced !== undefined &&
    card.original.enhanced
    ? card.original.definition.enhanced
    : card.original.definition.base;
};
