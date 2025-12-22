import { useState, useEffect } from 'react';
import { LogOut, Bell, Edit2, Check, X, RefreshCw, Sparkles, Palette, Lightbulb, Handshake, TrendingUp, Rocket, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DiagnosisResult, DesignerType } from '../types/diagnosis';
import { designerTypes } from '../data/questions';

const getDesignerTypeIcon = (type: DesignerType) => {
  const iconProps = { size: 120, strokeWidth: 1.5 };

  switch (type) {
    case 'artist':
      return <Palette {...iconProps} />;
    case 'strategist':
      return <Lightbulb {...iconProps} />;
    case 'partner':
      return <Handshake {...iconProps} />;
    case 'business_designer':
      return <TrendingUp {...iconProps} />;
    case 'growth':
      return <Rocket {...iconProps} />;
    case 'all_rounder':
      return <Star {...iconProps} />;
    default:
      return <Star {...iconProps} />;
  }
};

const getTypeGradient = (type: DesignerType) => {
  switch (type) {
    case 'artist':
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    case 'strategist':
      return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    case 'partner':
      return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    case 'business_designer':
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    case 'growth':
      return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    case 'all_rounder':
      return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    default:
      return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
  }
};

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [hasDiagnosis, setHasDiagnosis] = useState(false);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      await Promise.all([
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
        setHasDiagnosis(true);
      } else {
        setHasDiagnosis(false);
      }
    } catch (error) {
      console.error('診断データの取得に失敗:', error);
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

      {!hasDiagnosis && (
        <div className="mb-4">
          <button
            onClick={() => navigate('/diagnosis')}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            デザイナータイプ診断を受ける
          </button>
        </div>
      )}

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
              style={{
                background: getTypeGradient(typeInfo.type)
              }}
            >
              <div className="absolute right-[10px] top-[10px] opacity-15 pointer-events-none">
                {getDesignerTypeIcon(typeInfo.type)}
              </div>
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
              <div className="h-56 flex items-center justify-center bg-white p-2">
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
      ) : null}

    </div>
  );
}
