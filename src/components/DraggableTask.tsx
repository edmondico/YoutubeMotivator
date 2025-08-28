'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { GripVertical, Clock, CheckCircle, Play, Circle, Info, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserStats } from '@/hooks/useUserStats';

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
  const [showInfo, setShowInfo] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const { completeTask } = useUserStats();
  
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

  const handleStatusChange = async (e: React.MouseEvent, newStatus?: Task['status']) => {
    e.stopPropagation(); // Prevent triggering the info modal
    
    if (newStatus) {
      // If a specific status is provided, use it
      onUpdateTask(task.id, { status: newStatus });
      setShowStatusDropdown(false);
      
      // If task is being completed, award XP
      if (newStatus === 'completed' && task.status !== 'completed') {
        try {
          const leveledUp = await completeTask(task.xpReward);
          if (leveledUp) {
            // You could show a level up notification here
            console.log('¡Subiste de nivel!');
          }
        } catch (error) {
          console.error('Error al completar tarea:', error);
        }
      }
    } else {
      // Toggle dropdown instead of changing status directly
      setShowStatusDropdown(!showStatusDropdown);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the info modal
    onDeleteTask(task.id);
  };

  const handleTaskClick = () => {
    setShowInfo(true);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setShowStatusDropdown(false);
  };

  const priorityColors = isDark ? priorityColorsDark : priorityColorsLight;
  const textPrimary = isDark ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-white';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleTaskClick}
        className={`
          ${priorityColors[task.priority]} 
          border-2 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all
          ${isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : isDark ? 'hover:shadow-md hover:shadow-blue-500/10' : 'hover:shadow-md'}
          ${compact ? 'text-xs' : 'text-sm'}
        `}
      >
      <div className="flex items-start gap-2">
        {/* Drag handle - now just visual indicator */}
        <div className={`flex-shrink-0 p-1 rounded`}>
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
            
            <div className="flex items-center gap-1 relative">
              <div className="relative">
                <button
                  onClick={handleStatusChange}
                  className={`flex items-center gap-1 p-1 rounded ${hoverBg} transition-colors`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : task.status === 'in-progress' ? (
                    <Play className="w-3 h-3 text-blue-600" />
                  ) : (
                    <Circle className={`w-3 h-3 ${textSecondary}`} />
                  )}
                  <ChevronDown className={`w-2 h-2 ${textSecondary} transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Status Dropdown */}
                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
                    <div className={`absolute top-full left-0 mt-1 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50 min-w-[120px]`}>
                    <button
                      onClick={(e) => handleStatusChange(e, 'pending')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${isDark ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'} transition-colors ${task.status === 'pending' ? 'font-semibold' : ''}`}
                    >
                      <Circle className={`w-3 h-3 ${textSecondary}`} />
                      Pendiente
                    </button>
                    <button
                      onClick={(e) => handleStatusChange(e, 'in-progress')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${isDark ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'} transition-colors ${task.status === 'in-progress' ? 'font-semibold' : ''}`}
                    >
                      <Play className="w-3 h-3 text-blue-600" />
                      En progreso
                    </button>
                    <button
                      onClick={(e) => handleStatusChange(e, 'completed')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${isDark ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'} transition-colors rounded-b-lg ${task.status === 'completed' ? 'font-semibold' : ''}`}
                    >
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Completada
                    </button>
                    </div>
                  </>
                )}
              </div>
              
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

    {/* Task Info Modal */}
    {showInfo && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInfo(false)}>
        <div 
          className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'} rounded-lg p-6 max-w-md w-full m-4 border-2`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={compact ? "text-sm" : "text-base"}>{categoryEmojis[task.category]}</span>
              <span className={compact ? "text-xs" : "text-sm"}>{priorityIcons[task.priority]}</span>
              <h3 className="text-lg font-bold">{task.title}</h3>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className={`p-1 ${hoverBg} rounded transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {task.description && (
            <div className="mb-4">
              <h4 className={`text-sm font-semibold ${textSecondary} mb-2`}>Descripción</h4>
              <p className={`text-sm ${textPrimary}`}>{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className={`text-sm font-semibold ${textSecondary} mb-1`}>Duración estimada</h4>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className={`text-sm ${textPrimary}`}>{task.estimatedDuration} minutos</span>
              </div>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${textSecondary} mb-1`}>Recompensa XP</h4>
              <div className="flex items-center gap-1">
                <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>⭐</span>
                <span className={`text-sm ${textPrimary}`}>{task.xpReward} XP</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${textSecondary} mb-2`}>Prioridad</h4>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
              {priorityIcons[task.priority]}
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${textSecondary} mb-2`}>Estado</h4>
            <div className="flex items-center gap-2">
              {task.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : task.status === 'in-progress' ? (
                <Play className="w-5 h-5 text-blue-600" />
              ) : (
                <Circle className={`w-5 h-5 ${textSecondary}`} />
              )}
              <span className="text-sm capitalize">
                {task.status === 'in-progress' ? 'En progreso' : 
                 task.status === 'completed' ? 'Completada' : 'Pendiente'}
              </span>
            </div>
          </div>

          {task.scheduledDate && (
            <div className="mb-4">
              <h4 className={`text-sm font-semibold ${textSecondary} mb-2`}>Programada para</h4>
              <span className={`text-sm ${textPrimary}`}>
                {format(task.scheduledDate, "EEEE, dd 'de' MMMM", { locale: es })}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={async (e) => {
                if (task.status === 'pending') {
                  await handleStatusChange(e, 'in-progress');
                } else if (task.status === 'in-progress') {
                  await handleStatusChange(e, 'completed');
                }
                setShowInfo(false);
              }}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                task.status === 'completed' 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={task.status === 'completed'}
            >
              {task.status === 'completed' ? 'Completada' : 
               task.status === 'in-progress' ? 'Marcar completada' : 'Iniciar tarea'}
            </button>
            <button
              onClick={(e) => {
                handleDelete(e);
                setShowInfo(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};