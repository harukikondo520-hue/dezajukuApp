import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, TrendingUp, PlayCircle, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];

interface MonthlyData {
  month: string;
  amount: number;
}

export default function Home() {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    status: 'in_progress' as 'in_progress' | 'completed' | 'paid',
  });
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [videoProgress, setVideoProgress] = useState({ completed: 0, total: 0 });

  const currentMonth = new Date().toLocaleDateString('ja-JP', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadProjects(),
      loadMonthlyIncome(),
      loadTasks(),
      loadVideoProgress(),
    ]);
    setLoading(false);
  };

  const loadProjects = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadMonthlyIncome = async () => {
    try {
      const months: MonthlyData[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('ja-JP', { month: 'short' });

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data } = await supabase
          .from('projects')
          .select('reward')
          .eq('user_id', user!.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        const total = data?.reduce((sum, p) => sum + p.reward, 0) || 0;
        months.push({ month: monthLabel, amount: total });
      }

      setMonthlyIncomeData(months);
    } catch (error) {
      console.error('Error loading monthly income:', error);
    }
  };

  const loadTasks = async () => {
    if (!profile?.roadmap_id) return;

    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('roadmap_id', profile.roadmap_id)
        .order('order_index', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      const { data: userTasksData, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user!.id);

      if (userTasksError) throw userTasksError;
      setUserTasks(userTasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadVideoProgress = async () => {
    try {
      const { data: videos } = await supabase
        .from('videos')
        .select('id');

      const { data: progress } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('completed', true);

      setVideoProgress({
        total: videos?.length || 0,
        completed: progress?.length || 0,
      });
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  };

  const totalIncome = useMemo(() =>
    projects.reduce((sum, p) => sum + p.reward, 0),
    [projects]
  );

  const progressPercent = useMemo(() => {
    if (videoProgress.total === 0) return 0;
    return Math.round((videoProgress.completed / videoProgress.total) * 100);
  }, [videoProgress]);

  const currentTask = useMemo(() => {
    const completedTaskIds = new Set(userTasks.filter(ut => ut.completed).map(ut => ut.task_id));
    return tasks.find(t => !completedTaskIds.has(t.id));
  }, [tasks, userTasks]);

  const nextTask = useMemo(() => {
    if (!currentTask) return null;
    const currentIndex = tasks.findIndex(t => t.id === currentTask.id);
    return tasks[currentIndex + 1] || null;
  }, [tasks, currentTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            reward: parseInt(formData.reward),
            status: formData.status,
            completed_at: formData.status !== 'in_progress' ? new Date().toISOString() : null,
          })
          .eq('id', editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert({
          user_id: user!.id,
          name: formData.name,
          reward: parseInt(formData.reward),
          status: formData.status,
          completed_at: formData.status !== 'in_progress' ? new Date().toISOString() : null,
        });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', reward: '', status: 'in_progress' });
      loadProjects();
      loadMonthlyIncome();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか?')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      loadProjects();
      loadMonthlyIncome();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'in_progress' | 'completed' | 'paid') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: newStatus,
          completed_at: newStatus !== 'in_progress' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const existingTask = userTasks.find(ut => ut.task_id === taskId);

      if (existingTask) {
        await supabase
          .from('user_tasks')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingTask.id);
      } else {
        await supabase
          .from('user_tasks')
          .insert({
            user_id: user!.id,
            task_id: taskId,
            completed: true,
            completed_at: new Date().toISOString(),
          });
      }

      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      reward: project.reward.toString(),
      status: project.status || 'in_progress',
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({ name: '', reward: '', status: 'in_progress' });
    setShowModal(true);
  };

  const statusLabels = {
    in_progress: '進行中',
    completed: '完了',
    paid: '入金済み',
  };

  const statusColors = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
  };

  const maxIncome = Math.max(...monthlyIncomeData.map(d => d.amount), 1);

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
        <p className="text-sm text-slate-700">ようこそ、{profile?.name}さん</p>
      </div>

      <div className="mb-0 -mx-4">
        <img src="/bg.png" alt="デザジュク" className="w-full" />
      </div>

      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-6 mb-8 -mt-12 text-white overflow-hidden min-h-[240px]" style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>

        <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
          <div className="flex items-start justify-between">
            <img src="/logox4.png" alt="デザジュク" className="h-5 brightness-0 invert opacity-90" />
            <div className="text-xs uppercase tracking-widest text-white/70 font-medium">{currentMonth}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 font-medium mb-2">Total Income</div>
            <div className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'DIN Next', 'DIN', system-ui, sans-serif" }}>
              ¥{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>
        <img src="/frame_24.png" alt="" className="absolute bottom-0 right-0 h-[80%] opacity-30" />
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">月収推移</h2>
        </div>
        <div className="flex items-end gap-2 h-32">
          {monthlyIncomeData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '100px' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(data.amount / maxIncome) * 100}%`, minHeight: data.amount > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs text-slate-500">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {videoProgress.total > 0 && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle size={20} className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">カリキュラム進捗</h2>
          </div>
          <div className="relative">
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-slate-500">{videoProgress.completed}/{videoProgress.total} 完了</span>
              <span className="text-sm font-bold text-red-600">{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {profile?.roadmap_id && (currentTask || nextTask) && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">ロードマップ</h2>
          </div>
          <div className="space-y-4">
            {currentTask && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-red-600 mb-1">現在のタスク</div>
                    <div className="font-medium text-slate-900">{currentTask.title}</div>
                    {currentTask.description && (
                      <div className="text-sm text-slate-500 mt-1">{currentTask.description}</div>
                    )}
                  </div>
                  {currentTask.task_type === 'action' && (
                    <button
                      onClick={() => handleTaskComplete(currentTask.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {nextTask && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500 mb-1">次のタスク</div>
                <div className="font-medium text-slate-700">{nextTask.title}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">今月の案件</h2>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <p className="text-slate-500 mb-4">まだ案件がありません</p>
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
            >
              <Plus size={20} />
              案件を追加
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-lg font-bold text-slate-700">¥{project.reward.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={project.status || 'in_progress'}
                        onChange={(e) => handleStatusChange(project.id, e.target.value as 'in_progress' | 'completed' | 'paid')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[project.status || 'in_progress']}`}
                      >
                        <option value="in_progress">進行中</option>
                        <option value="completed">完了</option>
                        <option value="paid">入金済み</option>
                      </select>
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={openNewModal}
              className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              案件を追加
            </button>
          </>
        )}
      </div>

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
                  金額（円）
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
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'in_progress' | 'completed' | 'paid' })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                  <option value="paid">入金済み</option>
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
