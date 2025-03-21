"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { getAllDecks, getDeck, getDueCards, rateCard } from '@/lib/storage';
import { CardDeck, Flashcard, CardRating } from '@/lib/models/flashcard';

function StudyContent() {
  const searchParams = useSearchParams();
  
  // 状態管理
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState<number[]>([0]);
  const [studyComplete, setStudyComplete] = useState(false);
  const [stats, setStats] = useState({ total: 0, remaining: 0, completed: 0 });

  // 初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedDecks = getAllDecks();
      setDecks(loadedDecks);
      
      // URLからデッキIDを取得
      const deckId = searchParams.get('deck');
      if (deckId && loadedDecks.some(deck => deck.id === deckId)) {
        setSelectedDeckId(deckId);
      } else if (loadedDecks.length > 0) {
        setSelectedDeckId(loadedDecks[0].id);
      }
    }
  }, [searchParams]);

  // 選択されたデッキが変更されたとき、学習すべきカードを取得
  useEffect(() => {
    if (selectedDeckId) {
      const cards = getDueCards(selectedDeckId);
      setDueCards(cards);
      setCurrentCardIndex(0);
      setVisibleSections([0]);
      setStudyComplete(cards.length === 0);
      setStats({
        total: cards.length,
        remaining: cards.length,
        completed: 0
      });
    }
  }, [selectedDeckId]);

  // 現在のカード
  const currentCard = dueCards.length > 0 && currentCardIndex < dueCards.length 
    ? dueCards[currentCardIndex] 
    : null;

  // 選択中のデッキ
  const selectedDeck = decks.find(deck => deck.id === selectedDeckId);

  // セクションを表示
  const handleShowNextSection = () => {
    if (!currentCard) return;
    
    const nextSectionIndex = visibleSections.length;
    if (nextSectionIndex < currentCard.sections.length) {
      setVisibleSections([...visibleSections, nextSectionIndex]);
    }
  };

  // カードを評価
  const handleRateCard = (rating: CardRating) => {
    if (!currentCard || !selectedDeckId) return;
    
    // カードを評価
    rateCard(selectedDeckId, currentCard.id, rating);
    
    // 次のカードへ
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setVisibleSections([0]);
      setStats({
        ...stats,
        remaining: stats.remaining - 1,
        completed: stats.completed + 1
      });
    } else {
      // 学習完了
      setStudyComplete(true);
    }
  };

  // デッキ選択
  const handleDeckChange = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  // 学習をリセット
  const handleResetStudy = () => {
    if (selectedDeckId) {
      const cards = getDueCards(selectedDeckId);
      setDueCards(cards);
      setCurrentCardIndex(0);
      setVisibleSections([0]);
      setStudyComplete(cards.length === 0);
      setStats({
        total: cards.length,
        remaining: cards.length,
        completed: 0
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">暗記モード</h1>
      
      {/* デッキ選択 */}
      <div className="mb-6">
        <label htmlFor="deck-select" className="block text-sm font-medium text-gray-700">デッキを選択</label>
        <select
          id="deck-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedDeckId || ''}
          onChange={(e) => handleDeckChange(e.target.value)}
        >
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>{deck.name}</option>
          ))}
        </select>
      </div>
      
      {/* 学習進捗 */}
      {selectedDeckId && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">学習進捗</span>
            <span className="text-sm text-gray-500">
              {stats.completed}/{stats.total} ({Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* デッキがない場合 */}
      {decks.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-gray-600">デッキがありません</h2>
          <p className="mt-2 text-gray-500">カード編集ページからデッキを作成してください</p>
          <a href="/editor" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            デッキを作成する
          </a>
        </div>
      ) : studyComplete ? (
        // 学習完了
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-green-600">学習完了！</h2>
          <p className="mt-2 text-gray-500">このデッキの学習すべきカードはすべて完了しました</p>
          <div className="mt-6 flex justify-center space-x-4">
            <a href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
              ダッシュボードへ
            </a>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={handleResetStudy}
            >
              もう一度学習する
            </button>
          </div>
        </div>
      ) : !currentCard ? (
        // カードがない場合
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-gray-600">学習すべきカードがありません</h2>
          <p className="mt-2 text-gray-500">カード編集ページからカードを追加するか、別のデッキを選択してください</p>
          <a href="/editor" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            カードを追加する
          </a>
        </div>
      ) : (
        // カード表示
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6 min-h-[300px]">
            {/* 表示中のセクション */}
            {visibleSections.map(sectionIndex => (
              <div key={sectionIndex} className="mb-4">
                {sectionIndex > 0 && <hr className="my-4 border-gray-300" />}
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: marked.parse(currentCard.sections[sectionIndex]?.content || '') }}
                />
              </div>
            ))}
            
            {/* 次のセクションを表示するボタン */}
            {visibleSections.length < currentCard.sections.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleShowNextSection}
                >
                  次のセクションを表示
                </button>
              </div>
            )}
          </div>
          
          {/* すべてのセクションが表示されたら評価ボタンを表示 */}
          {visibleSections.length === currentCard.sections.length && (
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                onClick={() => handleRateCard(CardRating.AGAIN)}
              >
                ✗ 覚え直し
              </button>
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600"
                onClick={() => handleRateCard(CardRating.HARD)}
              >
                △ 微妙
              </button>
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                onClick={() => handleRateCard(CardRating.GOOD)}
              >
                ◯ よくわかる
              </button>
            </div>
          )}
          
          {/* カード情報 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            カード {currentCardIndex + 1}/{dueCards.length} • ボックス {currentCard.box} • 
            {currentCard.lastReviewed > 0 
              ? `前回学習: ${new Date(currentCard.lastReviewed).toLocaleDateString()}` 
              : '初めての学習'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <StudyContent />
    </Suspense>
  );
}
