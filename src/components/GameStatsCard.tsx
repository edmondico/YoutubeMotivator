'use client';

import { useUserStats } from '@/hooks/useUserStats';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';
import { useAdvancedYouTubeStats } from '@/hooks/useAdvancedYouTubeStats';
import { useRealYouTubeStats } from '@/hooks/useRealYouTubeStats';
import { Award, Zap, Target, Trophy, Star, Flame, Check, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { AchievementModal } from './AchievementModal';
import { Achievement } from '@/types';

export const GameStatsCard = ({ isDark }: { isDark: boolean }) => {
  const { stats: userStats } = useUserStats();
  const { weeklyStats } = useWeeklyVideoTracker();
  const { stats: advancedStats } = useAdvancedYouTubeStats();
  const { stats: realStats } = useRealYouTubeStats();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const progressPercentage = (userStats.currentXp / userStats.xpToNextLevel) * 100;
  
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-white';
  const bgXpBar = isDark ? 'bg-gray-600' : 'bg-gray-200';

  // Logros de suscriptores procedurales
  const subscriberMilestones = [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
  const dynamicSubscriberAchievements: Achievement[] = subscriberMilestones.map((milestone) => ({
    id: `subs-${milestone}`,
    title: `¡${milestone} suscriptores!`,
    description: `Alcanza los ${milestone} suscriptores en tu canal.`,
    icon: '📈',
    unlocked: (realStats?.subscriberCount || 0) >= milestone,
    category: 'youtube',
    getProgress: () => Math.min(((realStats?.subscriberCount || 0) / milestone) * 100, 100),
  }));

  const achievements: Achievement[] = [
    // Tasks
    {
      id: 'first-task',
      title: 'Primer Paso',
      description: 'Completa tu primera tarea en la aplicación.',
      icon: '🎯',
      unlocked: userStats.completedTasks >= 1,
      category: 'tasks',
      getProgress: () => Math.min((userStats.completedTasks / 1) * 100, 100),
    },
    {
      id: 'task-novice',
      title: 'Aprendiz de Tareas',
      description: 'Completa 10 tareas.',
      icon: '🧑‍🎓',
      unlocked: userStats.completedTasks >= 10,
      category: 'tasks',
      getProgress: () => Math.min((userStats.completedTasks / 10) * 100, 100),
    },
    {
      id: 'task-master',
      title: 'Maestro de Tareas',
      description: 'Completa 50 tareas.',
      icon: '🏆',
      unlocked: userStats.completedTasks >= 50,
      category: 'tasks',
      getProgress: () => Math.min((userStats.completedTasks / 50) * 100, 100),
    },
    {
        id: 'task-champion',
        title: 'Campeón de Tareas',
        description: 'Completa 100 tareas.',
        icon: '🏅',
        unlocked: userStats.completedTasks >= 100,
        category: 'tasks',
        getProgress: () => Math.min((userStats.completedTasks / 100) * 100, 100),
    },
    // YouTube
    {
      id: 'video-creator',
      title: 'Creador Novato',
      description: 'Registra tu primer video subido.',
      icon: '🎬',
      unlocked: userStats.totalVideosMade >= 1,
      category: 'youtube',
      getProgress: () => Math.min((userStats.totalVideosMade / 1) * 100, 100),
    },
    {
        id: 'video-veteran',
        title: 'Veterano de YouTube',
        description: 'Registra 25 videos subidos.',
        icon: '🎥',
        unlocked: userStats.totalVideosMade >= 25,
        category: 'youtube',
        getProgress: () => Math.min((userStats.totalVideosMade / 25) * 100, 100),
    },
    {
      id: 'consistent-creator',
      title: 'Creador Consistente',
      description: 'Cumple tu meta semanal de videos por primera vez.',
      icon: '⭐',
      unlocked: weeklyStats.weeksMeetingGoal >= 1,
      category: 'youtube',
      getProgress: () => Math.min((weeklyStats.weeksMeetingGoal / 1) * 100, 100),
    },
    {
      id: 'creator-streak',
      title: 'Racha de Creador',
      description: 'Cumple tu meta semanal de videos por 4 semanas seguidas.',
      icon: '🔥',
      unlocked: weeklyStats.streakWeeks >= 4,
      category: 'youtube',
      getProgress: () => Math.min((weeklyStats.streakWeeks / 4) * 100, 100),
    },
    {
        id: 'subscriber-milestone-1',
        title: 'Club de los 10K',
        description: 'Alcanza los 10,000 suscriptores.',
        icon: <Users className="w-full h-full p-2 text-red-500"/>,
        unlocked: (realStats?.subscriberCount || 0) >= 10000,
        category: 'youtube',
        getProgress: () => Math.min(((realStats?.subscriberCount || 0) / 10000) * 100, 100),
    },
    {
        id: 'subscriber-milestone-2',
        title: 'Placa de Plata',
        description: 'Alcanza los 100,000 suscriptores.',
        icon: <Users className="w-full h-full p-2 text-gray-400"/>,
        unlocked: (realStats?.subscriberCount || 0) >= 100000,
        category: 'youtube',
        getProgress: () => Math.min(((realStats?.subscriberCount || 0) / 100000) * 100, 100),
    },
    {
        id: 'views-milestone-1',
        title: 'Medio Millón de Vistas',
        description: 'Alcanza 500,000 vistas totales en el canal.',
        icon: <Eye className="w-full h-full p-2 text-blue-500"/>,
        unlocked: (realStats?.totalViews || 0) >= 500000,
        category: 'youtube',
        getProgress: () => Math.min(((realStats?.totalViews || 0) / 500000) * 100, 100),
    },
    // General
    {
      id: 'level-master',
      title: 'Maestro PokéTuber',
      description: 'Alcanza el nivel 10 de tu cuenta.',
      icon: '👑',
      unlocked: userStats.level >= 10,
      category: 'general',
      getProgress: () => Math.min((userStats.level / 10) * 100, 100),
    },
    ...dynamicSubscriberAchievements,
  ];

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'PokéEntrenador Novato';
    if (level < 10) return 'Entrenador Avanzado';
    if (level < 20) return 'Maestro Pokémon';
    if (level < 30) return 'Campeón de Liga';
    return 'Maestro PokéTuber';
  };

  const getLevelEmoji = (level: number) => {
    if (level < 5) return '🥉';
    if (level < 10) return '🥈';
    if (level < 20) return '🥇';
    if (level < 30) return '👑';
    return '⭐';
  };

  const renderAchievement = (ach: Achievement) => {
    const bgAchievement = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-yellow-400 shadow-lg';
    const bgAchievementLocked = isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-100 border-gray-200';
  
    return (
      <motion.div
        key={ach.id}
        className={`text-center p-3 rounded-xl transition-all relative border-2 cursor-pointer ${
          ach.unlocked ? bgAchievement : bgAchievementLocked
        }`}
        whileHover={{ y: -5, scale: 1.05 }}
        title={`${ach.title}: ${ach.description}`}
        onClick={() => handleAchievementClick(ach)}
      >
        <div className={`text-4xl h-10 flex items-center justify-center ${!ach.unlocked && 'opacity-30 filter grayscale'}`}>{ach.icon}</div>
        {ach.unlocked && (
          <motion.div 
              initial={{scale: 0, rotate: -45}} 
              animate={{scale: 1, rotate: 0}} 
              className={`absolute -top-2 -right-2 bg-green-500 rounded-full p-1 border-2 ${isDark ? 'border-gray-800' : 'border-white'} shadow-md`}>
              <Trophy className="w-3 h-3 text-white"/>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgCard} rounded-xl p-6 border-2`}
      >
        {/* Header con nivel */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{getLevelEmoji(userStats.level)}</span>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Nivel {userStats.level}</h2>
          </div>
          <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium`}>{getLevelTitle(userStats.level)}</p>
        </div>

        {/* Barra de XP */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={`${textSecondary} flex items-center gap-1`}>
              <Zap className="w-4 h-4 text-yellow-500" />
              XP: {userStats.currentXp}
            </span>
            <span className={textSecondary}>Siguiente: {userStats.xpToNextLevel}</span>
          </div>
          <div className={`w-full ${bgXpBar} rounded-full h-3 overflow-hidden`}>
            <motion.div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`${bgInner} rounded-lg p-3 text-center`}>
            <div className="text-lg font-bold text-blue-600">{userStats.completedTasks}</div>
            <div className={`text-xs ${textSecondary}`}>Tareas</div>
          </div>
          <div className={`${bgInner} rounded-lg p-3 text-center`}>
            <div className="text-lg font-bold text-green-600">{userStats.totalVideosMade}</div>
            <div className={`text-xs ${textSecondary}`}>Videos</div>
          </div>
          <div className={`${bgInner} rounded-lg p-3 text-center`}>
            <div className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{weeklyStats.videosThisWeek}</div>
            <div className={`text-xs ${textSecondary}`}>Esta semana</div>
          </div>
          <div className={`${bgInner} rounded-lg p-3 text-center`}>
            <div className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{Math.round(weeklyStats.successRate)}%</div>
            <div className={`text-xs ${textSecondary}`}>Éxito semanal</div>
          </div>
        </div>

        {/* Logros */}
        <div>
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                  <Award className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`font-semibold ${textPrimary} text-lg`}>Logros</h3>
              </div>
              <span className={`text-sm font-bold ${isDark ? 'text-purple-300 bg-purple-800/50' : 'text-purple-700 bg-purple-200'} px-3 py-1 rounded-full shadow-sm`}>
              {achievements.filter(a => a.unlocked).length} / {achievements.length}
              </span>
          </div>
          <div className="space-y-4">
              <div>
                  <h4 className={`font-bold text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2 pl-1`}>YouTube</h4>
                  <div className="grid grid-cols-4 gap-3">
                      {achievements.filter(a => a.category === 'youtube').map(renderAchievement)}
                  </div>
              </div>
              <div>
                  <h4 className={`font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-600'} mb-2 pl-1`}>Tareas</h4>
                  <div className="grid grid-cols-4 gap-3">
                      {achievements.filter(a => a.category === 'tasks').map(renderAchievement)}
                  </div>
              </div>
              <div>
                  <h4 className={`font-bold text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 pl-1`}>General</h4>
                  <div className="grid grid-cols-4 gap-3">
                      {achievements.filter(a => a.category === 'general').map(renderAchievement)}
                  </div>
              </div>
          </div>
        </div>

        {/* Motivación del día */}
        {/* Aquí puedes poner otra motivación, o dejarlo vacío para no mostrar la frase eliminada */}
      </motion.div>
      <AchievementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        achievement={selectedAchievement} 
        isDark={isDark} 
      />
    </>
  );
};