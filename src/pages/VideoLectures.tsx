import { useState, useEffect } from 'react';
import { Search, Play, CheckCircle, Clock, ChevronRight, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Video = Database['public']['Tables']['videos']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type VideoProgress = Database['public']['Tables']['video_progress']['Row'];

interface VideoWithProgress extends Video {
  progress?: VideoProgress;
  categoryName?: string;
}

export default function VideoLectures() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoWithProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProgress | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [videosRes, categoriesRes, progressRes] = await Promise.all([
        supabase.from('videos').select('*').order('order_num', { ascending: true }),
        supabase.from('categories').select('*').order('order_num', { ascending: true }),
        user
          ? supabase.from('video_progress').select('*').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      const progressMap = new Map(
        (progressRes.data || []).map((p) => [p.video_id, p])
      );

      const categoryMap = new Map(
        (categoriesRes.data || []).map((c) => [c.id, c.name])
      );

      const videosWithProgress = (videosRes.data || []).map((video) => ({
        ...video,
        progress: progressMap.get(video.id),
        categoryName: video.category_id ? categoryMap.get(video.category_id) : undefined,
      }));

      setVideos(videosWithProgress);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    if (!user) return;

    try {
      const existingProgress = videos.find((v) => v.id === videoId)?.progress;

      if (existingProgress) {
        await supabase
          .from('video_progress')
          .update({
            completed: true,
            watched_percent: 100,
            last_watched_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('video_progress').insert({
          user_id: user.id,
          video_id: videoId,
          completed: true,
          watched_percent: 100,
        });
      }

      loadData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || video.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const completedCount = videos.filter((v) => v.progress?.completed).length;
  const totalCount = videos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-900">動画講義</h1>
        <p className="text-sm text-slate-500 mt-1">カリキュラムに沿って学習を進めましょう</p>
      </div>

      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">学習進捗</span>
            <span className="text-sm text-slate-500">{completedCount}/{totalCount} 完了</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right mt-2">
            <span className="text-lg font-bold text-red-600">{progressPercent}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="動画を検索..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full sm:w-48 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <Play size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">
            {videos.length === 0
              ? '動画講義は準備中です'
              : '該当する動画が見つかりませんでした'}
          </p>
          {videos.length === 0 && (
            <p className="text-sm text-slate-400 mt-2">
              UTAGE連携後に動画が表示されます
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className={`bg-white rounded-xl border transition cursor-pointer hover:shadow-md ${
                video.progress?.completed
                  ? 'border-green-200 bg-green-50/30'
                  : 'border-slate-200'
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="p-4 flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    video.progress?.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {video.progress?.completed ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{video.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {video.categoryName && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {video.categoryName}
                      </span>
                    )}
                    {video.duration > 0 && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              {selectedVideo.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-70">UTAGE動画埋め込み予定</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedVideo.title}</h2>
              {selectedVideo.description && (
                <p className="text-slate-600 text-sm mb-4">{selectedVideo.description}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="flex-1 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  閉じる
                </button>
                {!selectedVideo.progress?.completed && (
                  <button
                    onClick={() => {
                      handleVideoComplete(selectedVideo.id);
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    視聴完了
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
