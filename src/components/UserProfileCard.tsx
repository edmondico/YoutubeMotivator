'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/components/AuthProvider';
import { useCachedYouTubeStats } from '@/hooks/useCachedYouTubeStats';
import { useAppConfig } from '@/hooks/useAppConfig';
import { 
  User, 
  Trophy, 
  Star, 
  Target, 
  Calendar, 
  Video,
  CheckCircle,
  Flame,
  Crown,
  Award,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Settings,
  Edit3
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'tasks' | 'videos' | 'social' | 'streak' | 'special';
}

const XPBar = ({ currentXP, xpToNext, level, isDark }: {
  currentXP: number;
  xpToNext: number;
  level: number;
  isDark: boolean;
}) => {
  const xpThisLevel = currentXP % 100;
  const percentage = (xpThisLevel / 100) * 100;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Nivel {level}
        </span>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {xpThisLevel}/100 XP
        </span>
      </div>
      <div className={`w-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement, isDark }: { achievement: Achievement; isDark: boolean }) => {
  const bgClass = achievement.unlocked 
    ? isDark ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-600' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
    : isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200';
    
  const textClass = achievement.unlocked
    ? isDark ? 'text-yellow-300' : 'text-yellow-700'
    : isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${bgClass}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </span>
        <div>
          <h4 className={`font-semibold ${achievement.unlocked ? (isDark ? 'text-gray-100' : 'text-gray-800') : textClass}`}>
            {achievement.title}
          </h4>
          <p className={`text-xs ${textClass}`}>
            {achievement.description}
          </p>
        </div>
      </div>
      
      {achievement.progress !== undefined && achievement.maxProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={textClass}>Progreso</span>
            <span className={textClass}>{achievement.progress}/{achievement.maxProgress}</span>
          </div>
          <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, subtitle, color, isDark }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  isDark: boolean;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-4 rounded-xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}
  >
    <div className={`w-12 h-12 rounded-full ${color} mx-auto mb-3 flex items-center justify-center text-white`}>
      {icon}
    </div>
    <div className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
      {value}
    </div>
    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
      {label}
    </div>
    {subtitle && (
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {subtitle}
      </div>
    )}
  </motion.div>
);

export const UserProfileCard = ({ isDark }: { isDark: boolean }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats'>('overview');
  const { user } = useAuth();
  const { stats, loading } = useUserStats();
  const { config } = useAppConfig();
  const { data: ytData } = useCachedYouTubeStats(config.channelId);

  const getUserTitle = (level: number) => {
    if (level >= 50) return "🏆 Maestro YouTuber";
    if (level >= 30) return "👑 Creador Experto";
    if (level >= 20) return "🎯 Productor Pro";
    if (level >= 10) return "🎬 Director Avanzado";
    if (level >= 5) return "📹 Creador Activo";
    return "🥉 PokéEntrenador Novato";
  };

  const getAchievements = (): Achievement[] => [
    {
      id: 'first_task',
      title: 'Primera Tarea',
      description: 'Completa tu primera tarea',
      icon: '🎯',
      unlocked: stats.completedTasks >= 1,
      category: 'tasks'
    },
    {
      id: 'task_master',
      title: 'Maestro de Tareas',
      unlocked: (ytData?.channel?.subscriberCount || 0) >= 11000,
      progress: Math.min((ytData?.channel?.subscriberCount || 0), 11000),
      maxProgress: 11000,
      progress: Math.min(stats.completedTasks, 100),
      maxProgress: 100,
      category: 'tasks'
    },
    {
      id: 'week_warrior',
      title: 'Guerrero Semanal',
      description: 'Mantén una racha de 7 días',
      icon: '🔥',
      unlocked: stats.streak >= 7,
      progress: Math.min(stats.streak, 7),
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'level_up',
      title: 'Subida de Nivel',
      description: 'Alcanza el nivel 10',
      icon: '⭐',
      unlocked: stats.level >= 10,
      progress: Math.min(stats.level, 10),
      maxProgress: 10,
      category: 'special'
    },
    {
      id: 'video_creator',
      title: 'Creador de Videos',
      description: 'Crea tu primer video',
      icon: '🎬',
      unlocked: stats.totalVideosMade >= 1,
      category: 'videos'
    },
    {
      id: 'content_machine',
      title: 'Máquina de Contenido',
      description: 'Crea 50 videos',
      icon: '📹',
      unlocked: stats.totalVideosMade >= 50,
      progress: Math.min(stats.totalVideosMade, 50),
      maxProgress: 50,
      category: 'videos'
    },
    {
      id: 'subscriber_milestone',
      title: 'Hito de Suscriptores',
      description: 'Alcanza 11,000 suscriptores',
      icon: '👥',
      unlocked: (ytData?.channel?.subscriberCount || 0) >= 11000,
      progress: Math.min((ytData?.channel?.subscriberCount || 0), 11000),
      maxProgress: 11000,
      category: 'social'
    },
    {
      id: 'view_master',
      title: 'Maestro de Vistas',
      description: 'Alcanza 100K vistas totales',
      icon: '👁️',
      unlocked: (ytData?.channel?.viewCount || 0) >= 100000,
      progress: Math.min((ytData?.channel?.viewCount || 0) / 1000, 100),
      maxProgress: 100,
      category: 'social'
    }
  ];

  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`rounded-xl p-6 border-2 ${bgCard} flex items-center justify-center h-96`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 border-2 ${bgCard} shadow-lg`}
    >
      {/* Header del perfil */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
          </h2>
          <p className={`${textSecondary} mb-2`}>{getUserTitle(stats.level)}</p>
          <XPBar currentXP={stats.currentXp} xpToNext={stats.xpToNextLevel} level={stats.level} isDark={isDark} />
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {stats.level}
          </div>
          <div className={`text-sm ${textSecondary}`}>Nivel</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Resumen', icon: <User className="w-4 h-4" /> },
          { id: 'achievements', label: 'Logros', icon: <Trophy className="w-4 h-4" /> },
          { id: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Tareas Completadas"
                value={stats.completedTasks}
                color="bg-green-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Flame className="w-6 h-6" />}
                label="Racha Actual"
                value={stats.streak}
                subtitle="días consecutivos"
                color="bg-orange-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Video className="w-6 h-6" />}
                label="Videos Creados"
                value={stats.totalVideosMade}
                color="bg-red-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Star className="w-6 h-6" />}
                label="XP Total"
                value={stats.currentXp}
                color="bg-purple-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Suscriptores"
                value={ytData?.channel?.subscriberCount?.toLocaleString() || '0'}
                color="bg-blue-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Eye className="w-6 h-6" />}
                label="Vistas Totales"
                value={ytData?.channel?.viewCount ? `${(ytData.channel.viewCount / 1000000).toFixed(1)}M` : '0'}
                color="bg-indigo-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Trophy className="w-6 h-6" />}
                label="Logros"
                value={`${unlockedCount}/${achievements.length}`}
                color="bg-yellow-500"
                isDark={isDark}
              />
              <StatCard
                icon={<Crown className="w-6 h-6" />}
                label="Rango"
                value={getUserTitle(stats.level).split(' ').slice(1).join(' ')}
                color="bg-pink-500"
                isDark={isDark}
              />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  Logros Desbloqueados ({unlockedCount}/{achievements.length})
                </h3>
                <div className={`text-sm ${textSecondary}`}>
                  {Math.round((unlockedCount / achievements.length) * 100)}% completado
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Estadísticas Detalladas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold ${textPrimary} mb-3`}>📈 Progreso General</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textSecondary}>Nivel actual</span>
                        <span className={textPrimary}>{stats.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>XP total</span>
                        <span className={textPrimary}>{stats.currentXp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>XP para siguiente nivel</span>
                        <span className={textPrimary}>{stats.xpToNextLevel - stats.currentXp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Tareas completadas</span>
                        <span className={textPrimary}>{stats.completedTasks}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold ${textPrimary} mb-3`}>🎬 Estadísticas YouTube</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textSecondary}>Suscriptores</span>
                        <span className={textPrimary}>{ytData?.channel?.subscriberCount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Videos subidos</span>
                        <span className={textPrimary}>{ytData?.channel?.videoCount || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Vistas totales</span>
                        <span className={textPrimary}>{ytData?.channel?.viewCount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Videos en app</span>
                        <span className={textPrimary}>{stats.totalVideosMade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`font-semibold ${textPrimary} mb-3`}>🏆 Progreso de Logros</h4>
                <div className="space-y-3">
                  {achievements.filter(a => a.progress !== undefined).map((achievement) => (
                    <div key={achievement.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${textPrimary}`}>{achievement.title}</span>
                        <span className={`text-xs ${textSecondary}`}>
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <div className={`w-full h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((achievement.progress! / achievement.maxProgress!) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};