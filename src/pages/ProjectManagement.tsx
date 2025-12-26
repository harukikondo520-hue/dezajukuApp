import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAddProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export default function ProjectManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .neq('status', 'completed')
        .gte('completed_at', startOfMonth)
        .lte('completed_at', endOfMonth)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      reward: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      reward: project.reward.toString(),
      date: project.completed_at ? new Date(project.completed_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        name: formData.name,
        reward: parseInt(formData.reward),
        completed_at: new Date(formData.date).toISOString(),
        status: 'in_progress' as const,
      };

      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          ...projectData,
        });
      } else {
        await addProject.mutateAsync(projectData);
      }

      setShowModal(false);
      setEditingProject(null);
      await loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleComplete = async (projectId: string) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        status: 'completed',
      });
      await loadProjects();
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('この案件を削除してもよろしいですか？\n月収データからも完全に削除されます。')) {
      return;
    }

    try {
      await deleteProject.mutateAsync(projectId);
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const displayedProjects = showAllProjects ? projects : projects.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          ホームに戻る
        </button>
        <h1 className="text-3xl font-bold text-slate-900">案件管理</h1>
        <p className="text-slate-600 mt-2">案件を追加・編集すると、月収推移グラフに自動で反映されます</p>
      </div>

      {/* 案件リスト */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50">
            <p className="text-slate-500 mb-4 font-medium">今月受注した案件がありません</p>
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl shadow-red-500/30"
            >
              <Plus size={18} />
              案件を追加
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {displayedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-xl p-5 border border-slate-200/50 hover:border-slate-300/50 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group relative"
                >
                  {/* 右上の編集・削除ボタン */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="編集"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* メインコンテンツ */}
                  <div className="pr-16">
                    <div className="font-bold text-slate-900 text-lg mb-1">{project.name}</div>
                    <div className="text-2xl font-black text-slate-700 number-display mb-1">￥{project.reward.toLocaleString()}</div>
                    {project.completed_at && (
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        受注日: {new Date(project.completed_at).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>

                  {/* 右下の完了ボタン */}
                  <button
                    onClick={() => handleComplete(project.id)}
                    className="absolute bottom-4 right-4 px-5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-all duration-150 font-medium text-sm flex items-center gap-1.5 border border-slate-200/50 hover:border-slate-300/50 shadow-sm hover:shadow"
                    title="完了"
                  >
                    <CheckCircle size={16} strokeWidth={2.5} />
                    完了
                  </button>
                </div>
              ))}
            </div>

            {projects.length > 3 && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="w-full py-3.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center justify-center gap-2 mb-3 shadow-sm hover:shadow-md"
              >
                {showAllProjects ? (
                  <>
                    <ChevronUp size={18} />
                    折りたたむ
                  </>
                ) : (
                  <>
                    もっと見る（{projects.length - 3}件）
                    <ChevronDown size={18} />
                  </>
                )}
              </button>
            )}

            <button
              onClick={openNewModal}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-red-500/30"
            >
              <Plus size={20} />
              案件を追加
            </button>
          </>
        )}
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              {editingProject ? '案件を編集' : '案件を追加'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  案件名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-medium"
                  placeholder="例: LP制作"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  金額（円）
                </label>
                <input
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-semibold text-lg number-display"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  受注日
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-medium"
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl shadow-red-500/30"
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

