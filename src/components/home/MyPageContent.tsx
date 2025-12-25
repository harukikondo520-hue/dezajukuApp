import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, PlayCircle, Target, TrendingUp, Calculator, Wallet, ChevronDown, ChevronUp, History, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAddProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjects';
import type { Database } from '../../types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];

interface MonthlyData {
  month: string;
  amount: number;
}

export default function MyPageContent() {
  const { profile, user } = useAuth();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [pastProjects, setPastProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyData[]>([]);
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
      loadProjects(),
      loadAllProjects(),
      loadPastProjects(),
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
        .neq('status', 'completed')
        .gte('completed_at', startOfMonth)
        .lte('completed_at', endOfMonth)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAllProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setAllProjects(data || []);
    } catch (error) {
      console.error('Error loading all projects:', error);
    }
  };

  const loadPastProjects = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // completed_atまたはcreated_atが今月より前の案件を取得
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .or(`completed_at.lt.${startOfMonth},and(completed_at.is.null,created_at.lt.${startOfMonth})`)
        .order('completed_at', { ascending: false, nullsLast: true });

      if (error) throw error;
      setPastProjects(data || []);
    } catch (error) {
      console.error('Error loading past projects:', error);
    }
  };

  const loadMonthlyIncome = async () => {
    try {
      const months: MonthlyData[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString('ja-JP', { month: 'short' });

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data } = await supabase
          .from('projects')
          .select('reward, completed_at')
          .eq('user_id', user!.id)
          .gte('completed_at', startOfMonth)
          .lte('completed_at', endOfMonth) as { data: { reward: number }[] | null };

        const total = data?.reduce((sum, p) => sum + (p.reward || 0), 0) || 0;
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

  const thisMonthIncome = useMemo(() =>
    projects.reduce((sum, p) => sum + p.reward, 0),
    [projects]
  );

  const avgMonthlyIncome = useMemo(() => {
    const nonZeroMonths = monthlyIncomeData.filter(d => d.amount > 0);
    if (nonZeroMonths.length === 0) return 0;
    return Math.round(nonZeroMonths.reduce((sum, d) => sum + d.amount, 0) / nonZeroMonths.length);
  }, [monthlyIncomeData]);

  const totalIncome = useMemo(() =>
    allProjects.reduce((sum, p) => sum + p.reward, 0),
    [allProjects]
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
      loadProjects();
      loadAllProjects();
      loadMonthlyIncome();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateProject.mutateAsync({
        id: id,
        status: 'completed',
      });
      loadProjects();
      loadAllProjects();
      loadMonthlyIncome();
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか？データから完全に削除されます。')) return;

    try {
      await deleteProject.mutateAsync(id);
      loadProjects();
      loadAllProjects();
      loadMonthlyIncome();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const existingTask = userTasks.find(ut => ut.task_id === taskId);

      if (existingTask) {
        const { error } = await (supabase as any)
          .from('user_tasks')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingTask.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('user_tasks')
          .insert({
            user_id: user!.id,
            task_id: taskId,
            completed: true,
            completed_at: new Date().toISOString(),
          });
        if (error) throw error;
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
      date: project.completed_at ? new Date(project.completed_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({ name: '', reward: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  // グラフの最大値を適切なスケールに調整
  const calculateChartMax = (maxValue: number) => {
    if (maxValue === 0) return 100000; // 最小表示は10万円
    
    const manValue = maxValue / 10000; // 万円単位に変換
    
    if (manValue <= 5) return 50000; // 5万円まで
    if (manValue <= 10) return 100000; // 10万円まで
    if (manValue <= 20) return 200000; // 20万円まで
    if (manValue <= 30) return 300000; // 30万円まで
    if (manValue <= 50) return 500000; // 50万円まで
    if (manValue <= 100) return 1000000; // 100万円まで
    
    // それ以上は50万円単位で切り上げ
    return Math.ceil(maxValue / 500000) * 500000;
  };
  
  const actualMax = Math.max(...monthlyIncomeData.map(d => d.amount), 0);
  const chartMax = calculateChartMax(actualMax);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 案件管理 - 横スクロール */}
      <div className="mb-6">
        <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          <div className="flex gap-3 min-w-min">
            {projects.length === 0 ? (
              /* 案件が0件の時：点線カード */
              <button
                onClick={openNewModal}
                className="w-56 h-32 flex-shrink-0 bg-transparent rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/50 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                <Plus size={32} className="text-slate-400" strokeWidth={2} />
              </button>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="w-56 flex-shrink-0 bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative"
                >
                  {/* 右上の編集・削除ボタン */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                      title="編集"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* メインコンテンツ */}
                  <div className="pr-12 mb-2">
                    <div className="font-bold text-slate-900 text-sm mb-1">{project.name}</div>
                    <div className="text-lg font-black text-slate-700 number-display mb-1">￥{project.reward.toLocaleString()}</div>
                    {project.completed_at && (
                      <div className="text-xs text-slate-500">
                        {new Date(project.completed_at).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>

                  {/* 完了ボタン */}
                  <button
                    onClick={() => handleComplete(project.id)}
                    className="w-full py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-all duration-150 font-medium text-xs flex items-center justify-center gap-1 border border-slate-200/50 hover:border-slate-300/50"
                    title="完了"
                  >
                    <CheckCircle size={14} strokeWidth={2.5} />
                    完了
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 案件追加ボタンと履歴ボタン */}
        <div className="flex gap-2">
          <button
            onClick={openNewModal}
            className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-slate-700 font-medium text-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            案件を追加
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="py-3 px-4 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all duration-150 flex items-center justify-center border border-slate-200 rounded-xl"
            title="案件履歴"
          >
            <History size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 月収推移グラフ */}
      <div className="bg-white rounded-3xl pt-4 pb-6 px-6 mb-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative">
          <div className="h-56 sm:h-64">
            <svg className="w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
                </filter>
              </defs>

              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    y1={145 - ratio * 115}
                    x2="310"
                    y2={145 - ratio * 115}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? "0" : "3,3"}
                  />
                  <text
                    x="32"
                    y={148 - ratio * 115}
                    textAnchor="end"
                    fill="#94a3b8"
                    style={{ fontSize: '8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    {Math.round((chartMax * ratio) / 10000)}万
                  </text>
                </g>
              ))}

              {monthlyIncomeData.length > 0 && (
                <>
                  <path
                    d={`M ${monthlyIncomeData.map((d, i) => {
                      const x = 40 + (i / (monthlyIncomeData.length - 1)) * 270;
                      const y = 145 - (d.amount / chartMax) * 115;
                      return `${x},${y}`;
                    }).join(' L ')} L ${310},145 L 40,145 Z`}
                    fill="url(#areaGradient)"
                  />

                  <path
                    d={`M ${monthlyIncomeData.map((d, i) => {
                      const x = 40 + (i / (monthlyIncomeData.length - 1)) * 270;
                      const y = 145 - (d.amount / chartMax) * 115;
                      return `${x},${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#shadow)"
                  />

                  {monthlyIncomeData.map((d, i) => {
                    const x = 40 + (i / (monthlyIncomeData.length - 1)) * 270;
                    const y = 145 - (d.amount / chartMax) * 115;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="white" stroke="#ef4444" strokeWidth="3" filter="url(#shadow)" />
                        <circle cx={x} cy={y} r="2.5" fill="#ef4444" />
                        <text
                          x={x}
                          y={165}
                          textAnchor="middle"
                          fill="#94a3b8"
                          style={{ fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                        >
                          {d.month}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 mb-4 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Wallet size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 tracking-wide">今月の月収</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 mb-2 number-display">
                    {thisMonthIncome === 0 ? (
                      <span className="text-slate-300 tracking-wider">---</span>
                    ) : (
                      `￥${thisMonthIncome.toLocaleString()}`
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    今月獲得した案件の合計金額
                  </p>
                </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-green-100 rounded-lg">
                  <Calculator size={14} className="text-green-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600">平均月収</span>
              </div>
              <p className="text-xl font-black text-slate-900 number-display">
                {avgMonthlyIncome === 0 ? (
                  <span className="text-slate-300 tracking-wider">---</span>
                ) : (
                  `￥${avgMonthlyIncome.toLocaleString()}`
                )}
              </p>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-red-100 rounded-lg">
                  <TrendingUp size={14} className="text-red-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600">累計収益</span>
              </div>
              <p className="text-xl font-black text-slate-900 number-display">
                {totalIncome === 0 ? (
                  <span className="text-slate-300 tracking-wider">---</span>
                ) : (
                  `￥${totalIncome.toLocaleString()}`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {videoProgress.total > 0 && (
        <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-sm">
              <PlayCircle size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">カリキュラム進捗</h2>
          </div>
          <div className="relative">
            <div className="h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 rounded-full transition-all duration-700 ease-out shadow-lg relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-sm font-semibold text-slate-600 number-display">{videoProgress.completed}/{videoProgress.total} 完了</span>
              <span className="text-sm font-black text-red-600 number-display">{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {profile?.roadmap_id && (currentTask || nextTask) && (
        <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm">
              <Target size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">ロードマップ</h2>
          </div>
          <div className="space-y-3">
            {currentTask && (
              <div className="relative p-5 bg-gradient-to-br from-red-50 to-orange-50/50 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-block px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg mb-2 shadow-sm">
                      現在のタスク
                    </div>
                    <div className="font-bold text-slate-900 text-lg mb-1">{currentTask.title}</div>
                    {currentTask.description && (
                      <div className="text-sm text-slate-600 mt-1 leading-relaxed">{currentTask.description}</div>
                    )}
                  </div>
                  {currentTask.task_type === 'action' && (
                    <button
                      onClick={() => handleTaskComplete(currentTask.id)}
                      className="p-3 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md ml-4"
                      title="完了する"
                    >
                      <CheckCircle size={22} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {nextTask && (
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300">
                <div className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg mb-2">
                  次のタスク
                </div>
                <div className="font-bold text-slate-800 text-base">{nextTask.title}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
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

      {/* 履歴モーダル */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">案件履歴</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {pastProjects.length === 0 ? (
              <div className="text-center py-12">
                <History size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">過去の案件はまだありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastProjects.map((project) => {
                  const projectDate = project.completed_at 
                    ? new Date(project.completed_at)
                    : project.created_at 
                    ? new Date(project.created_at)
                    : null;
                  
                  return (
                    <div
                      key={project.id}
                      className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-xl border border-slate-200/50 hover:border-slate-300/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 mb-1">{project.name}</div>
                          <div className="text-2xl font-black text-slate-700 number-display">
                            ￥{project.reward.toLocaleString()}
                          </div>
                          {projectDate && (
                            <div className="text-xs text-slate-500 mt-1">
                              {projectDate.getFullYear()}年{projectDate.getMonth() + 1}月
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (window.confirm(`「${project.name}」を完全に削除しますか？この操作は取り消せません。`)) {
                              await handleDelete(project.id);
                              await loadPastProjects();
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="削除"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
