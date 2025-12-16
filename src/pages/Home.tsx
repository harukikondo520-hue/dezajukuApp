import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export default function Home() {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    category: 'other' as 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other',
  });

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data: incompleteData, error: incompleteError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .is('completed_at', null)
        .order('created_at', { ascending: true });

      if (incompleteError) throw incompleteError;
      setProjects(incompleteData || []);

      const { data: completedData, error: completedError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (completedError) throw completedError;
      setCompletedProjects(completedData || []);

      const { data: allData, error: allError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (allError) throw allError;
      setAllProjects(allData || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = allProjects.reduce((sum, p) => sum + p.reward, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            reward: parseInt(formData.reward),
            category: formData.category,
          })
          .eq('id', editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert({
          user_id: user!.id,
          name: formData.name,
          reward: parseInt(formData.reward),
          category: formData.category,
        });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', reward: '', category: 'other' });
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか？')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('この案件を完了しますか？')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      reward: project.reward.toString(),
      category: project.category,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({ name: '', reward: '', category: 'other' });
    setShowModal(true);
  };

  const categoryLabels = {
    thumbnail: 'サムネイル',
    slide: 'スライド資料',
    hp: 'HP',
    lp: 'LP',
    banner: 'バナー',
    logo: 'ロゴ',
    flyer: 'チラシ',
    other: 'その他',
  };

  const categoryColors = {
    thumbnail: 'bg-purple-100 text-purple-800',
    slide: 'bg-blue-100 text-blue-800',
    hp: 'bg-green-100 text-green-800',
    lp: 'bg-pink-100 text-pink-800',
    banner: 'bg-yellow-100 text-yellow-800',
    logo: 'bg-red-100 text-red-800',
    flyer: 'bg-orange-100 text-orange-800',
    other: 'bg-slate-100 text-slate-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-0 mt-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-5xl font-bold text-slate-900">Hello,</h1>
          <img src="/logox4.png" alt="デザジュク" className="h-9" />
        </div>
        <p className="text-2xl text-slate-700">ようこそ、{profile?.name}さん</p>
      </div>

      <div className="mb-0 -mx-4 sm:mx-0">
        <img
          src="/bg.png"
          alt="デザジュク"
          className="w-full sm:rounded-2xl"
        />
      </div>

      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-6 mb-8 -mt-12 text-white overflow-hidden aspect-[1.586/1]" style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        transform: 'translateZ(0)',
      }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <img src="/logox4.png" alt="デザジュク" className="h-5 brightness-0 invert opacity-90" />
            <div className="text-xs uppercase tracking-widest text-white/70 font-medium">{currentMonth}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 font-medium mb-2">Total Income</div>
            <div className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'DIN Next', 'DIN', system-ui, -apple-system, sans-serif" }}>
              ¥{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>
        <img
          src="/frame_24.png"
          alt="デザジュク"
          className="absolute bottom-0 right-0 h-[80%] opacity-30"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">今月の案件一覧</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {projects.length === 0 ? (
            <>
              <div className="flex-shrink-0 w-64 bg-gradient-to-br from-[#04C8E2] to-[#0398b3] rounded-2xl p-5 text-white">
                <div className="mb-2 text-xs font-medium">プロジェクト</div>
                <div className="text-lg font-bold mb-3">株式会社◯◯ホワイトペーパー制作</div>
                <div className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs font-medium">
                  スライド資料
                </div>
              </div>
              <div className="flex-shrink-0 w-64 bg-gradient-to-br from-[#04C8E2] to-[#0398b3] rounded-2xl p-5 text-white">
                <div className="mb-2 text-xs font-medium">プロジェクト</div>
                <div className="text-lg font-bold mb-3">株式会社◯◯ホワイトペーパー制作</div>
                <div className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs font-medium">
                  スライド資料
                </div>
              </div>
            </>
          ) : (
            projects.map((project, index) => {
              const colors = [
                'bg-gradient-to-br from-[#E075EB] to-[#E54560]', // ピンク→レッド（濃）
                'bg-gradient-to-br from-[#3B9AEE] to-[#00D8EE]', // ブルー→シアン（濃）
                'bg-gradient-to-br from-[#32D76B] to-[#28E9C7]', // グリーン→ティール（濃）
                'bg-gradient-to-br from-[#EA608A] to-[#EED130]', // ピンク→イエロー（濃）
              ];
              const colorClass = colors[index % 4];
              const hoverClass = 'hover:bg-white/20';
              const badgeClass = 'bg-white/30';

              return (
              <div
                key={project.id}
                className={`flex-shrink-0 w-64 ${colorClass} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs font-medium opacity-90">プロジェクト</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className={`p-1 ${hoverClass} rounded transition`}
                      title="編集"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={`p-1 ${hoverClass} rounded transition`}
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-lg font-bold mb-3 min-h-[3rem]">{project.name}</div>
                <div className="text-2xl font-bold mb-3">¥{project.reward.toLocaleString()}</div>
                <div className="flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 ${badgeClass} rounded-full text-xs font-medium`}>
                    {categoryLabels[project.category]}
                  </span>
                  <button
                    onClick={() => handleComplete(project.id)}
                    className={`p-2 ${hoverClass} rounded-lg transition`}
                    title="完了"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>

        <button
          onClick={openNewModal}
          className="w-full py-4 bg-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-300 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          案件を追加
        </button>
      </div>

      {completedProjects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">納品済み</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
            {completedProjects.map((project, index) => {
              const colors = [
                'bg-gradient-to-br from-[#E075EB] to-[#E54560]', // ピンク→レッド（濃）
                'bg-gradient-to-br from-[#3B9AEE] to-[#00D8EE]', // ブルー→シアン（濃）
                'bg-gradient-to-br from-[#32D76B] to-[#28E9C7]', // グリーン→ティール（濃）
                'bg-gradient-to-br from-[#EA608A] to-[#EED130]', // ピンク→イエロー（濃）
              ];
              const colorClass = colors[index % 4];
              const hoverClass = 'hover:bg-white/20';
              const badgeClass = 'bg-white/30';

              return (
                <div
                  key={project.id}
                  className={`flex-shrink-0 w-64 ${colorClass} rounded-2xl p-5 text-white shadow-md opacity-80`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-medium opacity-90">納品済み</div>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={`p-1 ${hoverClass} rounded transition`}
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-lg font-bold mb-3 min-h-[3rem]">{project.name}</div>
                  <div className="text-2xl font-bold mb-3">¥{project.reward.toLocaleString()}</div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 ${badgeClass} rounded-full text-xs font-medium`}>
                      {categoryLabels[project.category]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingProject ? '案件を編集' : '案件を追加'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  案件名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="例: LP制作"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  報酬額（円）
                </label>
                <input
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other',
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="thumbnail">サムネイル</option>
                  <option value="slide">スライド資料</option>
                  <option value="hp">HP</option>
                  <option value="lp">LP</option>
                  <option value="banner">バナー</option>
                  <option value="logo">ロゴ</option>
                  <option value="flyer">チラシ</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  {editingProject ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
