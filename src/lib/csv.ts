/**
 * CSVインポート/エクスポート機能
 */
import Papa from 'papaparse';
import { CardDeck, Flashcard, CardStatus } from './models/flashcard';
import { createDeck, getDeck, createCard, updateDeck } from './storage';

/**
 * CSVからデッキをインポート
 * @param csvString CSVデータ
 * @param deckName デッキ名
 * @param deckDescription デッキの説明
 * @returns 作成されたデッキ
 */
export function importDeckFromCSV(
  csvString: string,
  deckName: string,
  deckDescription: string
): CardDeck | null {
  try {
    // CSVをパース
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true
    });
    
    if (parseResult.errors.length > 0) {
      console.error('CSVのパースエラー:', parseResult.errors);
      return null;
    }
    
    // 新しいデッキを作成
    const newDeck = createDeck(deckName, deckDescription);
    
    // 各行からカードを作成
    parseResult.data.forEach((row: any) => {
      // 少なくとも1つのセクションが必要
      if (!row.front) return;
      
      const sections = [{ content: row.front }];
      
      // 裏面があれば追加
      if (row.back) {
        sections.push({ content: row.back });
      }
      
      // 追加のセクションがあれば追加
      for (let i = 1; i <= 10; i++) {
        const sectionKey = `section${i}`;
        if (row[sectionKey]) {
          sections.push({ content: row[sectionKey] });
        }
      }
      
      // カードを作成
      createCard(newDeck.id, sections);
    });
    
    return getDeck(newDeck.id);
  } catch (error) {
    console.error('CSVインポートエラー:', error);
    return null;
  }
}

/**
 * デッキをCSVにエクスポート
 * @param deckId デッキID
 * @returns CSVデータ
 */
export function exportDeckToCSV(deckId: string): string | null {
  try {
    const deck = getDeck(deckId);
    if (!deck) return null;
    
    // カードデータを変換
    const csvData = deck.cards.map(card => {
      const result: Record<string, string> = {};
      
      // 各セクションをCSVの列に変換
      card.sections.forEach((section, index) => {
        if (index === 0) {
          result.front = section.content;
        } else if (index === 1) {
          result.back = section.content;
        } else {
          result[`section${index - 1}`] = section.content;
        }
      });
      
      return result;
    });
    
    // CSVに変換
    return Papa.unparse(csvData);
  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
    return null;
  }
}
