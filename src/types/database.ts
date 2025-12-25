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
          roadmap_id: string | null;
          onboarding_completed: boolean;
          is_admin: boolean;
          last_login_at: string;
          created_at: string;
          updated_at: string;
          age: number | null;
          occupation: string | null;
          gender: string | null;
        };
        Insert: {
          id: string;
          name?: string;
          icon?: string;
          bio?: string;
          role?: 'free' | 'student';
          roadmap_id?: string | null;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
          age?: number | null;
          occupation?: string | null;
          gender?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          bio?: string;
          role?: 'free' | 'student';
          roadmap_id?: string | null;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
          age?: number | null;
          occupation?: string | null;
          gender?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          reward: number;
          category: 'thumbnail' | 'slide' | 'hp' | 'lp' | 'banner' | 'logo' | 'flyer' | 'other';
          status: 'in_progress' | 'completed' | 'paid';
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
          status?: 'in_progress' | 'completed' | 'paid';
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
          status?: 'in_progress' | 'completed' | 'paid';
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roadmaps: {
        Row: {
          id: string;
          name: string;
          description: string;
          target_audience: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          target_audience?: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          target_audience?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          roadmap_id: string;
          title: string;
          description: string;
          task_type: 'video' | 'action';
          video_id: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          roadmap_id: string;
          title: string;
          description?: string;
          task_type?: 'video' | 'action';
          video_id?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          roadmap_id?: string;
          title?: string;
          description?: string;
          task_type?: 'video' | 'action';
          video_id?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      user_tasks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_income: {
        Row: {
          id: string;
          user_id: string;
          year_month: string;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year_month: string;
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year_month?: string;
          total_amount?: number;
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
    };
  };
}
