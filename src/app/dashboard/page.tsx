"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllDecks, getDeckStats } from '@/lib/storage';
import { CardStatus } from '@/lib/models/flashcard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [decks, setDecks] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const loadedDecks = getAllDecks();
      setDecks(loadedDecks);
      
      // 各デッキの統計情報を取得
      const deckStats = loadedDecks.map(deck => getDeckStats(deck.id));
      setStats(deckStats.filter(Boolean));
      
      // 最初のデッキを選択
      if (loadedDecks.length > 0 && !selectedDeck) {
        setSelectedDeck(loadedDecks[0].id);
      }
    }
  }, []);

  // 選択されたデッキの統計情報
  const selectedDeckStats = stats.find(s => s?.deckId === selectedDeck);
  
  // 円グラフ用データ
  const pieData = selectedDeckStats ? [
    { name: '新規', value: selectedDeckStats.newCards, color: '#0088FE' },
    { name: '学習中', value: selectedDeckStats.learningCards, color: '#00C49F' },
    { name: '復習', value: selectedDeckStats.reviewCards, color: '#FFBB28' },
    { name: '習得済み', value: selectedDeckStats.knownCards, color: '#FF8042' },
  ] : [];
  
  // 棒グラフ用データ（全デッキの統計）
  const barData = stats.map(stat => ({
    name: decks.find(d => d.id === stat.deckId)?.name || 'Unknown',
    新規: stat.newCards,
    学習中: stat.learningCards,
    復習: stat.reviewCards,
    習得済み: stat.knownCards,
  }));

  // デッキが存在しない場合
  if (decks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-gray-600">デッキがありません</h2>
          <p className="mt-2 text-gray-500">カード編集ページからデッキを作成してください</p>
          <a href="/editor" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            デッキを作成する
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
      
      {/* デッキ選択 */}
      <div className="mb-6">
        <label htmlFor="deck-select" className="block text-sm font-medium text-gray-700">デッキを選択</label>
        <select
          id="deck-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedDeck || ''}
          onChange={(e) => setSelectedDeck(e.target.value)}
        >
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>{deck.name}</option>
          ))}
        </select>
      </div>
      
      {/* 選択されたデッキの統計情報 */}
      {selectedDeckStats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {decks.find(d => d.id === selectedDeck)?.name} の学習状況
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 円グラフ */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">カード状態の分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 統計情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">学習統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総カード数:</span>
                  <span className="font-medium">{selectedDeckStats.totalCards}枚</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">新規カード:</span>
                  <span className="font-medium text-blue-600">{selectedDeckStats.newCards}枚</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">学習中:</span>
                  <span className="font-medium text-green-600">{selectedDeckStats.learningCards}枚</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">復習:</span>
                  <span className="font-medium text-yellow-600">{selectedDeckStats.reviewCards}枚</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">習得済み:</span>
                  <span className="font-medium text-orange-600">{selectedDeckStats.knownCards}枚</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">最終学習日:</span>
                  <span className="font-medium">
                    {selectedDeckStats.lastStudied ? new Date(selectedDeckStats.lastStudied).toLocaleDateString() : '未学習'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">学習進捗:</span>
                  <span className="font-medium">
                    {selectedDeckStats.totalCards > 0 
                      ? `${Math.round((selectedDeckStats.knownCards / selectedDeckStats.totalCards) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 全デッキの統計情報 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">全デッキの学習状況</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="新規" stackId="a" fill="#0088FE" />
                <Bar dataKey="学習中" stackId="a" fill="#00C49F" />
                <Bar dataKey="復習" stackId="a" fill="#FFBB28" />
                <Bar dataKey="習得済み" stackId="a" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 学習ボタン */}
      <div className="mt-8 flex justify-center">
        <a 
          href={`/study?deck=${selectedDeck}`} 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          学習を開始する
        </a>
      </div>
    </div>
  );
}
