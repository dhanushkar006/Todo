import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../lib/database.types';
import { FilterType, SortType } from './Dashboard';
import { isToday, isPast, parseISO } from 'date-fns';
import { LoadingSpinner } from './LoadingSpinner';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  filter: FilterType;
  sort: SortType;
  search: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onShareTask: (taskId: string, email: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  filter,
  sort,
  search,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onShareTask,
}) => {
  const filterTasks = (tasks: Task[]): Task[] => {
    let filtered = tasks;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply status/date filters
    switch (filter) {
      case 'today':
        filtered = filtered.filter(task =>
          task.due_date && isToday(parseISO(task.due_date))
        );
        break;
      case 'overdue':
        filtered = filtered.filter(task =>
          task.due_date && 
          isPast(parseISO(task.due_date)) && 
          !isToday(parseISO(task.due_date)) &&
          task.status !== 'completed'
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      case 'todo':
        filtered = filtered.filter(task => task.status === 'todo');
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'in-progress');
        break;
      default:
        break;
    }

    return filtered;
  };

  const sortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sort) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        
        case 'title':
          return a.title.localeCompare(b.title);
        
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const filteredAndSortedTasks = sortTasks(filterTasks(tasks));

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-500">
          {search ? `No tasks match "${search}"` : 'Create your first task to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          onShare={onShareTask}
        />
      ))}
    </div>
  );
};