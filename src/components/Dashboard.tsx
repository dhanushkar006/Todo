import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../lib/database.types';
import { Plus } from 'lucide-react';

export type FilterType = 'all' | 'today' | 'overdue' | 'completed' | 'todo' | 'in-progress';
export type SortType = 'created_at' | 'due_date' | 'priority' | 'title';

export const Dashboard: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, shareTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created_at');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'all': return 'All Tasks';
      case 'today': return 'Due Today';
      case 'overdue': return 'Overdue Tasks';
      case 'completed': return 'Completed Tasks';
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      default: return 'Tasks';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        tasks={tasks}
      />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {getFilterTitle()}
            </h1>
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Task
            </button>
          </div>

          <TaskList
            tasks={tasks}
            loading={loading}
            filter={filter}
            sort={sort}
            search={search}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onShareTask={shareTask}
          />
        </div>
      </main>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={editingTask ? updateTask : createTask}
        />
      )}
    </div>
  );
};