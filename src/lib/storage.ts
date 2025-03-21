/**
 * ローカルストレージを使用したデータ永続化
 */
import { CardDeck, Flashcard, CardStatus, CardRating } from './models/flashcard';

// ローカルストレージのキー
const STORAGE_KEY_DECKS = 'flashcard-app-decks';

/**
 * すべてのデッキを取得
 */
export function getAllDecks(): CardDeck[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const decksJson = localStorage.getItem(STORAGE_KEY_DECKS);
    if (!decksJson) return [];
    return JSON.parse(decksJson);
  } catch (error) {
    console.error('デッキの取得に失敗しました:', error);
    return [];
  }
}

/**
 * デッキを保存
 */
export function saveAllDecks(decks: CardDeck[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  } catch (error) {
    console.error('デッキの保存に失敗しました:', error);
  }
}

/**
 * デッキを取得
 */
export function getDeck(deckId: string): CardDeck | null {
  const decks = getAllDecks();
  return decks.find(deck => deck.id === deckId) || null;
}

/**
 * デッキを作成
 */
export function createDeck(name: string, description: string): CardDeck {
  const now = Date.now();
  const newDeck: CardDeck = {
    id: `deck_${now}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    description,
    cards: [],
    createdAt: now,
    updatedAt: now
  };
  
  const decks = getAllDecks();
  decks.push(newDeck);
  saveAllDecks(decks);
  
  return newDeck;
}

/**
 * デッキを更新
 */
export function updateDeck(deck: CardDeck): void {
  const decks = getAllDecks();
  const index = decks.findIndex(d => d.id === deck.id);
  
  if (index !== -1) {
    decks[index] = {
      ...deck,
      updatedAt: Date.now()
    };
    saveAllDecks(decks);
  }
}

/**
 * デッキを削除
 */
export function deleteDeck(deckId: string): void {
  const decks = getAllDecks();
  const filteredDecks = decks.filter(deck => deck.id !== deckId);
  saveAllDecks(filteredDecks);
}

/**
 * カードを作成
 */
export function createCard(deckId: string, sections: { content: string }[]): Flashcard | null {
  const deck = getDeck(deckId);
  if (!deck) return null;
  
  const now = Date.now();
  const newCard: Flashcard = {
    id: `card_${now}_${Math.random().toString(36).substring(2, 9)}`,
    deckId,
    sections,
    status: CardStatus.NEW,
    box: 0,
    lastReviewed: 0,
    nextReview: now,
    createdAt: now,
    updatedAt: now
  };
  
  deck.cards.push(newCard);
  updateDeck(deck);
  
  return newCard;
}

/**
 * カードを更新
 */
export function updateCard(card: Flashcard): Flashcard | null {
  const deck = getDeck(card.deckId);
  if (!deck) return null;
  
  const index = deck.cards.findIndex(c => c.id === card.id);
  if (index === -1) return null;
  
  const updatedCard = {
    ...card,
    updatedAt: Date.now()
  };
  
  deck.cards[index] = updatedCard;
  updateDeck(deck);
  
  return updatedCard;
}

/**
 * カードを削除
 */
export function deleteCard(deckId: string, cardId: string): void {
  const deck = getDeck(deckId);
  if (!deck) return;
  
  deck.cards = deck.cards.filter(card => card.id !== cardId);
  updateDeck(deck);
}

/**
 * カードの評価を記録
 */
export function rateCard(deckId: string, cardId: string, rating: CardRating): Flashcard | null {
  const deck = getDeck(deckId);
  if (!deck) return null;
  
  const cardIndex = deck.cards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return null;
  
  const card = deck.cards[cardIndex];
  const now = Date.now();
  
  // 新しいボックス番号を計算
  const newBox = getNextBox(card.box, rating);
  
  // 次の復習日を計算
  const nextReviewDays = getNextReviewInterval(newBox);
  const nextReview = now + nextReviewDays * 24 * 60 * 60 * 1000;
  
  // カードのステータスを更新
  let newStatus = card.status;
  if (rating === CardRating.GOOD) {
    if (newBox >= 2) {
      newStatus = CardStatus.REVIEW;
    } else {
      newStatus = CardStatus.LEARNING;
    }
    if (newBox >= 5) {
      newStatus = CardStatus.KNOWN;
    }
  } else if (rating === CardRating.AGAIN) {
    newStatus = CardStatus.LEARNING;
  }
  
  // カードを更新
  const updatedCard: Flashcard = {
    ...card,
    status: newStatus,
    box: newBox,
    lastReviewed: now,
    nextReview,
    updatedAt: now
  };
  
  deck.cards[cardIndex] = updatedCard;
  updateDeck(deck);
  
  return updatedCard;
}

/**
 * 今日学習すべきカードを取得
 */
export function getDueCards(deckId: string): Flashcard[] {
  const deck = getDeck(deckId);
  if (!deck) return [];
  
  const now = Date.now();
  return deck.cards.filter(card => card.nextReview <= now);
}

/**
 * デッキの学習統計を取得
 */
export function getDeckStats(deckId: string) {
  const deck = getDeck(deckId);
  if (!deck) return null;
  
  const totalCards = deck.cards.length;
  const newCards = deck.cards.filter(card => card.status === CardStatus.NEW).length;
  const learningCards = deck.cards.filter(card => card.status === CardStatus.LEARNING).length;
  const reviewCards = deck.cards.filter(card => card.status === CardStatus.REVIEW).length;
  const knownCards = deck.cards.filter(card => card.status === CardStatus.KNOWN).length;
  
  // 最後に学習した日時を取得
  let lastStudied = 0;
  deck.cards.forEach(card => {
    if (card.lastReviewed > lastStudied) {
      lastStudied = card.lastReviewed;
    }
  });
  
  return {
    deckId,
    totalCards,
    newCards,
    learningCards,
    reviewCards,
    knownCards,
    lastStudied
  };
}

// 以下の関数はflashcard.tsからインポートすべきですが、
// このファイルの完全性のために一時的に複製しています
import { getNextBox, getNextReviewInterval } from './models/flashcard';
