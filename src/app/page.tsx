import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">フラッシュカードアプリ</h1>
        <p className="text-xl text-gray-600 mb-8">効率的な学習をサポートする間隔反復学習アプリ</p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
          <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            ダッシュボードを見る
          </Link>
          <Link href="/editor" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
            カードを作成する
          </Link>
          <Link href="/study" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            学習を始める
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">間隔反復学習</h2>
            <p className="text-gray-600">エビングハウスの忘却曲線に基づいたLeitnerボックスシステムで効率的に記憶を定着させます。</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Markdown+HTML対応</h2>
            <p className="text-gray-600">カードの内容をリッチテキストで編集でき、画像や表などの複雑なコンテンツも表示できます。</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">CSVインポート/エクスポート</h2>
            <p className="text-gray-600">既存のデータをCSV形式でインポート・エクスポートでき、他のツールとの連携も簡単です。</p>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">使い方</h2>
          <div className="max-w-3xl mx-auto text-left">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li><strong>カードデッキを作成：</strong> エディタページでカードデッキを作成するか、CSVからインポートします。</li>
              <li><strong>カードを追加：</strong> 表面と裏面の内容を入力し、必要に応じて追加のセクションを設定します。</li>
              <li><strong>学習を開始：</strong> 学習モードでカードを表示し、理解度に応じて「よくわかる」「微妙」「覚え直し」で評価します。</li>
              <li><strong>進捗を確認：</strong> ダッシュボードで学習の進捗状況をグラフで確認できます。</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
