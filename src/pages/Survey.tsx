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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-16 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'LINESeedJP_OTF', sans-serif" }}>
            週報提出
          </h1>
          {nextDate ? (
            <p className="text-sm text-slate-600">
              次の提出は{formatDate(nextDate)}です
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              週報を提出してみましょう！
            </p>
          )}
        </div>
        <img src="/shuho.png" alt="週報" className="h-36 w-auto" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-3">
            ボトルネック
          </label>
          <textarea
            value={formData.bottleneck}
            onChange={(e) => setFormData({ ...formData, bottleneck: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={4}
            placeholder="今週直面した課題や困っていることを記入してください"
            required
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-900 mb-3">
            今週の成果物
          </label>
          <input
            type="url"
            value={formData.achievement_link}
            onChange={(e) => setFormData({ ...formData, achievement_link: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="https://example.com/your-work"
            required
          />
          <p className="text-xs text-slate-500 mt-2">成果物のリンクを入力してください</p>
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-900 mb-3">
            その他
          </label>
          <textarea
            value={formData.other}
            onChange={(e) => setFormData({ ...formData, other: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={4}
            placeholder="その他、共有したいことがあれば記入してください"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          {saving ? '提出中...' : '提出する'}
        </button>
      </form>

      {lastReport && (
        <div className="mt-6 bg-slate-50 rounded-2xl p-4">
          <p className="text-xs text-slate-600">
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
