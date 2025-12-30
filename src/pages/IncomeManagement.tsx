import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Calendar, History, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentMonthProjects, useAllProjects, usePastProjects } from '../hooks/useUserProjects';
import { useMonthlyIncome, useThisMonthIncome, useTotalIncome } from '../hooks/useIncome';
import { useAddProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { ChartSkeleton, ProjectCardSkeleton } from '../components/Skeleton';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export default function IncomeManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // React Query フック
  const { data: projects = [], isLoading: projectsLoading } = useCurrentMonthProjects(user?.id);
  const { data: monthlyIncomeData = [], isLoading: monthlyIncomeLoading } = useMonthlyIncome(user?.id);
  const { data: thisMonthIncome = 0 } = useThisMonthIncome(user?.id);
  const { data: totalIncome = 0 } = useTotalIncome(user?.id);
  
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  const isLoading = projectsLoading || monthlyIncomeLoading;

  // 先月との比較
  const lastMonthIncome = monthlyIncomeData.length >= 2 ? monthlyIncomeData[monthlyIncomeData.length - 2]?.amount || 0 : 0;
  const incomeChange = thisMonthIncome - lastMonthIncome;
  const incomeChangePercent = lastMonthIncome > 0 ? Math.round((incomeChange / lastMonthIncome) * 100) : 0;

  // フィルタリング
  const filteredProjects = projects.filter(p => {
    if (filterTab === 'all') return true;
    return p.status === filterTab;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderDate = new Date(formData.date);
      orderDate.setHours(12, 0, 0, 0);
      
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          name: formData.name,
          reward: parseInt(formData.reward),
          status: editingProject.status || 'in_progress',
          completed_at: orderDate.toISOString(),
        });
      } else {
        await addProject.mutateAsync({
          name: formData.name,
          reward: parseInt(formData.reward),
          status: 'in_progress',
          completed_at: orderDate.toISOString(),
        });
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', reward: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateProject.mutateAsync({ id, status: 'completed' });
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか？データから完全に削除されます。')) return;

    try {
      await deleteProject.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
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

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({ name: '', reward: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <ChartSkeleton />
        <div className="mt-6">
          <ProjectCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">収入管理</span>
          </button>
          <button
            onClick={openNewModal}
            className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* 今月の収入カード */}
        <div className="bg-white rounded-3xl p-8 mb-6 border border-slate-200 shadow-lg">
          <p className="text-sm text-slate-500 font-semibold mb-2">今月の収入</p>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-5xl font-black text-slate-900 number-display">
              ¥{thisMonthIncome.toLocaleString()}
            </h2>
            {incomeChange !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${incomeChange > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {incomeChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm font-bold">
                  {incomeChange > 0 ? '+' : ''}{incomeChangePercent}%
                </span>
              </div>
            )}
          </div>

          {/* 簡易グラフ（6ヶ月） */}
          <div className="h-32 flex items-end gap-2 mt-6">
            {monthlyIncomeData.slice(-6).map((data, index) => {
              const maxIncome = Math.max(...monthlyIncomeData.slice(-6).map(d => d.amount));
              const heightPercent = maxIncome > 0 ? (data.amount / maxIncome) * 100 : 0;
              const month = new Date(data.month + '-01').toLocaleDateString('ja-JP', { month: 'short' });
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                      style={{ height: `${heightPercent}%`, minHeight: data.amount > 0 ? '8px' : '0px' }}
                      title={`¥${data.amount.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1">累計収益</p>
              <p className="text-xl font-black text-slate-900 number-display">
                ¥{totalIncome.toLocaleString()}
              </p>
            </div>
            {lastMonthIncome > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold mb-1">先月比</p>
                <p className={`text-xl font-black number-display ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeChange > 0 ? '+' : ''}¥{Math.abs(incomeChange).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 案件一覧 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4">案件一覧</h3>

          {/* フィルタータブ */}
          <div className="flex gap-2 mb-4 border-b border-slate-200">
            {[
              { key: 'all', label: '全て' },
              { key: 'in_progress', label: '進行中' },
              { key: 'completed', label: '完了' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as typeof filterTab)}
                className={`px-4 py-2 font-semibold text-sm transition-all duration-300 border-b-2 ${
                  filterTab === tab.key
                    ? 'text-red-600 border-red-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 案件カード */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <History size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">案件がありません</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">{project.name}</h4>
                      <p className="text-2xl font-black text-slate-700 number-display">
                        ¥{project.reward.toLocaleString()}
                      </p>
                      {project.completed_at && (
                        <p className="text-xs text-slate-500 mt-1">
                          <Calendar size={12} className="inline mr-1" />
                          {new Date(project.completed_at).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {project.status === 'in_progress' && (
                    <button
                      onClick={() => handleComplete(project.id)}
                      className="w-full py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      完了にする
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 案件追加/編集モーダル */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingProject ? '案件を編集' : '案件を追加'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  案件名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 number-display"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg"
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

