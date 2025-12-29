import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/chat', label: 'AI', icon: MessageCircle },
    { path: '/profile', label: 'プロフィール', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* モバイル用ボトムナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="grid grid-cols-3 gap-0">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isCenterTab = index === 1; // AIタブが中央
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 py-3 font-medium transition-all duration-300 relative ${
                  isActive
                    ? isCenterTab
                      ? 'text-red-600'
                      : 'text-red-600'
                    : 'text-slate-500'
                }`}
              >
                {/* アクティブインジケーター（上部バー） */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-red-600 rounded-b-full" />
                )}
                
                {/* AIタブは特別扱い（少し大きく） */}
                <div className={`transition-transform duration-300 ${isCenterTab && isActive ? 'scale-110' : ''}`}>
                  <Icon size={isCenterTab ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* デスクトップ用サイドナビゲーション */}
      <div className="hidden md:block fixed left-8 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-lg border border-slate-200 z-50">
        <div className="flex flex-col gap-2 p-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isCenterTab = index === 1;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                  isActive
                    ? 'bg-red-50 text-red-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {/* アクティブインジケーター（左バー） */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full" />
                )}
                
                <Icon size={isCenterTab ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-sm ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 md:pl-48">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
