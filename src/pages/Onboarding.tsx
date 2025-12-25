import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, ClipboardCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/');
      return;
    }
  }, [profile, navigate]);

  const handleComplete = async (takeDiagnosis: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      if (takeDiagnosis) {
        navigate('/diagnosis');
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <img src="/logox4.png" alt="デザジュク" className="h-8 mx-auto mb-6" />
        </div>

        <div className="animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mb-6">
              <Sparkles size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              デザジュクへようこそ！
            </h1>
            <p className="text-slate-600">
              あなたの学習をサポートします
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">スキル診断</h2>
                <p className="text-sm text-slate-500">あなたの強みを発見</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              簡単な質問に答えるだけで、あなたのデザインスキルとビジネススキルを診断します。
              診断結果に基づいて、最適な学習プランをご提案します。
            </p>
            <button
              onClick={() => handleComplete(true)}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ClipboardCheck size={20} />
              {saving ? '準備中...' : 'スキル診断を受ける'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-slate-600 text-center mb-4">
              スキル診断は後からでも受けられます
            </p>
            <button
              onClick={() => handleComplete(false)}
              disabled={saving}
              className="w-full py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-white transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              スキップしてはじめる
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
