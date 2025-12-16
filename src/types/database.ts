export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          icon: string;
          bio: string;
          role: 'free' | 'student';
          last_login_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          icon?: string;
          bio?: string;
          role?: 'free' | 'student';
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          bio?: string;
          role?: 'free' | 'student';
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          reward: number;
          category: 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other';
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          reward?: number;
          category?: 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other';
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          reward?: number;
          category?: 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other';
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          order_num: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          order_num?: number;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          order_num?: number;
          description?: string;
          created_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string;
          youtube_id: string;
          category_id: string | null;
          order_num: number;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          youtube_id: string;
          category_id?: string | null;
          order_num?: number;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          youtube_id?: string;
          category_id?: string | null;
          order_num?: number;
          duration?: number;
          created_at?: string;
        };
      };
      video_progress: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          completed: boolean;
          watched_percent: number;
          last_watched_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          completed?: boolean;
          watched_percent?: number;
          last_watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          completed?: boolean;
          watched_percent?: number;
          last_watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          target_income: number;
          goals: string;
          bottleneck: string;
          free_text: string;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          target_income?: number;
          goals?: string;
          bottleneck?: string;
          free_text?: string;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          target_income?: number;
          goals?: string;
          bottleneck?: string;
          free_text?: string;
          submitted_at?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          acquired_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          acquired_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          acquired_at?: string;
        };
      };
      monthly_surveys: {
        Row: {
          id: string;
          user_id: string;
          target_month: string;
          target_income: number;
          expected_projects: number;
          study_hours_goal: number;
          motivation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_month: string;
          target_income?: number;
          expected_projects?: number;
          study_hours_goal?: number;
          motivation?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_month?: string;
          target_income?: number;
          expected_projects?: number;
          study_hours_goal?: number;
          motivation?: string;
          created_at?: string;
        };
      };
      learning_tracks: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          total_lessons: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category: string;
          total_lessons?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          total_lessons?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          completed_lessons: number;
          last_studied_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          track_id: string;
          completed_lessons?: number;
          last_studied_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          track_id?: string;
          completed_lessons?: number;
          last_studied_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          published_at?: string;
          created_at?: string;
        };
      };
      announcement_reads: {
        Row: {
          id: string;
          user_id: string;
          announcement_id: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          announcement_id: string;
          read_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          announcement_id?: string;
          read_at?: string;
        };
      };
      weekly_reports: {
        Row: {
          id: string;
          user_id: string;
          bottleneck: string;
          achievement_link: string;
          other: string;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bottleneck?: string;
          achievement_link?: string;
          other?: string;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bottleneck?: string;
          achievement_link?: string;
          other?: string;
          submitted_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
