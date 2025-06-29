import { useState, useEffect } from 'react';
import { Task, TaskInsert, TaskUpdate } from '../lib/database.types';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: TaskInsert | TaskUpdate | { id: string };
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const saved = localStorage.getItem('offline_actions');
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading offline actions:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const updated = [...pendingActions, newAction];
    setPendingActions(updated);
    localStorage.setItem('offline_actions', JSON.stringify(updated));
  };

  const clearOfflineActions = () => {
    setPendingActions([]);
    localStorage.removeItem('offline_actions');
  };

  const removeOfflineAction = (id: string) => {
    const updated = pendingActions.filter(action => action.id !== id);
    setPendingActions(updated);
    localStorage.setItem('offline_actions', JSON.stringify(updated));
  };

  // Save tasks to localStorage for offline access
  const saveTasksOffline = (tasks: Task[]) => {
    localStorage.setItem('offline_tasks', JSON.stringify(tasks));
  };

  const getOfflineTasks = (): Task[] => {
    const saved = localStorage.getItem('offline_tasks');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading offline tasks:', error);
      return [];
    }
  };

  return {
    isOnline,
    pendingActions,
    addOfflineAction,
    clearOfflineActions,
    removeOfflineAction,
    saveTasksOffline,
    getOfflineTasks,
  };
};