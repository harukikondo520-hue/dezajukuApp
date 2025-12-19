import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, PlayCircle, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/chat', label: 'AIチャット', icon: MessageCircle },
    { path: '/videos', label: '動画講義', icon: PlayCircle },
    { path: '/profile', label: 'マイページ', icon: User },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="grid grid-cols-4 gap-0.5 p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl font-medium transition ${
                  isActive ? 'bg-red-50 text-red-600' : 'text-slate-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-slate-200 z-50">
        <div className="flex items-center gap-2 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-28">
        <div className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
