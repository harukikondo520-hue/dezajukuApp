import { useState, useEffect } from 'react';
import { LogOut, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { Database } from '../types/database';

type UserBadge = Database['public']['Tables']['user_badges']['Row'];

const BADGE_INFO = {
  first_project: { name: '0→1講義', image: '/0→1カリキュラム修了済.png', tempAcquired: true },
  complete_all: { name: '1→10講義', image: '/1→10カリキュラム修了済.png', tempAcquired: true },
  sales: { name: '営業バッヂ', image: '/dezajuku_badge_営業 copy.png' },
  meetup: { name: 'オフ会参加', image: '/dezajuku_badge_オフ会_01.png' },
  camp: { name: '合宿参加', image: '/dezajuku_badge_合宿_01.png' },
  maximize: { name: '成果最大化', image: '/dezajuku_badge成果最大化.png' },
};

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      loadBadges();
      loadUnreadCount();
    }
  }, [profile]);

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user!.id)
        .order('acquired_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id')
        .lte('published_at', new Date().toISOString());

      if (announcementsError) throw announcementsError;

      const { data: reads, error: readsError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user!.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads.map((r) => r.announcement_id));
      const unread = announcements.filter((a) => !readIds.has(a.id));
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasBadge = (badgeId: string) => badges.some((b) => b.badge_id === badgeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-end mb-6">
        <Link
          to="/announcements"
          className="relative p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="お知らせ"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 shadow-lg">
            <img src="/dezajuku_icon_0531_1-05 copy.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSignOut}
              className="px-5 py-2 bg-slate-600 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2"
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">バッヂ一覧</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {Object.entries(BADGE_INFO).map(([badgeId, info]) => {
            const acquired = info.tempAcquired || hasBadge(badgeId);

            return (
              <div
                key={badgeId}
                className="flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-105"
              >
                <div className="relative w-32 h-32">
                  <img
                    src={info.image}
                    alt={info.name}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      !acquired ? 'grayscale opacity-30' : 'drop-shadow-lg'
                    }`}
                  />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${acquired ? 'text-slate-900' : 'text-slate-400'}`}>
                    {info.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
