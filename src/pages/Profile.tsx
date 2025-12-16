import { useState, useEffect } from 'react';
import { Award, LogOut, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { Database } from '../types/database';

type UserBadge = Database['public']['Tables']['user_badges']['Row'];

const AVAILABLE_ICONS = [
  { id: 'default', emoji: '👤', type: 'emoji' },
  { id: 'dezajuku_red', type: 'image', src: '/dezahuku_red_1.png' },
  { id: 'dezajuku_icon', type: 'image', src: '/dezajuku_icon_0531_1-05.png' },
  { id: 'designer', emoji: '🎨', type: 'emoji' },
  { id: 'developer', emoji: '💻', type: 'emoji' },
  { id: 'star', emoji: '⭐', type: 'emoji' },
  { id: 'rocket', emoji: '🚀', type: 'emoji' },
  { id: 'lightning', emoji: '⚡', type: 'emoji' },
];

const BADGE_INFO = {
  first_project: { name: '0→1講義', description: '初めての講義を完了しました', image: '/0→1カリキュラム修了済.png', studentOnly: true },
  complete_all: { name: '1→10講義', description: '全講義を完了しました', image: '/1→10カリキュラム修了済.png', studentOnly: true },
  sales: { name: '営業バッヂ', description: '営業活動を達成しました', image: '/dezajuku_badge_営業 copy.png' },
  meetup: { name: 'オフ会参加', description: 'オフ会に参加しました', image: '/dezajuku_badge_オフ会_01.png' },
  camp: { name: '合宿参加', description: '合宿に参加しました', image: '/dezajuku_badge_合宿_01.png' },
  maximize: { name: '成果最大化', description: '成果を最大化しました', image: '/dezajuku_badge成果最大化.png' },
};

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    icon: profile?.icon || 'default',
    bio: profile?.bio || '',
  });
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        icon: profile.icon,
        bio: profile.bio,
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          icon: formData.icon,
          bio: formData.bio,
        })
        .eq('id', user!.id);

      if (error) throw error;
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const selectedIcon = AVAILABLE_ICONS.find((i) => i.id === formData.icon);
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
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-4xl overflow-hidden">
            {selectedIcon?.type === 'image' ? (
              <img src={selectedIcon.src} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              selectedIcon?.emoji
            )}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
              >
                編集
              </button>
              <button
                onClick={handleSignOut}
                className="px-5 py-2 bg-slate-600 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2"
              >
                <LogOut size={16} />
                ログアウト
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">名前（ローマ字）</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="TARO YAMADA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">アイコン</label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.id })}
                    className={`p-3 rounded-xl border-2 transition ${
                      formData.icon === icon.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {icon.type === 'image' ? (
                      <img src={icon.src} alt={icon.id} className="w-full h-12 object-contain" />
                    ) : (
                      <div className="text-3xl">{icon.emoji}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">自己紹介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="自己紹介を入力してください"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                保存
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t pt-4">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {profile?.bio || '自己紹介がまだ設定されていません'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="text-red-600" size={28} />
            バッジコレクション
          </h2>
          <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            {badges.length} / {Object.keys(BADGE_INFO).length} 獲得
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(BADGE_INFO).map(([badgeId, info]) => {
            const acquired = hasBadge(badgeId);
            const isLocked = info.studentOnly && profile?.role !== 'student';
            const badge = badges.find(b => b.badge_id === badgeId);

            return (
              <div
                key={badgeId}
                className={`relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  acquired
                    ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-amber-300 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : isLocked
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {acquired && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-amber-200/20 animate-pulse" />
                  </div>
                )}
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 transition-all duration-300 ${
                  acquired ? 'scale-100' : 'scale-95'
                }`}>
                  {isLocked ? (
                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-3xl">
                      🔒
                    </div>
                  ) : (
                    <>
                      <img
                        src={info.image}
                        alt={info.name}
                        className={`w-full h-full object-contain transition-all duration-300 ${
                          !acquired ? 'grayscale brightness-75' : 'drop-shadow-lg'
                        }`}
                      />
                      {acquired && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="text-center space-y-1 relative z-10">
                  <div className={`font-bold text-sm ${acquired ? 'text-amber-900' : 'text-slate-700'}`}>
                    {info.name}
                  </div>
                  <div className={`text-xs ${acquired ? 'text-amber-700' : 'text-slate-500'}`}>
                    {info.description}
                  </div>
                  {acquired && badge && (
                    <div className="text-xs text-amber-600 font-medium mt-2">
                      {new Date(badge.acquired_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </div>
                  )}
                  {isLocked && (
                    <div className="text-xs text-slate-500 mt-1">スクール生徒限定</div>
                  )}
                  {!acquired && !isLocked && (
                    <div className="text-xs text-slate-400 mt-1">未獲得</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
