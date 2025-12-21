import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, PlayCircle, Target, LogOut, TrendingUp, Award, Calculator, Wallet, RefreshCw, Sparkles, Palette, Lightbulb, Handshake, Rocket, Star } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../types/database';
import { DiagnosisResult, DesignerType } from '../types/diagnosis';
import { designerTypes } from '../data/questions';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];

interface MonthlyData {
  month: string;
  amount: number;
}

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

export default function Home() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadProjects(),
      loadAllProjects(),
      loadMonthlyIncome(),
      loadTasks(),
      loadVideoProgress(),
      loadDiagnosis(),
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

  const loadAllProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setAllProjects(data || []);
    } catch (error) {
      console.error('Error loading all projects:', error);
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

  const thisMonthIncome = useMemo(() =>
    projects.reduce((sum, p) => sum + p.reward, 0),
    [projects]
  );

  const maxMonthlyIncome = useMemo(() =>
    Math.max(...monthlyIncomeData.map(d => d.amount), 0),
    [monthlyIncomeData]
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
      loadAllProjects();
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

  const chartMax = Math.max(...monthlyIncomeData.map(d => d.amount), 1);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-slate-200">
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
              <div className="absolute -right-10 -top-16 opacity-15 pointer-events-none">
                <div style={{ transform: 'scale(1.2)' }}>
                  {getDesignerTypeIcon(typeInfo.type)}
                </div>
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
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 text-center border border-slate-200">
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

      <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-red-500" />
          <h2 className="text-lg font-bold text-slate-900">月収推移</h2>
        </div>

        <div className="relative mb-4">
          <div className="h-40 sm:h-48">
            <svg className="w-full h-full" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 0.5, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={115 - ratio * 85}
                  x2="310"
                  y2={115 - ratio * 85}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? "0" : "4,4"}
                />
              ))}

              {monthlyIncomeData.length > 0 && (
                <>
                  <path
                    d={`M ${monthlyIncomeData.map((d, i) => {
                      const x = 30 + (i / (monthlyIncomeData.length - 1)) * 280;
                      const y = 115 - (d.amount / chartMax) * 85;
                      return `${x},${y}`;
                    }).join(' L ')} L ${310},115 L 30,115 Z`}
                    fill="url(#areaGradient)"
                  />

                  <path
                    d={`M ${monthlyIncomeData.map((d, i) => {
                      const x = 30 + (i / (monthlyIncomeData.length - 1)) * 280;
                      const y = 115 - (d.amount / chartMax) * 85;
                      return `${x},${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {monthlyIncomeData.map((d, i) => {
                    const x = 30 + (i / (monthlyIncomeData.length - 1)) * 280;
                    const y = 115 - (d.amount / chartMax) * 85;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="white" stroke="#ef4444" strokeWidth="2.5" />
                        {d.amount > 0 && (
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fill="#475569"
                            style={{ fontSize: '9px', fontWeight: 500 }}
                          >
                            {(d.amount / 10000).toFixed(0)}万
                          </text>
                        )}
                        <text
                          x={x}
                          y={130}
                          textAnchor="middle"
                          fill="#94a3b8"
                          style={{ fontSize: '9px' }}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-blue-500" />
              <span className="text-xs text-slate-500">今月月収</span>
            </div>
            <p className="text-lg font-bold text-slate-900">¥{thisMonthIncome.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className="text-amber-500" />
              <span className="text-xs text-slate-500">最高月収</span>
            </div>
            <p className="text-lg font-bold text-slate-900">¥{maxMonthlyIncome.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={16} className="text-green-500" />
              <span className="text-xs text-slate-500">平均月収</span>
            </div>
            <p className="text-lg font-bold text-slate-900">¥{avgMonthlyIncome.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-red-500" />
              <span className="text-xs text-slate-500">累計収益</span>
            </div>
            <p className="text-lg font-bold text-slate-900">¥{totalIncome.toLocaleString()}</p>
          </div>
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
            <div className="space-y-2 mb-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-3 border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-lg font-bold text-slate-700">¥{project.reward.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
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
