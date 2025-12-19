import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/');
      return;
    }
    loadRoadmaps();
  }, [profile, navigate]);

  const loadRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRoadmap || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          roadmap_id: selectedRoadmap,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <img src="/logox4.png" alt="デザジュク" className="h-8 mx-auto mb-6" />
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? 'w-8 bg-red-500' : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mb-6">
                <Sparkles size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                デザジュクへようこそ！
              </h1>
              <p className="text-slate-600">
                あなたに最適な学習プランを
                <br />
                ご用意します
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <h2 className="font-bold text-slate-900 mb-4">
                現在の状況に近いものを選んでください
              </h2>

              <div className="space-y-3">
                {roadmaps.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    onClick={() => setSelectedRoadmap(roadmap.id)}
                    className={`w-full p-4 rounded-xl border-2 transition text-left ${
                      selectedRoadmap === roadmap.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedRoadmap === roadmap.id
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {roadmap.name.includes('案件獲得') ? (
                          <Target size={20} />
                        ) : (
                          <TrendingUp size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{roadmap.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {roadmap.target_audience}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRoadmap === roadmap.id
                            ? 'border-red-500 bg-red-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedRoadmap === roadmap.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedRoadmap}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              次へ
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-6">
                <Target size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                準備完了！
              </h1>
              <p className="text-slate-600">
                あなた専用のロードマップが
                <br />
                設定されました
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <div className="text-center">
                <div className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                  選択されたコース
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {roadmaps.find((r) => r.id === selectedRoadmap)?.name}
                </h2>
                <p className="text-slate-600 text-sm">
                  {roadmaps.find((r) => r.id === selectedRoadmap)?.description}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-slate-900 mb-2">次のステップ</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  ホーム画面でロードマップを確認
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  動画講義で学習を開始
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  案件を獲得して収入を記録
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                戻る
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? '保存中...' : 'はじめる'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
