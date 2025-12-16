import { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type Video = Database['public']['Tables']['videos']['Row'];
type VideoProgress = Database['public']['Tables']['video_progress']['Row'];

interface VideoWithProgress extends Video {
  progress?: VideoProgress;
}

interface CategoryWithVideos extends Category {
  videos: VideoWithProgress[];
}

export default function Learning() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithVideos[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProgress | null>(null);

  useEffect(() => {
    if (user) {
      loadCategoriesAndVideos();
    }
  }, [user]);

  const loadCategoriesAndVideos = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order_num');

      if (categoriesError) throw categoriesError;

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('order_num');

      if (videosError) throw videosError;

      const { data: progressData, error: progressError } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (progressError) throw progressError;

      const categoriesWithVideos = categoriesData.map((category) => ({
        ...category,
        videos: videosData
          .filter((v) => v.category_id === category.id)
          .map((video) => ({
            ...video,
            progress: progressData.find((p) => p.video_id === video.id),
          })),
      }));

      setCategories(categoriesWithVideos);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const markAsWatched = async (video: VideoWithProgress) => {
    try {
      if (video.progress) {
        const { error } = await supabase
          .from('video_progress')
          .update({
            completed: true,
            watched_percent: 100,
            last_watched_at: new Date().toISOString(),
          })
          .eq('id', video.progress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('video_progress').insert({
          user_id: user!.id,
          video_id: video.id,
          completed: true,
          watched_percent: 100,
        });

        if (error) throw error;
      }

      await loadCategoriesAndVideos();
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const totalVideos = categories.reduce((sum, cat) => sum + cat.videos.length, 0);
  const completedVideos = categories.reduce(
    (sum, cat) => sum + cat.videos.filter((v) => v.progress?.completed).length,
    0
  );
  const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-3">動画学習</h1>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>学習進捗</span>
            <span className="font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <p className="text-sm opacity-90">
          {completedVideos} / {totalVideos} 本の動画を視聴完了
        </p>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedVideo.title}</h2>
              <p className="text-sm text-slate-600 mb-4">{selectedVideo.description}</p>
              <div className="flex gap-3">
                {!selectedVideo.progress?.completed && (
                  <button
                    onClick={() => {
                      markAsWatched(selectedVideo);
                      setSelectedVideo(null);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                  >
                    視聴完了としてマーク
                  </button>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const categoryCompleted = category.videos.filter((v) => v.progress?.completed).length;
          const categoryTotal = category.videos.length;

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="text-left flex-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{category.name}</h2>
                  <p className="text-sm text-slate-600">{category.description}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    {categoryCompleted} / {categoryTotal} 本完了
                  </div>
                </div>
                <div className="ml-4">
                  {isExpanded ? (
                    <ChevronUp size={24} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={24} className="text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200 p-4 space-y-2">
                  {category.videos.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      このカテゴリにはまだ動画がありません
                    </p>
                  ) : (
                    category.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                      >
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <PlayCircle size={20} className="text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 text-sm">{video.title}</h3>
                            {video.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{video.description}</p>
                            )}
                          </div>
                        </button>
                        {video.progress?.completed && (
                          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-slate-600">まだ学習コンテンツが登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}
