import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl font-bold text-indigo-600">
                      フラッシュカードアプリ
                    </Link>
                  </div>
                  <nav className="ml-6 flex space-x-8">
                    <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                      ダッシュボード
                    </Link>
                    <Link href="/editor" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                      カード編集
                    </Link>
                    <Link href="/study" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                      学習モード
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} フラッシュカードアプリ
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
