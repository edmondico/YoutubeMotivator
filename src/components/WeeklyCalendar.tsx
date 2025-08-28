'use client';

import { useState, useEffect } from 'react';
import { Task, WeekDay } from '@/types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Download, Upload, Save, FolderOpen } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { DroppableDay } from './DroppableDay';
import { DraggableTask } from './DraggableTask';
import { AdvancedTaskModal } from './AdvancedTaskModal';
import { WeeklyGoals } from './WeeklyGoals';

interface WeeklyCalendarProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  isDark: boolean;
}

// Time slots: Morning, Midday, Afternoon
const timeSlots = [
  { id: 'morning', label: 'Mañana', time: '09:00-13:00' },
  { id: 'midday', label: 'Mediodía', time: '13:00-17:00' },
  { id: 'afternoon', label: 'Tarde', time: '17:00-21:00' }
];

export const WeeklyCalendar = ({ tasks, onUpdateTask, onDeleteTask, onAddTask, isDark }: WeeklyCalendarProps) => {
  
  const handleDuplicateTask = (task: Task) => {
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: `${task.title} (copia)`,
      description: task.description,
      estimatedDuration: task.estimatedDuration,
      priority: task.priority,
      category: task.category,
      status: 'pending',
      xpReward: task.xpReward,
      scheduledDate: task.scheduledDate,
      scheduledTime: task.scheduledTime,
      dueDate: task.dueDate,
    };
    onAddTask(newTask);
  };
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<Array<{name: string, tasks: Task[]}>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Estilos condicionales
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgBase = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const bgSubtle = isDark ? 'bg-gray-700/50' : 'bg-gray-50';
  const borderSubtle = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const todayBg = isDark ? 'bg-blue-900/50' : 'bg-blue-50';
  const todayBorder = isDark ? 'border-blue-500' : 'border-blue-300';
  const todayText = isDark ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white';

  // Generate week days
  useEffect(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
    const days: WeekDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      // Solo incluir tareas que tengan scheduledDate igual a este día
      // y filtrar por ID único para evitar duplicados si el estado no refresca bien
      const dayTasks = tasks.filter(task => 
        task.scheduledDate && isSameDay(task.scheduledDate, date)
      );

      // Eliminar duplicados por ID (por si el estado no refresca bien)
      const uniqueDayTasks = Array.from(new Map(dayTasks.map(t => [t.id, t])).values());

      days.push({
        date,
        day: format(date, 'EEEE', { locale: es }),
        dayNumber: date.getDate(),
        tasks: uniqueDayTasks,
      });
    }
    
    setWeekDays(days);
    
    // Tareas no programadas
  // Solo tareas que no tienen fecha programada
  const unscheduled = tasks.filter(task => !task.scheduledDate);
  // Eliminar duplicados por ID
  const uniqueUnscheduled = Array.from(new Map(unscheduled.map(t => [t.id, t])).values());
  setUnscheduledTasks(uniqueUnscheduled);
  }, [currentWeek, tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overContainerId = over.id as string;

    // Si se suelta en una franja horaria específica (day-0-morning)
    if (overContainerId.includes('-') && overContainerId.startsWith('day-')) {
      const parts = overContainerId.split('-');
      if (parts.length >= 3) {
        const dayIndex = parseInt(parts[1]);
        const timeSlotId = parts[2];
        
        const targetDate = weekDays[dayIndex]?.date;
        if (targetDate) {
          if (timeSlotId === 'unscheduled') {
            // Dropped in unscheduled area of a day
            onUpdateTask(activeTaskId, { 
              scheduledDate: targetDate, 
              scheduledTime: undefined 
            });
          } else {
            // Dropped in a specific time slot - assign a default time for that period
            let defaultTime = '12:00'; // Default fallback
            if (timeSlotId === 'morning') defaultTime = '10:00';
            if (timeSlotId === 'midday') defaultTime = '15:00';
            if (timeSlotId === 'afternoon') defaultTime = '19:00';
            
            onUpdateTask(activeTaskId, { 
              scheduledDate: targetDate, 
              scheduledTime: defaultTime 
            });
          }
        }
      }
    }
    // Si se suelta en un día específico (formato antiguo para compatibilidad)
    else if (overContainerId.startsWith('day-') && !overContainerId.includes(':')) {
      const dayIndex = parseInt(overContainerId.replace('day-', ''));
      const targetDate = weekDays[dayIndex]?.date;
      
      if (targetDate) {
        onUpdateTask(activeTaskId, { scheduledDate: targetDate });
      }
    }
    // Si se suelta en el área de tareas sin programar
    else if (overContainerId === 'unscheduled') {
      onUpdateTask(activeTaskId, { 
        scheduledDate: undefined, 
        scheduledTime: undefined 
      });
    }

    setActiveId(null);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setCurrentWeek(prev => addDays(prev, days));
  };

  const importLastWeek = () => {
    const lastWeekStart = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), -7);
    const lastWeekEnd = addDays(lastWeekStart, 6);
    
    const lastWeekTasks = tasks.filter(task => 
      task.scheduledDate && 
      task.scheduledDate >= lastWeekStart && 
      task.scheduledDate <= lastWeekEnd
    );
    
    lastWeekTasks.forEach(task => {
      const daysDiff = 7; // Mover una semana adelante
      const newScheduledDate = task.scheduledDate ? addDays(task.scheduledDate, daysDiff) : undefined;
      
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title: task.title,
        description: task.description,
        estimatedDuration: task.estimatedDuration,
        priority: task.priority,
        category: task.category,
        status: 'pending', // Reset status
        xpReward: task.xpReward,
        scheduledDate: newScheduledDate,
        dueDate: task.dueDate ? addDays(task.dueDate, daysDiff) : undefined,
      };
      onAddTask(newTask);
    });
  };

  const saveWeekPreset = () => {
    if (!presetName.trim()) return;
    
    const currentWeekTasks = tasks.filter(task => 
      task.scheduledDate && 
      weekDays.some(day => isSameDay(day.date, task.scheduledDate!))
    );
    
    const preset = {
      name: presetName,
      tasks: currentWeekTasks.map(task => ({
        ...task,
        id: `preset_${Date.now()}_${Math.random()}`, // New ID for preset
        scheduledDate: task.scheduledDate,
        status: 'pending' as const, // Reset status
      }))
    };
    
    const existingPresets = JSON.parse(localStorage.getItem('week-presets') || '[]');
    const newPresets = [...existingPresets, preset];
    localStorage.setItem('week-presets', JSON.stringify(newPresets));
    setSavedPresets(newPresets);
    setPresetName('');
    setShowPresetModal(false);
  };

  const loadWeekPreset = (preset: {name: string, tasks: Task[]}) => {
    preset.tasks.forEach(task => {
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title: task.title,
        description: task.description,
        estimatedDuration: task.estimatedDuration,
        priority: task.priority,
        category: task.category,
        status: 'pending',
        xpReward: task.xpReward,
        scheduledDate: task.scheduledDate,
        dueDate: task.dueDate,
      };
      onAddTask(newTask);
    });
    setShowPresetModal(false);
  };

  // Load saved presets on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('week-presets') || '[]');
    setSavedPresets(saved);
  }, []);

  // Helper function to get tasks for a specific time slot
  const getTasksForTimeSlot = (dayTasks: Task[], timeSlotId: string) => {
    return dayTasks.filter(task => {
      if (!task.scheduledTime) return false;
      
      // Map time slots based on hour ranges
      const taskHour = parseInt(task.scheduledTime.split(':')[0]);
      
      if (timeSlotId === 'morning' && taskHour >= 9 && taskHour < 13) return true;
      if (timeSlotId === 'midday' && taskHour >= 13 && taskHour < 17) return true;
      if (timeSlotId === 'afternoon' && taskHour >= 17 && taskHour < 21) return true;
      
      return false;
    });
  };

  // Helper function to get unscheduled tasks for a day (no specific time)
  const getUnscheduledTasksForDay = (dayTasks: Task[]) => {
    return dayTasks.filter(task => !task.scheduledTime);
  };


  const activeTask = tasks.find(task => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`rounded-xl p-6 shadow-lg ${bgBase}`}>
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h2 className={`text-xl font-bold ${textPrimary}`}>Planificación Semanal</h2>
            </div>
            <div className={`text-sm ${textSecondary}`}>
              {format(weekDays[0]?.date || currentWeek, "d 'de' MMMM", { locale: es })} - 
              {format(weekDays[6]?.date || addDays(currentWeek, 6), "d 'de' MMMM yyyy", { locale: es })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className={`p-2 ${hoverBg} rounded-lg transition-colors`}
            >
              <ChevronLeft className={`w-5 h-5 ${textSecondary}`} />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className={`px-3 py-2 text-sm font-medium ${isDark ? 'text-blue-300 hover:bg-blue-900/50' : 'text-blue-600 hover:bg-blue-50'} rounded-lg transition-colors`}
            >
              Hoy
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className={`p-2 ${hoverBg} rounded-lg transition-colors`}
            >
              <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
            </button>
            
            {/* Divider */}
            <div className={`w-px h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
            
            {/* Import/Export buttons */}
            <button
              onClick={importLastWeek}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} rounded-lg transition-colors`}
              title="Importar tareas de la semana pasada"
            >
              <Download className={`w-4 h-4 ${textSecondary}`} />
              <span className={`${textSecondary} hidden sm:inline`}>Importar semana pasada</span>
            </button>
            
            <button
              onClick={() => setShowPresetModal(true)}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} rounded-lg transition-colors`}
              title="Guardar/Cargar presets de semana"
            >
              <Save className={`w-4 h-4 ${textSecondary}`} />
              <span className={`${textSecondary} hidden sm:inline`}>Presets</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tareas sin programar */}
          <div className="lg:col-span-1">
            <div className={`${bgSubtle} rounded-lg p-4 h-full`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h3 className={`font-semibold ${textPrimary}`}>Tareas Pendientes</h3>
                  <span className={`${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'} px-2 py-1 rounded-full text-xs font-medium`}>
                    {unscheduledTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className={`p-2 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded-lg transition-colors group`}
                  title="Crear nueva tarea"
                >
                  <Plus className={`w-4 h-4 ${textSecondary} group-hover:text-blue-500`} />
                </button>
              </div>

              
              <DroppableDay id="unscheduled">
                <SortableContext 
                  items={unscheduledTasks.map(task => task.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {unscheduledTasks.map((task) => (
                      <DraggableTask 
                        key={task.id} 
                        task={task} 
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        onDuplicateTask={handleDuplicateTask}
                        isDark={isDark}
                      />
                    ))}
                    
                    {unscheduledTasks.length === 0 && (
                      <div className={`text-center ${textSecondary} py-8`}>
                        <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Haz clic en + para crear una tarea</p>
                        <p className="text-xs mt-1">o arrástralas desde otras secciones</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableDay>

              <WeeklyGoals isDark={isDark} />
            </div>
          </div>

          {/* Calendario de la semana */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <motion.div
                  key={day.date.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    rounded-lg border-2 transition-colors overflow-hidden
                    ${isSameDay(day.date, new Date()) 
                      ? `${todayBg} ${todayBorder}` 
                      : `${bgSubtle} ${borderSubtle} ${isDark ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                    }
                  `}
                >
                  {/* Header del día */}
                  <div className="text-center p-3 border-b">
                    <div className={`font-semibold ${textPrimary} capitalize text-sm`}>
                      {day.day}
                    </div>
                    <div className={`
                      text-lg font-bold w-8 h-8 rounded-full mx-auto flex items-center justify-center
                      ${isSameDay(day.date, new Date())
                        ? todayText
                        : textSecondary
                      }
                    `}>
                      {day.dayNumber}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="max-h-[500px] overflow-y-auto">
                    {timeSlots.map((timeSlot) => {
                      const timeSlotTasks = getTasksForTimeSlot(day.tasks, timeSlot.id);
                      return (
                        <div key={timeSlot.id} className={`border-b ${borderSubtle} last:border-b-0`}>
                          {/* Time header */}
                          <div className={`text-xs font-medium ${textSecondary} px-2 py-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="font-semibold">{timeSlot.label}</span>
                            <span className="ml-2 text-xs opacity-75">({timeSlot.time})</span>
                          </div>
                          
                          {/* Tasks for this time slot */}
                          <DroppableDay id={`day-${index}-${timeSlot.id}`}>
                            <SortableContext 
                              items={timeSlotTasks.map(task => task.id)} 
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="min-h-[80px] p-2 space-y-1">
                                {timeSlotTasks.map((task) => (
                                  <DraggableTask 
                                    key={task.id} 
                                    task={task} 
                                    compact={true}
                                    onUpdateTask={onUpdateTask}
                                    onDeleteTask={onDeleteTask}
                                    onDuplicateTask={handleDuplicateTask}
                                    isDark={isDark}
                                  />
                                ))}
                                {timeSlotTasks.length === 0 && (
                                  <div className={`text-xs ${textSecondary} opacity-50 italic text-center py-4`}>
                                    Arrastra tarea aquí
                                  </div>
                                )}
                              </div>
                            </SortableContext>
                          </DroppableDay>
                        </div>
                      );
                    })}

                    {/* Unscheduled tasks for this day */}
                    {getUnscheduledTasksForDay(day.tasks).length > 0 && (
                      <div className={`border-t-2 ${borderSubtle}`}>
                        <div className={`text-xs font-medium ${textSecondary} px-2 py-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          Sin hora específica
                        </div>
                        <DroppableDay id={`day-${index}-unscheduled`}>
                          <SortableContext 
                            items={getUnscheduledTasksForDay(day.tasks).map(task => task.id)} 
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="p-2 space-y-1">
                              {getUnscheduledTasksForDay(day.tasks).map((task) => (
                                <DraggableTask 
                                  key={task.id} 
                                  task={task} 
                                  compact={true}
                                  onUpdateTask={onUpdateTask}
                                  onDeleteTask={onDeleteTask}
                                  onDuplicateTask={handleDuplicateTask}
                                  isDark={isDark}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DroppableDay>
                      </div>
                    )}
                  </div>

                  {/* Resumen del día */}
                  <div className={`p-2 border-t ${borderSubtle} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs ${textSecondary} flex items-center justify-between`}>
                      <span>{day.tasks.length} tarea{day.tasks.length !== 1 ? 's' : ''}</span>
                      <span>{day.tasks.reduce((acc, task) => acc + task.estimatedDuration, 0)}min</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 transform rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              isDark={isDark}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Advanced Task Modal */}
      <AdvancedTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onAddTask={onAddTask}
        isDark={isDark}
      />

      {/* Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPresetModal(false)}>
          <div 
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'} rounded-xl p-6 max-w-md w-full m-4 border-2`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Presets de Semana</h3>
              <button
                onClick={() => setShowPresetModal(false)}
                className={`p-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Save new preset */}
            <div className="mb-6">
              <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Guardar Semana Actual</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Nombre del preset"
                  className={`flex-1 px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  onClick={saveWeekPreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Load existing presets */}
            <div>
              <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Cargar Preset</h4>
              {savedPresets.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
                  No hay presets guardados
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedPresets.map((preset, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}
                    >
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {preset.tasks.length} tarea{preset.tasks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadWeekPreset(preset)}
                          className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded transition-colors"
                          title="Cargar preset"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newPresets = savedPresets.filter((_, i) => i !== index);
                            localStorage.setItem('week-presets', JSON.stringify(newPresets));
                            setSavedPresets(newPresets);
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                          title="Eliminar preset"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};