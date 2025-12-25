import { useState, useEffect } from 'react';
import { LogOut, Edit2, Check, X, RefreshCw, Sparkles, Palette, Lightbulb, Handshake, TrendingUp, Rocket, Star, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DiagnosisResult, DesignerType } from '../types/diagnosis';
import { designerTypes } from '../data/questions';
import { skillCategoryNames } from '../data/skillQuestions';

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
      return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
    default:
      return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
  }
};

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [hasDiagnosis, setHasDiagnosis] = useState(false);
  const [hasSkillDiagnosis, setHasSkillDiagnosis] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedAge, setEditedAge] = useState<string>('');
  const [editedOccupation, setEditedOccupation] = useState('');
  const [editedGender, setEditedGender] = useState('');

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  // ページがフォーカスされたときに再読み込み
  useEffect(() => {
    const handleFocus = () => {
      if (profile && !loading) {
        loadDiagnosis();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [profile, loading]);

  const loadData = async () => {
    try {
      await loadDiagnosis();
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

      console.log('診断データ読み込み:', data, error);

      if (data && !error) {
        setDiagnosis(data);
        setHasDiagnosis(!!data.designer_type);
        // スキル診断の判定: design_skillが存在すればスキル診断済みと判定
        const hasSkills = !!(
          data.design_skill !== null &&
          data.design_skill !== undefined
        );
        setHasSkillDiagnosis(hasSkills);
        console.log('スキル診断状態:', hasSkills, data.design_skill);
      } else {
        setHasDiagnosis(false);
        setHasSkillDiagnosis(false);
      }
    } catch (error) {
      console.error('診断データの取得に失敗:', error);
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
        .update({ name: editedName })
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

  const handleEditProfile = () => {
    setEditedAge(profile?.age?.toString() || '');
    setEditedOccupation(profile?.occupation || '');
    setEditedGender(profile?.gender || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          age: editedAge ? parseInt(editedAge) : null,
          occupation: editedOccupation || null,
          gender: editedGender || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error('プロフィールの更新に失敗:', error);
      alert('プロフィールの更新に失敗しました');
    }
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setEditedAge('');
    setEditedOccupation('');
    setEditedGender('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  const typeInfo = diagnosis ? designerTypes[diagnosis.designer_type] : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm pt-4 px-6 pb-6 mb-4 relative">
        {/* ログアウトボタン - 右上 */}
        <button
          onClick={handleSignOut}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="ログアウト"
        >
          <LogOut size={20} />
        </button>

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
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="ニックネーム"
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
        </div>
      </div>

      {/* プロフィール情報 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">プロフィール情報</h2>
          {!isEditingProfile && (
            <button
              onClick={handleEditProfile}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="編集"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                年齢
              </label>
              <input
                type="number"
                value={editedAge}
                onChange={(e) => setEditedAge(e.target.value)}
                placeholder="例：25"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                現在の職業
              </label>
              <input
                type="text"
                value={editedOccupation}
                onChange={(e) => setEditedOccupation(e.target.value)}
                placeholder="例：Webデザイナー"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                性別
              </label>
              <select
                value={editedGender}
                onChange={(e) => setEditedGender(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
                <option value="prefer_not_to_say">回答しない</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                保存
              </button>
              <button
                onClick={handleCancelProfileEdit}
                className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">年齢</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.age ? `${profile.age}歳` : '未設定'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">職業</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.occupation || '未設定'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">性別</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.gender === 'male' ? '男性' : 
                 profile?.gender === 'female' ? '女性' : 
                 profile?.gender === 'other' ? 'その他' :
                 profile?.gender === 'prefer_not_to_say' ? '回答しない' : '未設定'}
              </span>
            </div>
          </div>
        )}
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
        <>
          <div className="mb-8">
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
          </div>

          {/* スキル診断セクション */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={24} />
                スキル診断
              </h2>
              {hasSkillDiagnosis && (
                <button
                  onClick={() => navigate('/skill-diagnosis')}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  title="再診断する"
                >
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {hasSkillDiagnosis && diagnosis ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-4 text-center">
                    スキルマップ
                  </h3>
                  <div className="h-56 flex items-center justify-center p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { skill: skillCategoryNames.design, value: diagnosis.design_skill },
                        { skill: skillCategoryNames.planning, value: diagnosis.planning_skill },
                        { skill: skillCategoryNames.client, value: diagnosis.client_skill },
                        { skill: skillCategoryNames.business, value: diagnosis.business_skill },
                        { skill: skillCategoryNames.mindset, value: diagnosis.mindset_skill },
                      ]}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="skill"
                          tick={{ fontSize: 11, fill: '#475569' }}
                        />
                        <Radar
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="text-center py-8">
                  <BarChart3 size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium mb-4">
                    まだスキル診断を受けていません
                  </p>
                  <button
                    onClick={() => navigate('/skill-diagnosis')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    スキル診断を受ける
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

    </div>
  );
}
