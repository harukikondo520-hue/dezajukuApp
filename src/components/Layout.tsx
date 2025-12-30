import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/chat', label: 'AI', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* メインコンテンツ */}
      <main className="animate-fadeIn">
        {children}
      </main>

      {/* ボトムナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
