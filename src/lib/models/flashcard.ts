/**
 * フラッシュカードのデータモデル
 */

// カードの学習状態
export enum CardStatus {
  NEW = 'new',           // 新規カード
  LEARNING = 'learning', // 学習中
  REVIEW = 'review',     // 復習
  KNOWN = 'known'        // 習得済み
}

// カードの評価
export enum CardRating {
  AGAIN = 0,  // ✗: 覚え直し
  HARD = 1,   // △: 微妙
  GOOD = 2    // ◯: よくわかる
}

// カードのセクション
export interface CardSection {
  content: string;  // Markdown+HTMLコンテンツ
}

// フラッシュカード
export interface Flashcard {
  id: string;             // カードID
  deckId: string;         // 所属デッキID
  sections: CardSection[]; // カードセクション（表面・裏面など）
  status: CardStatus;     // カードの学習状態
  box: number;            // Leitnerボックス番号（0-5）
  lastReviewed: number;   // 最後に学習した日時（UNIXタイムスタンプ）
  nextReview: number;     // 次の学習予定日時（UNIXタイムスタンプ）
  createdAt: number;      // 作成日時
  updatedAt: number;      // 更新日時
}

// カードデッキ
export interface CardDeck {
  id: string;           // デッキID
  name: string;         // デッキ名
  description: string;  // デッキの説明
  cards: Flashcard[];   // カード一覧
  createdAt: number;    // 作成日時
  updatedAt: number;    // 更新日時
}

// 学習統計
export interface StudyStats {
  deckId: string;       // デッキID
  totalCards: number;   // カード総数
  newCards: number;     // 新規カード数
  learningCards: number;// 学習中カード数
  reviewCards: number;  // 復習カード数
  knownCards: number;   // 習得済みカード数
  lastStudied: number;  // 最後に学習した日時
}

// 間隔反復学習アルゴリズム用の定数
export const LEITNER_INTERVALS = [
  1,      // ボックス0: 1日後（覚え直し）
  2,      // ボックス1: 2日後
  4,      // ボックス2: 4日後
  7,      // ボックス3: 7日後
  14,     // ボックス4: 14日後
  30      // ボックス5: 30日後
];

/**
 * 次の復習日を計算する
 * @param box Leitnerボックス番号
 * @returns 次の復習までの日数
 */
export function getNextReviewInterval(box: number): number {
  if (box < 0) return 0;
  if (box >= LEITNER_INTERVALS.length) return LEITNER_INTERVALS[LEITNER_INTERVALS.length - 1];
  return LEITNER_INTERVALS[box];
}

/**
 * カードの評価に基づいて次のボックス番号を計算する
 * @param currentBox 現在のボックス番号
 * @param rating カードの評価
 * @returns 次のボックス番号
 */
export function getNextBox(currentBox: number, rating: CardRating): number {
  switch (rating) {
    case CardRating.AGAIN: // ✗: 覚え直し
      return 0;
    case CardRating.HARD: // △: 微妙
      return Math.max(0, currentBox);
    case CardRating.GOOD: // ◯: よくわかる
      return Math.min(LEITNER_INTERVALS.length - 1, currentBox + 1);
    default:
      return currentBox;
  }
}
