import { useState, useEffect, useRef } from 'react';
import { LogOut, Bell, Edit2, Check, X, RefreshCw, Sparkles } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DiagnosisResult } from '../types/diagnosis';
import { designerTypes } from '../data/questions';
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

const BANNERS = [
  { id: 1, image: '/newyears.jpg', alt: 'New Years Party 2025' },
  { id: 2, image: '/kaori.jpg', alt: 'Special Event' },
];

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const banners = container.children;
      if (banners[currentBanner]) {
        const banner = banners[currentBanner] as HTMLElement;
        const containerPadding = parseInt(getComputedStyle(container).paddingLeft) || 0;
        container.scrollTo({
          left: banner.offsetLeft - containerPadding,
          behavior: 'smooth',
        });
      }
    }
  }, [currentBanner]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadBadges(),
        loadUnreadCount(),
        loadDiagnosis(),
      ]);
    } catch (error) {
      console.error('データの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagnosis = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_diagnosis')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data && !error) {
        setDiagnosis(data);
      }
    } catch (error) {
      console.error('診断データの取得に失敗:', error);
    }
  };

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
      console.error('バッジデータの取得に失敗:', error);
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
      console.error('未読数の取得に失敗:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleEditName = () => {
    setEditedName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user || !editedName.trim()) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editedName.toUpperCase() })
        .eq('id', user.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error('名前の更新に失敗:', error);
      alert('名前の更新に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const hasBadge = (badgeId: string) => badges.some((b) => b.badge_id === badgeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  const typeInfo = diagnosis ? designerTypes[diagnosis.designer_type] : null;

  const chartData = diagnosis
    ? [
        { skill: '造形力', value: diagnosis.design_skill },
        { skill: '設計力', value: diagnosis.planning_skill },
        { skill: 'CW力', value: diagnosis.client_skill },
        { skill: 'ビジネス力', value: diagnosis.business_skill },
        { skill: 'マインド力', value: diagnosis.mindset_skill },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-end mb-2">
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

      <div className="bg-white rounded-2xl shadow-sm pt-4 px-6 pb-6 mb-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 shadow-lg">
            <img src="/dezajuku_icon_0531_1-05 copy.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-center w-full max-w-sm">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value.toUpperCase())}
                  placeholder="TARO YAMADA"
                  className="text-xl font-bold text-slate-900 border-2 border-red-500 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  title="保存"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition"
                  title="キャンセル"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.name || '名前未設定'}</h1>
                <button
                  onClick={handleEditName}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="名前を編集"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
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

      {typeInfo ? (
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-sm p-6 md:p-8 mb-4 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-red-500" size={24} />
              デザイナータイプ
            </h2>
            <button
              onClick={() => navigate('/diagnosis')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              title="再診断する"
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-2xl text-white relative overflow-hidden"
              style={{ backgroundColor: typeInfo.color }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-10 -mb-10" />
              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium mb-2 backdrop-blur-sm">
                  あなたのタイプ
                </div>
                <h3 className="text-3xl font-black mb-2 tracking-wide">
                  {typeInfo.name}
                </h3>
                <p className="text-white text-opacity-90 text-sm leading-relaxed">
                  {typeInfo.description}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-3 text-sm">スキルバランス</h3>
              <div className="h-56 flex items-center justify-center bg-white rounded-xl border border-slate-200 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <Radar
                      dataKey="value"
                      stroke={typeInfo.color}
                      fill={typeInfo.color}
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Sparkles className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            まだ診断を受けていません
          </h3>
          <p className="text-slate-600 mb-6">
            あなたのデザイナータイプを知るために、スキル診断を受けてみましょう
          </p>
          <button
            onClick={() => navigate('/diagnosis')}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all"
          >
            診断を受ける
          </button>
        </div>
      )}

      <div className="mb-4 -mx-4 sm:mx-0">
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-0"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {BANNERS.map((banner) => (
              <div
                key={banner.id}
                className="flex-shrink-0 w-[82%] sm:w-[85%] snap-start"
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-48 object-cover rounded-2xl shadow-sm"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition ${
                  currentBanner === index ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
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
