export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in-progress' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          due_date: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          assigned_to: string | null;
          tags: string[];
          shared_with: string[];
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in-progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          assigned_to?: string | null;
          tags?: string[];
          shared_with?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in-progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          assigned_to?: string | null;
          tags?: string[];
          shared_with?: string[];
        };
      };
      task_shares: {
        Row: {
          id: string;
          task_id: string;
          shared_with_email: string;
          shared_by_user_id: string;
          permission: 'read' | 'write';
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          shared_with_email: string;
          shared_by_user_id: string;
          permission?: 'read' | 'write';
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          shared_with_email?: string;
          shared_by_user_id?: string;
          permission?: 'read' | 'write';
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          full_name: string | null;
          avatar: string | null;
          provider: string | null;
          role: string | null;
          is_active: boolean | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          full_name?: string | null;
          avatar?: string | null;
          provider?: string | null;
          role?: string | null;
          is_active?: boolean | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          full_name?: string | null;
          avatar?: string | null;
          provider?: string | null;
          role?: string | null;
          is_active?: boolean | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
export type TaskShare = Database['public']['Tables']['task_shares']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];