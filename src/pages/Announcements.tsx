import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Announcement = Database['public']['Tables']['announcements']['Row'];
type AnnouncementRead = Database['public']['Tables']['announcement_reads']['Row'];

interface AnnouncementWithRead extends Announcement {
  isRead: boolean;
}

export default function Announcements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithRead | null>(null);

  useEffect(() => {
    if (user) {
      loadAnnouncements();
    }
  }, [user]);

  const loadAnnouncements = async () => {
    try {
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      const { data: readsData, error: readsError } = await supabase
        .from('announcement_reads')
        .select('*')
        .eq('user_id', user!.id);

      if (readsError) throw readsError;

      const announcementsWithRead = announcementsData.map((announcement) => ({
        ...announcement,
        isRead: readsData.some((read) => read.announcement_id === announcement.id),
      }));

      setAnnouncements(announcementsWithRead);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcement_reads')
        .insert({
          user_id: user!.id,
          announcement_id: announcementId,
        });

      if (error && error.code !== '23505') throw error;

      await loadAnnouncements();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const openAnnouncement = (announcement: AnnouncementWithRead) => {
    setSelectedAnnouncement(announcement);
    if (!announcement.isRead) {
      markAsRead(announcement.id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'important':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'event':
        return <Calendar size={20} className="text-blue-600" />;
      default:
        return <Megaphone size={20} className="text-green-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'important':
        return 'bg-red-50 border-red-200';
      case 'event':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'important':
        return '重要';
      case 'event':
        return 'イベント';
      case 'update':
        return 'お知らせ';
      default:
        return 'その他';
    }
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-slate-600 hover:text-red-600 transition"
      >
        <ArrowLeft size={20} />
        <span>戻る</span>
      </button>

      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={28} />
            <div>
              <h1 className="text-2xl font-bold">お知らせ</h1>
              <p className="text-sm opacity-90">デザジュク運営からのお知らせ</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-white text-red-600 px-3 py-1 rounded-full font-bold text-sm">
              {unreadCount}件未読
            </div>
          )}
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-slate-600">お知らせはまだありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              onClick={() => openAnnouncement(announcement)}
              className={`bg-white rounded-2xl p-5 shadow-sm border-2 cursor-pointer hover:shadow-md transition ${
                !announcement.isRead ? getCategoryColor(announcement.category) : 'border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getCategoryIcon(announcement.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {getCategoryLabel(announcement.category)}
                    </span>
                    {!announcement.isRead && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        未読
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(announcement.published_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAnnouncement(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedAnnouncement.category)}
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {getCategoryLabel(selectedAnnouncement.category)}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {selectedAnnouncement.title}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {new Date(selectedAnnouncement.published_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
