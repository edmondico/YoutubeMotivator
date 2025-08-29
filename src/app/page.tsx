'use client';

import { useState } from 'react';
import { ViewMode } from '@/types';
import { Navigation } from '@/components/Navigation';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { YouTubeStatsCard } from '@/components/YouTubeStatsCard';
import { AdvancedStatsCard } from '@/components/AdvancedStatsCard';
import { GameStatsCard } from '@/components/GameStatsCard';
import { VideoUploadButton } from '@/components/VideoUploadButton';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { YouTubeAnalyticsView } from '@/components/YouTubeAnalyticsView';
import { ConfigPage } from '@/components/ConfigPage';
import { GoalProgressCard } from '@/components/GoalProgressCard';
import { UserProfileCard } from '@/components/UserProfileCard';
import { IdeasView } from '@/components/IdeasView';
import { useTasks } from '@/hooks/useTasks';
import { useUserStats } from '@/hooks/useUserStats';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useAuth } from '@/components/AuthProvider';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LoginForm } from '@/components/LoginForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, Trophy, BarChart3 } from 'lucide-react';
import { Task } from '@/types';

// Dashboard View
interface DashboardViewProps {
  tasks: Task[];
  handleTaskUpdate: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  completeTask: (xp: number) => Promise<boolean>;
}

const DashboardView = ({ tasks, handleTaskUpdate, deleteTask, addTask, completeTask }: DashboardViewProps) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const { config } = useAppConfig();
  const isDark = config.theme.darkMode;

  const handleTaskUpdateWithCelebration = async (id: string, updates: Partial<Task>) => {
    const task = tasks.find((t: Task) => t.id === id);
    if (task && updates.status === 'completed' && task.status !== 'completed') {
      await completeTask(task.xpReward);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    handleTaskUpdate(id, updates);
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'today':
        const today = new Date();
        return tasks.filter((t: Task) => {
          if (!t.dueDate && !t.scheduledDate) return false;
          const compareDate = t.scheduledDate || t.dueDate;
          return compareDate && compareDate.toDateString() === today.toDateString();
        });
      case 'pending':
        return tasks.filter((t: Task) => t.status === 'pending');
      case 'completed':
        return tasks.filter((t: Task) => t.status === 'completed');
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const sortedTasks = filteredTasks.sort((a: Task, b: Task) => {
    if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
    if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
    
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <>
      {/* Celebración */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-6xl">🎉✨🏆✨🎉</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid principal con diseño mejorado */}
      <div className="space-y-6 mb-8">
        {/* Primera fila - Stats principales y progreso */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <YouTubeStatsCard isDark={isDark} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <GoalProgressCard isDark={isDark} />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AdvancedStatsCard isDark={isDark} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GameStatsCard isDark={isDark} />
          </motion.div>
        </div>
      </div>

      {/* Sección de tareas y resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel izquierdo - Lista de tareas (más ancho) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 h-full flex flex-col ${isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header de tareas con filtros */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Mis Tareas</h2>
                <span className={`${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full text-sm font-medium`}>
                  {tasks.filter((t: Task) => t.status !== 'completed').length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'today' | 'pending' | 'completed')}
                  className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="all">Todas</option>
                  <option value="today">Hoy</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completadas</option>
                </select>
              </div>
            </div>

            {/* Lista de tareas */}
            <div className="space-y-3 mb-6 flex-1 max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence>
                {sortedTasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateTask={handleTaskUpdateWithCelebration}
                    onDeleteTask={deleteTask}
                    isDark={isDark}
                  />
                ))}
              </AnimatePresence>
              
              {filteredTasks.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay tareas {filter !== 'all' ? `${filter === 'today' ? 'para hoy' : filter}` : ''}.</p>
                  <p className="text-sm">¡Agrega una nueva tarea para comenzar!</p>
                </div>
              )}
            </div>

            <AddTaskForm onAddTask={addTask} isDark={isDark} />
          </motion.div>
        </div>

        {/* Panel derecho - Resumen y carga de video */}
        <div className="space-y-6">
          {/* Video Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <VideoUploadButton />
          </motion.div>


        </div>
      </div>
    </>
  );
};

// Analytics View
const AnalyticsView = ({ tasks, isDark }: { tasks: Task[], isDark: boolean }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalXp = completedTasks.reduce((acc, task) => acc + task.xpReward, 0);
  const avgTaskDuration = tasks.length > 0 ? tasks.reduce((acc, task) => acc + task.estimatedDuration, 0) / tasks.length : 0;

  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgCard} rounded-xl p-6 shadow-lg border`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>Analíticas y Progreso</h2>
          <p className={`text-sm ${textSecondary}`}>Insights sobre tu productividad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDark ? 'bg-blue-900/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl p-6 text-center`}>
          <BarChart3 className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-3`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{tasks.length}</div>
          <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Tareas Totales</div>
        </div>

        <div className={`${isDark ? 'bg-green-900/50' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl p-6 text-center`}>
          <Trophy className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'} mx-auto mb-3`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>{completedTasks.length}</div>
          <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Completadas</div>
        </div>

        <div className={`${isDark ? 'bg-purple-900/50' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-xl p-6 text-center`}>
          <span className="text-2xl block mb-3">⭐</span>
          <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>{totalXp}</div>
          <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>XP Total</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Estadísticas Detalladas</h3>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-4`}>
          <div className="flex justify-between items-center">
            <span className={textSecondary}>Duración promedio de tareas</span>
            <span className={`font-medium ${textPrimary}`}>{Math.round(avgTaskDuration)} minutos</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={textSecondary}>Tasa de finalización</span>
            <span className={`font-medium ${textPrimary}`}>
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={textSecondary}>XP promedio por tarea</span>
            <span className={`font-medium ${textPrimary}`}>
              {completedTasks.length > 0 ? Math.round(totalXp / completedTasks.length) : 0} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const { user, loading } = useAuth();
  const { needsOnboarding, isLoading: onboardingLoading, redirectToOnboarding } = useOnboarding();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { completeTask } = useUserStats();
  const { config } = useAppConfig();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  const isDark = config.theme.darkMode;

  // Check if we need to redirect to onboarding
  if (user && needsOnboarding && !onboardingLoading) {
    redirectToOnboarding();
    return null;
  }

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="px-4 py-8">
        {/* Navigation */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        {/* Content */}
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardView 
                tasks={tasks}
                handleTaskUpdate={updateTask}
                deleteTask={deleteTask}
                addTask={addTask}
                completeTask={completeTask}
              />
            </motion.div>
          )}

          {currentView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WeeklyCalendar 
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddTask={addTask}
                isDark={isDark}
              />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsView tasks={tasks} isDark={isDark} />
            </motion.div>
          )}

          {currentView === 'youtube-analytics' && (
            <motion.div
              key="youtube-analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <YouTubeAnalyticsView isDark={isDark} />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfileCard isDark={isDark} />
            </motion.div>
          )}

          {currentView === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <IdeasView isDark={isDark} />
            </motion.div>
          )}

          {currentView === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ConfigPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}