'use client';

import { Task } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Flag, Play, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  isDark: boolean;
}

const priorityColorsLight = {
  low: 'border-green-300 bg-green-50',
  medium: 'border-yellow-300 bg-yellow-50',
  high: 'border-orange-300 bg-orange-50',
  urgent: 'border-red-300 bg-red-50',
};

const priorityColorsDark = {
  low: 'border-green-800 bg-green-900/50',
  medium: 'border-yellow-800 bg-yellow-900/50',
  high: 'border-orange-800 bg-orange-900/50',
  urgent: 'border-red-800 bg-red-900/50',
};

const priorityIcons = {
  low: '🟢',
  medium: '🟡', 
  high: '🟠',
  urgent: '🔴',
};

const categoryEmojis = {
  'video-creation': '🎬',
  'editing': '✂️',
  'research': '🔍',
  'marketing': '📢',
  'other': '📝',
};

export const TaskCard = ({ task, onUpdateTask, onDeleteTask, isDark }: TaskCardProps) => {
  const handleStatusChange = () => {
    if (task.status === 'pending') {
      onUpdateTask(task.id, { status: 'in-progress' });
    } else if (task.status === 'in-progress') {
      onUpdateTask(task.id, { status: 'completed' });
    }
  };

  const priorityColors = isDark ? priorityColorsDark : priorityColorsLight;
  const textPrimary = isDark ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border-2 ${priorityColors[task.priority]} transition-all ${isDark ? 'hover:shadow-md hover:shadow-blue-500/10' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryEmojis[task.category]}</span>
            <h3 className={`font-semibold ${task.status === 'completed' ? `line-through ${textSecondary}` : textPrimary}`}>
              {task.title}
            </h3>
            <span>{priorityIcons[task.priority]}</span>
          </div>
          
          {task.description && (
            <p className={`text-sm ${textSecondary} mb-3`}>{task.description}</p>
          )}
          
          <div className={`flex items-center gap-4 text-xs ${textSecondary}`}>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedDuration} min</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{format(task.dueDate, 'dd MMM', { locale: es })}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>⭐</span>
              <span>{task.xpReward} XP</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleStatusChange}
            className={`p-2 rounded-full ${hoverBg} transition-colors`}
            disabled={task.status === 'completed'}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : task.status === 'in-progress' ? (
              <Play className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className={`w-5 h-5 ${textSecondary}`} />
            )}
          </button>
          
          <button
            onClick={() => onDeleteTask(task.id)}
            className={`p-1 text-red-500 ${isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'} rounded transition-colors`}
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
};