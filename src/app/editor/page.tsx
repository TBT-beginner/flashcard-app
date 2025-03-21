"use client";

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { getAllDecks, createDeck, updateDeck, deleteDeck, createCard, updateCard, deleteCard } from '@/lib/storage';
import { importDeckFromCSV, exportDeckToCSV } from '@/lib/csv';
import { CardDeck, Flashcard } from '@/lib/models/flashcard';

export default function EditorPage() {
  // デッキ関連の状態
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  
  // カード関連の状態
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardSections, setCardSections] = useState<{ content: string }[]>([{ content: '' }, { content: '' }]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // CSV関連の状態
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importDeckName, setImportDeckName] = useState('');
  const [importDeckDescription, setImportDeckDescription] = useState('');

  // 初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadDecks();
    }
  }, []);

  // デッキ読み込み
  const loadDecks = () => {
    const loadedDecks = getAllDecks();
    setDecks(loadedDecks);
    
    // 最初のデッキを選択
    if (loadedDecks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(loadedDecks[0].id);
    } else if (loadedDecks.length === 0) {
      setSelectedDeckId(null);
    }
  };

  // 選択中のデッキ
  const selectedDeck = decks.find(deck => deck.id === selectedDeckId);

  // 選択中のカード
  const selectedCard = selectedDeck?.cards.find(card => card.id === selectedCardId);

  // カード選択時の処理
  useEffect(() => {
    if (selectedCard) {
      setCardSections(selectedCard.sections);
      setCurrentSectionIndex(0);
    } else {
      setCardSections([{ content: '' }, { content: '' }]);
    }
  }, [selectedCardId, selectedCard]);

  // デッキ作成
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    createDeck(newDeckName, newDeckDescription);
    setNewDeckName('');
    setNewDeckDescription('');
    loadDecks();
  };

  // デッキ削除
  const handleDeleteDeck = (deckId: string) => {
    if (confirm('このデッキを削除してもよろしいですか？含まれるカードもすべて削除されます。')) {
      deleteDeck(deckId);
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
        setSelectedCardId(null);
      }
      loadDecks();
    }
  };

  // カード作成/更新
  const handleSaveCard = () => {
    // 少なくとも1つのセクションが必要
    if (!cardSections[0]?.content.trim()) return;
    
    if (selectedDeckId) {
      if (selectedCardId) {
        // カード更新
        if (selectedCard) {
          const updatedCard = { ...selectedCard, sections: cardSections };
          updateCard(updatedCard);
        }
      } else {
        // 新規カード作成
        createCard(selectedDeckId, cardSections);
      }
      
      // 状態リセット
      setCardSections([{ content: '' }, { content: '' }]);
      setSelectedCardId(null);
      loadDecks();
    }
  };

  // カード削除
  const handleDeleteCard = (cardId: string) => {
    if (selectedDeckId && confirm('このカードを削除してもよろしいですか？')) {
      deleteCard(selectedDeckId, cardId);
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
      loadDecks();
    }
  };

  // セクション追加
  const handleAddSection = () => {
    setCardSections([...cardSections, { content: '' }]);
  };

  // セクション削除
  const handleRemoveSection = (index: number) => {
    if (cardSections.length <= 2) return; // 最低2つのセクションは維持
    
    const newSections = [...cardSections];
    newSections.splice(index, 1);
    setCardSections(newSections);
  };

  // セクション内容更新
  const handleSectionChange = (index: number, content: string) => {
    const newSections = [...cardSections];
    newSections[index] = { content };
    setCardSections(newSections);
  };

  // CSVインポート
  const handleImportCSV = () => {
    if (!csvFile || !importDeckName.trim()) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      if (csvContent) {
        importDeckFromCSV(csvContent, importDeckName, importDeckDescription);
        setCsvFile(null);
        setImportDeckName('');
        setImportDeckDescription('');
        loadDecks();
      }
    };
    reader.readAsText(csvFile);
  };

  // CSVエクスポート
  const handleExportCSV = () => {
    if (!selectedDeckId) return;
    
    const csvContent = exportDeckToCSV(selectedDeckId);
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDeck?.name || 'deck'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">カードデッキエディタ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* デッキリスト */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-700 mb-4">デッキ一覧</h2>
          
          {/* デッキ作成フォーム */}
          <div className="mb-6 p-3 bg-white rounded shadow-sm">
            <h3 className="text-md font-medium text-gray-700 mb-2">新規デッキ作成</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="deck-name" className="block text-sm font-medium text-gray-700">デッキ名</label>
                <input
                  type="text"
                  id="deck-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="deck-description" className="block text-sm font-medium text-gray-700">説明</label>
                <textarea
                  id="deck-description"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleCreateDeck}
              >
                デッキを作成
              </button>
            </div>
          </div>
          
          {/* デッキリスト */}
          <div className="space-y-2">
            {decks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">デッキがありません</p>
            ) : (
              decks.map(deck => (
                <div 
                  key={deck.id} 
                  className={`p-3 rounded cursor-pointer ${selectedDeckId === deck.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-white hover:bg-gray-100'}`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{deck.name}</h3>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                    >
                      削除
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{deck.cards.length}枚のカード</p>
                  {deck.description && <p className="text-sm text-gray-600 mt-1">{deck.description}</p>}
                </div>
              ))
            )}
          </div>
          
          {/* CSVインポート/エクスポート */}
          <div className="mt-6 p-3 bg-white rounded shadow-sm">
            <h3 className="text-md font-medium text-gray-700 mb-2">CSVインポート/エクスポート</h3>
            
            {/* インポート */}
            <div className="mb-4 space-y-3">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700">CSVファイル</label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <label htmlFor="import-deck-name" className="block text-sm font-medium text-gray-700">インポート先デッキ名</label>
                <input
                  type="text"
                  id="import-deck-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={importDeckName}
                  onChange={(e) => setImportDeckName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="import-deck-description" className="block text-sm font-medium text-gray-700">デッキの説明</label>
                <input
                  type="text"
                  id="import-deck-description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={importDeckDescription}
                  onChange={(e) => setImportDeckDescription(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleImportCSV}
                disabled={!csvFile || !importDeckName.trim()}
              >
                CSVインポート
              </button>
            </div>
            
            {/* エクスポート */}
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleExportCSV}
              disabled={!selectedDeckId}
            >
              選択中のデッキをCSVエクスポート
            </button>
          </div>
        </div>
        
        {/* カードリスト */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            {selectedDeck ? `${selectedDeck.name}のカード` : 'カード一覧'}
          </h2>
          
          {!selectedDeckId ? (
            <p className="text-gray-500 text-center py-4">デッキを選択してください</p>
          ) : selectedDeck?.cards.length === 0 ? (
            <p className="text-gray-500 text-center py-4">カードがありません</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedDeck?.cards.map(card => (
                <div 
                  key={card.id} 
                  className={`p-3 rounded cursor-pointer ${selectedCardId === card.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-white hover:bg-gray-100'}`}
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium truncate" dangerouslySetInnerHTML={{ __html: marked.parse(card.sections[0].content.split('\n')[0] || '(空のカード)') }} />
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                    >
                      削除
                    </button>
                  </div>
                  {card.sections.length > 1 && (
                    <div className="text-sm text-gray-500 mt-1 truncate" dangerouslySetInnerHTML={{ __html: marked.parse(card.sections[1].content.split('\n')[0] || '') }} />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {selectedDeckId && (
            <div className="mt-4">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setSelectedCardId(null)}
              >
                新規カードを作成
              </button>
            </div>
          )}
        </div>
        
        {/* カードエディタ */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              {selectedCardId ? 'カード編集' : '新規カード作成'}
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded ${previewMode ? 'bg-gray-200' : 'bg-indigo-600 text-white'}`}
                onClick={() => setPreviewMode(false)}
              >
                編集
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded ${previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setPreviewMode(true)}
              >
                プレビュー
              </button>
            </div>
          </div>
          
          {!selectedDeckId ? (
            <p className="text-gray-500 text-center py-4">デッキを選択してください</p>
          ) : (
            <>
              {/* セクションタブ */}
              <div className="flex border-b border-gray-200 mb-4">
                {cardSections.map((section, index) => (
                  <button
                    key={index}
                    className={`py-2 px-4 text-sm font-medium ${currentSectionIndex === index ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setCurrentSectionIndex(index)}
                  >
                    {index === 0 ? '表面' : index === 1 ? '裏面' : `セクション${index}`}
                  </button>
                ))}
                <button
                  className="py-2 px-4 text-sm font-medium text-green-600 hover:text-green-700"
                  onClick={handleAddSection}
                >
                  +
                </button>
              </div>
              
              {/* エディタ/プレビュー */}
              <div className="mb-4">
                {previewMode ? (
                  <div 
                    className="prose max-w-none min-h-[200px] p-3 bg-white rounded border border-gray-300"
                    dangerouslySetInnerHTML={{ __html: marked.parse(cardSections[currentSectionIndex]?.content || '') }}
                  />
                ) : (
                  <textarea
                    className="w-full min-h-[200px] p-3 rounded border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={cardSections[currentSectionIndex]?.content || ''}
                    onChange={(e) => handleSectionChange(currentSectionIndex, e.target.value)}
                    placeholder="Markdown+HTMLでコンテンツを入力してください"
                  />
                )}
              </div>
              
              {/* セクション操作ボタン */}
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => handleRemoveSection(currentSectionIndex)}
                  disabled={cardSections.length <= 2 || currentSectionIndex < 2}
                >
                  このセクションを削除
                </button>
                <div className="text-sm text-gray-500">
                  セクションは "---" で区切ることもできます
                </div>
              </div>
              
              {/* 保存ボタン */}
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSaveCard}
              >
                カードを保存
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
