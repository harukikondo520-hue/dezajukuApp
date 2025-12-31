import { useState } from 'react';
import { LogOut, Edit2, Check, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedAge, setEditedAge] = useState<string>('');
  const [editedOccupation, setEditedOccupation] = useState('');
  const [editedGender, setEditedGender] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="font-bold text-slate-900">プロフィール</h1>
          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="ログアウト"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* プロフィール画像と名前 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-500 shadow-lg">
              <img 
                src="/dezajuku_icon_0531_1-05 copy.png" 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-center w-full">
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
                  <h1 className="text-2xl font-bold text-slate-900">
                    {profile?.name || '名前未設定'}
                  </h1>
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

        {/* 基本情報 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">基本情報</h2>
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  性別
                </label>
                <select
                  value={editedGender}
                  onChange={(e) => setEditedGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                  <option value="prefer_not_to_say">回答しない</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelProfileEdit}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">年齢</span>
                <span className="text-sm font-medium text-slate-900">
                  {profile?.age ? `${profile.age}歳` : '未設定'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">職業</span>
                <span className="text-sm font-medium text-slate-900">
                  {profile?.occupation || '未設定'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
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

        {/* フッタースペース */}
        <div className="h-8" />
      </div>
    </div>
  );
}
