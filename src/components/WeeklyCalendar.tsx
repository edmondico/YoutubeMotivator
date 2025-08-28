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
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
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

export const WeeklyCalendar = ({ tasks, onUpdateTask, onDeleteTask, onAddTask, isDark }: WeeklyCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

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
      const dayTasks = tasks.filter(task => 
        task.scheduledDate && isSameDay(task.scheduledDate, date)
      );
      
      days.push({
        date,
        day: format(date, 'EEEE', { locale: es }),
        dayNumber: date.getDate(),
        tasks: dayTasks,
      });
    }
    
    setWeekDays(days);
    
    // Tareas no programadas
    const unscheduled = tasks.filter(task => !task.scheduledDate);
    setUnscheduledTasks(unscheduled);
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

    // Si se suelta en un día específico
    if (overContainerId.startsWith('day-')) {
      const dayIndex = parseInt(overContainerId.replace('day-', ''));
      const targetDate = weekDays[dayIndex]?.date;
      
      if (targetDate) {
        onUpdateTask(activeTaskId, { scheduledDate: targetDate });
      }
    }
    
    // Si se suelta en el área de tareas sin programar
    else if (overContainerId === 'unscheduled') {
      onUpdateTask(activeTaskId, { scheduledDate: undefined });
    }

    setActiveId(null);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setCurrentWeek(prev => addDays(prev, days));
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
                    rounded-lg p-3 min-h-[300px] border-2 transition-colors
                    ${isSameDay(day.date, new Date()) 
                      ? `${todayBg} ${todayBorder}` 
                      : `${bgSubtle} ${borderSubtle} ${isDark ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                    }
                  `}
                >
                  {/* Header del día */}
                  <div className="text-center mb-3">
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

                  {/* Tareas del día */}
                  <DroppableDay id={`day-${index}`}>
                    <SortableContext 
                      items={day.tasks.map(task => task.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {day.tasks.map((task) => (
                          <DraggableTask 
                            key={task.id} 
                            task={task} 
                            compact={true}
                            onUpdateTask={onUpdateTask}
                            onDeleteTask={onDeleteTask}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableDay>

                  {/* Resumen del día */}
                  {day.tasks.length > 0 && (
                    <div className={`mt-3 pt-2 border-t ${borderSubtle}`}>
                      <div className={`text-xs ${textSecondary} flex items-center justify-between`}>
                        <span>{day.tasks.length} tarea{day.tasks.length !== 1 ? 's' : ''}</span>
                        <span>{day.tasks.reduce((acc, task) => acc + task.estimatedDuration, 0)}min</span>
                      </div>
                    </div>
                  )}
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
    </DndContext>
  );
};