import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, LogOut, TrendingUp, RefreshCw, Sparkles, Target, CheckCircle, PlayCircle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../types/database';
import { DiagnosisResult } from '../types/diagnosis';
import { designerTypes } from '../data/questions';

type Project = Database['public']['Tables']['projects']['Row'];
type MonthlyIncome = Database['public']['Tables']['monthly_income']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];

const PROJECT_CATEGORIES = [
  { value: 'thumbnail', label: 'サムネイル' },
  { value: 'slide', label: 'スライド' },
  { value: 'hp', label: 'HP制作' },
  { value: 'lp', label: 'LP制作' },
  { value: 'banner', label: 'バナー' },
  { value: 'logo', label: 'ロゴ' },
  { value: 'flyer', label: 'チラシ' },
  { value: 'other', label: 'その他' },
];

export default function Home() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    reward: '',
    category: 'other' as const,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [videoProgress, setVideoProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadDiagnosis(),
      loadProjects(),
      loadMonthlyIncome(),
      loadTasks(),
      loadVideoProgress(),
    ]);
    setLoading(false);
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

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('案件データの取得に失敗:', error);
    }
  };

  const loadMonthlyIncome = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_income')
        .select('*')
        .eq('user_id', user!.id)
        .order('year_month', { ascending: true });

      if (error) throw error;
      setMonthlyIncome(data || []);
    } catch (error) {
      console.error('月収データの取得に失敗:', error);
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

  const handleAddProject = async () => {
    if (!user || !newProject.name || !newProject.reward) {
      alert('案件名と報酬を入力してください');
      return;
    }

    try {
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        name: newProject.name,
        reward: parseInt(newProject.reward),
        category: newProject.category,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setNewProject({ name: '', reward: '', category: 'other' });
      setShowProjectForm(false);
      await loadProjects();
      await updateMonthlyIncome();
    } catch (error) {
      console.error('案件の追加に失敗:', error);
      alert('案件の追加に失敗しました');
    }
  };

  const updateMonthlyIncome = async () => {
    if (!user) return;

    try {
      const { data: completedProjects, error: projectError } = await supabase
        .from('projects')
        .select('reward, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null);

      if (projectError) throw projectError;

      const incomeByMonth = completedProjects.reduce((acc: Record<string, number>, project) => {
        if (project.completed_at) {
          const date = new Date(project.completed_at);
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[yearMonth] = (acc[yearMonth] || 0) + project.reward;
        }
        return acc;
      }, {});

      for (const [yearMonth, totalAmount] of Object.entries(incomeByMonth)) {
        await supabase
          .from('monthly_income')
          .upsert(
            {
              user_id: user.id,
              year_month: yearMonth,
              total_amount: totalAmount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,year_month' }
          );
      }

      await loadMonthlyIncome();
    } catch (error) {
      console.error('月収の更新に失敗:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか?')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await loadProjects();
      await updateMonthlyIncome();
    } catch (error) {
      console.error('Error deleting project:', error);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currentTask = useMemo(() => {
    const completedTaskIds = new Set(userTasks.filter(ut => ut.completed).map(ut => ut.task_id));
    return tasks.find(t => !completedTaskIds.has(t.id));
  }, [tasks, userTasks]);

  const nextTask = useMemo(() => {
    if (!currentTask) return null;
    const currentIndex = tasks.findIndex(t => t.id === currentTask.id);
    return tasks[currentIndex + 1] || null;
  }, [tasks, currentTask]);

  const progressPercent = useMemo(() => {
    if (videoProgress.total === 0) return 0;
    return Math.round((videoProgress.completed / videoProgress.total) * 100);
  }, [videoProgress]);

  const totalIncome = projects
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.reward, 0);

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

  const incomeChartData = monthlyIncome.map((item) => ({
    month: item.year_month.substring(5),
    amount: item.total_amount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500">
            <img src="/dezajuku_icon_0531_1-05 copy.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-slate-500">おかえりなさい</p>
            <p className="font-bold text-slate-900">{profile?.name || 'ゲスト'}さん</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          title="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </div>

      {typeInfo ? (
        <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden mb-6 border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="absolute right-0 bottom-0 w-64 h-64 opacity-30">
            <img src="/mbti.png" alt="Designer" className="w-full h-full object-contain" />
          </div>

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-red-500" size={28} />
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

            <div className="relative z-10 mb-4">
              <div
                className="inline-block px-8 py-4 rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: typeInfo.color }}
              >
                <div className="text-sm font-medium opacity-90 mb-1">あなたのタイプ</div>
                <h3 className="text-4xl font-black tracking-wide">
                  {typeInfo.name}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed max-w-md relative z-10">
              {typeInfo.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6 text-center border border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
            <Sparkles className="text-slate-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            まだ診断を受けていません
          </h3>
          <p className="text-slate-600 mb-6">
            あなたのデザイナータイプを知るために、スキル診断を受けてみましょう
          </p>
          <button
            onClick={() => navigate('/diagnosis')}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all text-lg"
          >
            診断を受ける
          </button>
        </div>
      )}

      {diagnosis && (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">スキルバランス</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }}
                />
                <Radar
                  dataKey="value"
                  stroke={typeInfo?.color || '#ef4444'}
                  fill={typeInfo?.color || '#ef4444'}
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={24} />
            月収推移
          </h2>
          <div className="text-right">
            <div className="text-sm text-slate-600">累計収入</div>
            <div className="text-2xl font-bold text-slate-900">
              ¥{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {incomeChartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ value: '月', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ value: '円', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
            <p className="text-slate-500">まだ収入データがありません</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">案件管理</h2>
          <button
            onClick={() => setShowProjectForm(!showProjectForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium text-sm"
          >
            <Plus size={18} />
            案件追加
          </button>
        </div>

        {showProjectForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  案件名
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="例: サムネイルデザイン"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={newProject.category}
                    onChange={(e) =>
                      setNewProject({ ...newProject, category: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    報酬 (円)
                  </label>
                  <input
                    type="number"
                    value={newProject.reward}
                    onChange={(e) => setNewProject({ ...newProject, reward: e.target.value })}
                    placeholder="10000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.slice(0, 10).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{project.name}</div>
                  <div className="text-sm text-slate-600">
                    {PROJECT_CATEGORIES.find((c) => c.value === project.category)?.label ||
                      'その他'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      ¥{project.reward.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.completed_at
                        ? new Date(project.completed_at).toLocaleDateString('ja-JP')
                        : '進行中'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <p className="text-slate-500">まだ案件がありません</p>
          </div>
        )}
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
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
    </div>
  );
}
