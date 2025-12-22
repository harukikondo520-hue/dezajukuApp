import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TabSwitcher from '../components/home/TabSwitcher';
import MyPageContent from '../components/home/MyPageContent';
import CommunityContent from '../components/home/CommunityContent';

export default function Home() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mypage' | 'community'>('mypage');

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500">
            <img src="/dezajuku_icon_0531_1-05 copy.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-slate-500">おかえりなさい</p>
            <p className="font-bold text-slate-900">{profile?.name || 'ゲスト'}さん</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          title="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </div>

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'mypage' ? <MyPageContent /> : <CommunityContent />}
    </div>
  );
}
