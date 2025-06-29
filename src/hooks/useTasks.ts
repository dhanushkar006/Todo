import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { Task, TaskInsert, TaskUpdate } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user || !isConfigured) {
      console.log('No user or not configured:', { user: !!user, isConfigured });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching tasks for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Tasks query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        // If it's a table doesn't exist error, show helpful message
        if (error.message.includes('relation "tasks" does not exist')) {
          toast.error('Database tables not found. Please run the database migration.');
          setLoading(false);
          return;
        }
        throw error;
      }
      
      console.log('Successfully fetched tasks:', data?.length || 0);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: Omit<TaskInsert, 'user_id'>) => {
    if (!user || !isConfigured) {
      toast.error('Authentication required');
      return;
    }

    try {
      // Ensure we have the correct data structure
      const insertData: TaskInsert = { 
        title: taskData.title,
        description: taskData.description || '',
        status: (taskData.status || 'todo') as 'todo' | 'in-progress' | 'completed',
        priority: (taskData.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        due_date: taskData.due_date || null,
        user_id: user.id,
        tags: taskData.tags || [],
        shared_with: taskData.shared_with || [],
        assigned_to: taskData.assigned_to || null
      };

      console.log('Creating task with data:', insertData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Create task error:', error);
        
        // Handle specific error cases
        if (error.message.includes('infinite recursion')) {
          toast.error('Database configuration error. Please check RLS policies.');
        } else if (error.message.includes('permission denied')) {
          toast.error('Permission denied. Please check your authentication.');
        } else {
          toast.error(`Failed to create task: ${error.message}`);
        }
        throw error;
      }
      
      console.log('Task created successfully:', data);
      setTasks(prev => [data, ...prev]);
      toast.success('Task created successfully');
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<TaskUpdate>) => {
    if (!isConfigured) {
      toast.error('Database not configured');
      return;
    }

    try {
      console.log('Updating task:', id, updates);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update task error:', error);
        toast.error(`Failed to update task: ${error.message}`);
        throw error;
      }
      
      console.log('Task updated successfully:', data);
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast.success('Task updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!isConfigured) {
      toast.error('Database not configured');
      return;
    }

    try {
      console.log('Deleting task:', id);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete task error:', error);
        toast.error(`Failed to delete task: ${error.message}`);
        throw error;
      }
      
      console.log('Task deleted successfully');
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Share task
  const shareTask = async (taskId: string, email: string, permission: 'read' | 'write' = 'read') => {
    if (!user || !isConfigured) {
      toast.error('Authentication required');
      return;
    }

    try {
      console.log('Sharing task:', taskId, 'with:', email);
      
      const { error } = await supabase
        .from('task_shares')
        .insert({
          task_id: taskId,
          shared_with_email: email,
          shared_by_user_id: user.id,
          permission
        });

      if (error) {
        console.error('Share task error:', error);
        toast.error(`Failed to share task: ${error.message}`);
        throw error;
      }
      
      // Update task to show it's assigned
      await updateTask(taskId, { assigned_to: email });
      toast.success(`Task shared with ${email}`);
    } catch (error) {
      console.error('Error sharing task:', error);
      throw error;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !isConfigured) {
      console.log('Skipping fetch - no user or not configured');
      setLoading(false);
      return;
    }

    console.log('Setting up tasks for user:', user.id);
    fetchTasks();

    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Real-time update:', payload);
            if (payload.eventType === 'INSERT') {
              setTasks(prev => [payload.new as Task, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setTasks(prev => prev.map(task => 
                task.id === payload.new.id ? payload.new as Task : task
              ));
            } else if (payload.eventType === 'DELETE') {
              setTasks(prev => prev.filter(task => task.id !== payload.old.id));
            }
          }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    shareTask,
    refreshTasks: fetchTasks
  };
};