import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  Share2,
  User,
  PlayCircle
} from 'lucide-react';
import { Task } from '../lib/database.types';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { ShareModal } from './ShareModal';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onShare: (taskId: string, email: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onUpdate,
  onShare,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'todo': return 'To Do';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed';
  const isDueToday = task.due_date && isToday(parseISO(task.due_date));

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate(task.id, { status: newStatus });
  };

  const handleShare = (email: string) => {
    onShare(task.id, email);
    setIsShareModalOpen(false);
  };

  return (
    <>
      <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6 ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <button
                onClick={() => handleStatusChange(
                  task.status === 'completed' ? 'todo' : 'completed'
                )}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
              >
                {task.status === 'completed' && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </button>
              
              <h3 className={`text-lg font-semibold ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              
              {task.assigned_to && (
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span>Shared with {task.assigned_to}</span>
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>

              {task.due_date && (
                <div className={`flex items-center text-sm ${
                  isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {isDueToday ? 'Due today' : format(parseISO(task.due_date), 'MMM d, yyyy')}
                  </span>
                  {isOverdue && <AlertTriangle className="w-4 h-4 ml-1" />}
                </div>
              )}
            </div>

            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Created {format(parseISO(task.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share task"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status quick actions */}
        {task.status !== 'completed' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange('todo')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  task.status === 'todo'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                }`}
              >
                To Do
              </button>
              <button
                onClick={() => handleStatusChange('in-progress')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-50 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        )}
      </div>

      {isShareModalOpen && (
        <ShareModal
          task={task}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShare}
        />
      )}
    </>
  );
};