import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row'];

export default function Survey() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastReport, setLastReport] = useState<WeeklyReport | null>(null);
  const [formData, setFormData] = useState({
    bottleneck: '',
    achievement_link: '',
    other: '',
  });

  useEffect(() => {
    if (user) {
      loadLastReport();
    }
  }, [user]);

  const loadLastReport = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('user_id', user!.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLastReport(data);
    } catch (error) {
      console.error('Error loading last report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('weekly_reports').insert({
        user_id: user!.id,
        bottleneck: formData.bottleneck,
        achievement_link: formData.achievement_link,
        other: formData.other,
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      setFormData({ bottleneck: '', achievement_link: '', other: '' });
      await loadLastReport();
      alert('週報を提出しました！');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('提出に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const getNextSubmissionDate = () => {
    if (!lastReport) return null;
    const lastDate = new Date(lastReport.submitted_at);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  };

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  const nextDate = getNextSubmissionDate();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">
            週報提出
          </h1>
          {nextDate ? (
            <p className="text-sm text-slate-500">
              次の提出は{formatDate(nextDate)}です
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              週報を提出してみましょう
            </p>
          )}
        </div>
        <img src="/shuho.png" alt="週報" className="h-20 w-auto opacity-80" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-900">
              ボトルネック
            </label>
          </div>
          <div className="px-5 py-4">
            <textarea
              value={formData.bottleneck}
              onChange={(e) => setFormData({ ...formData, bottleneck: e.target.value })}
              className="w-full px-0 py-0 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-slate-900 placeholder:text-slate-400"
              rows={4}
              placeholder="今週直面した課題や困っていることを記入してください"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-900">
              今週の成果物
            </label>
          </div>
          <div className="px-5 py-4">
            <input
              type="url"
              value={formData.achievement_link}
              onChange={(e) => setFormData({ ...formData, achievement_link: e.target.value })}
              className="w-full px-0 py-0 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
              placeholder="https://example.com/your-work"
              required
            />
            <p className="text-xs text-slate-400 mt-3">成果物のリンクを入力してください</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-900">
              その他
            </label>
          </div>
          <div className="px-5 py-4">
            <textarea
              value={formData.other}
              onChange={(e) => setFormData({ ...formData, other: e.target.value })}
              className="w-full px-0 py-0 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-slate-900 placeholder:text-slate-400"
              rows={4}
              placeholder="その他、共有したいことがあれば記入してください"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-medium hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:active:scale-100"
        >
          {saving ? '提出中...' : '提出する'}
        </button>
      </form>

      {lastReport && (
        <div className="mt-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500">
            最終提出: {new Date(lastReport.submitted_at).toLocaleString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
