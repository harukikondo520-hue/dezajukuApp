import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, PlayCircle, Target, TrendingUp, Calculator, Wallet, History, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAddProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjects';
import { useCurrentMonthProjects, useAllProjects, usePastProjects } from '../../hooks/useUserProjects';
import { useMonthlyIncome, useThisMonthIncome, useTotalIncome } from '../../hooks/useIncome';
import { useTasks, useUserTasks, useVideoProgress } from '../../hooks/useTasksAndProgress';
import { ProjectCardSkeleton, ChartSkeleton } from '../Skeleton';
import type { Database } from '../../types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export default function MyPageContent() {
  const { profile, user } = useAuth();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // React Query フック
  const { data: projects = [], isLoading: projectsLoading } = useCurrentMonthProjects(user?.id);
  const { data: allProjects = [], isLoading: allProjectsLoading } = useAllProjects(user?.id);
  const { data: pastProjects = [], isLoading: pastProjectsLoading } = usePastProjects(user?.id);
  const { data: monthlyIncomeData = [], isLoading: monthlyIncomeLoading } = useMonthlyIncome(user?.id);
  const { data: thisMonthIncome = 0, isLoading: thisMonthLoading } = useThisMonthIncome(user?.id);
  const { data: totalIncome = 0, isLoading: totalIncomeLoading } = useTotalIncome(user?.id);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: userTasks = [], isLoading: userTasksLoading } = useUserTasks(user?.id);
  const { data: videoProgress = { completed: 0, total: 0 }, isLoading: videoProgressLoading } = useVideoProgress(user?.id);

  // ローディング状態を統合
  const isLoading = projectsLoading || monthlyIncomeLoading || thisMonthLoading || totalIncomeLoading;

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reward: '',
    date: new Date().toISOString().split('T')[0],
  });


  // 平均月収を計算
  const avgMonthlyIncome = useMemo(() => {
    const nonZeroMonths = monthlyIncomeData.filter(d => d.amount > 0);
    if (nonZeroMonths.length === 0) return 0;
    return Math.round(nonZeroMonths.reduce((sum, d) => sum + d.amount, 0) / nonZeroMonths.length);
  }, [monthlyIncomeData]);

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

  const handleTaskComplete = async (taskId: string) => {
    try {
      const existingTask = userTasks.find(ut => ut.task_id === taskId);

      if (existingTask) {
        const { error } = await supabase
          .from('user_tasks')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_tasks')
          .insert({
            user_id: user!.id,
            task_id: taskId,
            completed: true,
            completed_at: new Date().toISOString(),
          });
        if (error) throw error;
      }

      // React Query will auto-refetch due to mutation
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

  // グラフ用の月ラベルを生成
  const monthlyDataWithLabels = useMemo(() => {
    return monthlyIncomeData.map(d => ({
      ...d,
      month: new Date(d.month + '-01').toLocaleDateString('ja-JP', { month: 'short' })
    }));
  }, [monthlyIncomeData]);

  // 初回ローディング時のみスケルトン表示
  if (isLoading) {
    return (
      <div>
        {/* プロジェクトカードスケルトン */}
        <div className="mb-6">
          <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            <div className="flex gap-3 min-w-min">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          </div>
        </div>

        {/* グラフスケルトン */}
        <ChartSkeleton />
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
      <div className="bg-white rounded-3xl pt-6 pb-6 px-6 mb-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">月収推移</h3>
        
        <div className="relative h-72">
          {/* Y軸ラベル */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400 font-semibold">
            {[0, 0.25, 0.5, 0.75, 1].reverse().map((ratio, i) => (
              <div key={i} className="text-right pr-2">
                {Math.round((chartMax * ratio) / 10000)}万
              </div>
            ))}
          </div>

          {/* グラフエリア */}
          <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
            {monthlyDataWithLabels.map((data, index) => {
              const heightPercent = chartMax > 0 ? (data.amount / chartMax) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  {/* ツールチップ */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                    ￥{data.amount.toLocaleString()}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>

                  {/* 棒グラフ */}
                  <div className="w-full h-full flex items-end justify-center">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-red-500 via-red-400 to-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden"
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: data.amount > 0 ? '8px' : '0px',
                        animation: 'slideUp 0.8s ease-out',
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {/* 光沢エフェクト */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                    </div>
                  </div>

                  {/* 月ラベル */}
                  <div className="mt-2 text-xs font-bold text-slate-500 group-hover:text-red-600 transition-colors duration-200">
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>

          {/* グリッド線 */}
          <div className="absolute left-12 right-0 top-0 bottom-8 pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-slate-100"
                style={{ top: `${(1 - ratio) * 100}%` }}
              ></div>
            ))}
          </div>
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 sm:mb-8">
              {editingProject ? '案件を編集' : '案件を追加'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  案件名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-medium text-base"
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
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-semibold text-lg number-display"
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
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-medium text-base appearance-none"
                  style={{ 
                    colorScheme: 'light',
                    lineHeight: '1.5',
                    height: 'auto'
                  }}
                />
              </div>
              <div className="flex gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl shadow-red-500/30"
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full overflow-y-auto shadow-2xl" style={{ maxHeight: '80vh' }}>
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
