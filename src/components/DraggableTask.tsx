'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { GripVertical, Clock, CheckCircle, Play, Circle } from 'lucide-react';

interface DraggableTaskProps {
  task: Task;
  compact?: boolean;
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

export const DraggableTask = ({ task, compact = false, onUpdateTask, onDeleteTask, isDark }: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleStatusChange = () => {
    if (task.status === 'pending') {
      onUpdateTask(task.id, { status: 'in-progress' });
    } else if (task.status === 'in-progress') {
      onUpdateTask(task.id, { status: 'completed' });
    }
  };

  const priorityColors = isDark ? priorityColorsDark : priorityColorsLight;
  const textPrimary = isDark ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-white';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${priorityColors[task.priority]} 
        border-2 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all
        ${isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : isDark ? 'hover:shadow-md hover:shadow-blue-500/10' : 'hover:shadow-md'}
        ${compact ? 'text-xs' : 'text-sm'}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`flex-shrink-0 p-1 ${isDark ? 'hover:bg-gray-500' : 'hover:bg-white'} rounded cursor-grab active:cursor-grabbing`}
        >
          <GripVertical className={`${compact ? "w-3 h-3" : "w-4 h-4"} ${textSecondary}`} />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className={compact ? "text-sm" : "text-base"}>{categoryEmojis[task.category]}</span>
            <span className={compact ? "text-xs" : "text-sm"}>{priorityIcons[task.priority]}</span>
          </div>
          
          <h4 className={`
            font-medium leading-tight truncate
            ${task.status === 'completed' ? `line-through ${textSecondary}` : textPrimary}
            ${compact ? 'text-xs' : 'text-sm'}
          `}>
            {task.title}
          </h4>
          
          {!compact && task.description && (
            <p className={`text-xs ${textSecondary} mt-1 line-clamp-2`}>
              {task.description}
            </p>
          )}
          
          <div className={`flex items-center justify-between mt-1 ${compact ? 'text-xs' : 'text-xs'}`}>
            <div className={`flex items-center gap-2 ${textSecondary}`}>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedDuration}min</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>⭐</span>
                <span>{task.xpReward}XP</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleStatusChange}
                className={`p-1 rounded ${hoverBg} transition-colors`}
                disabled={task.status === 'completed'}
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : task.status === 'in-progress' ? (
                  <Play className="w-3 h-3 text-blue-600" />
                ) : (
                  <Circle className={`w-3 h-3 ${textSecondary}`} />
                )}
              </button>
              
              {!compact && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className={`p-1 text-red-500 ${isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'} rounded transition-colors text-xs`}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};