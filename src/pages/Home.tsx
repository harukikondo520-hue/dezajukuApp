import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MyPageContent from '../components/home/MyPageContent';

export default function Home() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-red-500 shadow-lg shadow-red-500/20">
                <img src="/dezajuku_icon_0531_1-05 copy.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-0.5">おかえりなさい</p>
              <p className="text-xl font-bold text-slate-900">{profile?.name || 'ゲスト'}さん</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            title="ログアウト"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <MyPageContent />
    </div>
  );
}
