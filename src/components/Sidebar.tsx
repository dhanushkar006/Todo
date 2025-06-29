import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Inbox,
  Search,
  Settings,
  LogOut,
  User,
  ListTodo,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FilterType, SortType } from './Dashboard';
import { Task } from '../lib/database.types';
import { isToday, isPast, parseISO } from 'date-fns';

interface SidebarProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  search: string;
  setSearch: (search: string) => void;
  sort: SortType;
  setSort: (sort: SortType) => void;
  tasks: Task[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  filter,
  setFilter,
  search,
  setSearch,
  sort,
  setSort,
  tasks
}) => {
  const { user, signOut } = useAuth();

  const getTaskCounts = () => {
    const today = tasks.filter(task => 
      task.due_date && isToday(parseISO(task.due_date))
    ).length;
    
    const overdue = tasks.filter(task => 
      task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed'
    ).length;
    
    const completed = tasks.filter(task => task.status === 'completed').length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;

    return { today, overdue, completed, todo, inProgress };
  };

  const counts = getTaskCounts();

  const filterOptions = [
    { key: 'all' as FilterType, label: 'All Tasks', icon: Inbox, count: tasks.length },
    { key: 'today' as FilterType, label: 'Due Today', icon: Calendar, count: counts.today },
    { key: 'overdue' as FilterType, label: 'Overdue', icon: AlertTriangle, count: counts.overdue },
    { key: 'completed' as FilterType, label: 'Completed', icon: CheckCircle, count: counts.completed },
    { key: 'todo' as FilterType, label: 'To Do', icon: ListTodo, count: counts.todo },
    { key: 'in-progress' as FilterType, label: 'In Progress', icon: PlayCircle, count: counts.inProgress },
  ];

  const sortOptions = [
    { key: 'created_at' as SortType, label: 'Created Date' },
    { key: 'due_date' as SortType, label: 'Due Date' },
    { key: 'priority' as SortType, label: 'Priority' },
    { key: 'title' as SortType, label: 'Title' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:relative lg:z-auto">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <CheckSquare className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">TaskFlow</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === option.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-3" />
                    {option.label}
                  </div>
                  {option.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      filter === option.key
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sort By
            </h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || user.email}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};