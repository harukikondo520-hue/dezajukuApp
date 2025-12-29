import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MessageCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingGoalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [currentProblem, setCurrentProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);

    try {
      // ユーザーの目標・悩みを保存
      const { error } = await supabase
        .from('users')
        .update({
          goal,
          current_problem: currentProblem,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // ホーム画面へ遷移
      navigate('/');

    } catch (error) {
      console.error('Error saving goal and problem:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <Target size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">最後に、あなたについて教えてください</h1>
          <p className="text-slate-600">AIがあなた専用のアドバイスをするための情報です</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 目標 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900">
                    あなたの目標は？
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    月収目標、なりたい姿など
                  </p>
                </div>
              </div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="例：月収30万円を安定して稼げるデザイナーになりたい"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none"
              />
            </label>
          </div>

          {/* 悩み */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900">
                    今の悩みは？
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    現在抱えている課題や困っていること
                  </p>
                </div>
              </div>
              <textarea
                value={currentProblem}
                onChange={(e) => setCurrentProblem(e.target.value)}
                placeholder="例：案件は取れるけど単価が低くて、忙しいのに稼げない"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none"
              />
            </label>
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              💡 この情報は後から変更できます
            </p>
            <p className="text-xs text-blue-600 mt-1">
              AIとの対話の中で、目標や悩みは変化していくものです。気軽に入力してください。
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || !goal.trim() || !currentProblem.trim()}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                保存中...
              </>
            ) : (
              <>
                デザジュクを始める
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

