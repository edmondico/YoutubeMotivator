'use client';

import { useRealYouTubeStats } from '@/hooks/useRealYouTubeStats';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';
import { useAppConfig } from '@/hooks/useAppConfig';
import { RefreshCw, Users, Calendar, TrendingUp, Eye, Wifi, WifiOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const YouTubeStatsCard = ({ isDark }: { isDark: boolean }) => {
  const { stats, loading, error, lastFetch, refreshStats, getMotivationalMessage, getProgressColor, isConfigured } = useRealYouTubeStats();
  const { weeklyStats } = useWeeklyVideoTracker();
  const { config } = useAppConfig();

  const weeklyGoal = config.goals.videosPerWeek;
  const videosThisWeek = weeklyStats.videosThisWeek;
  const weeklyProgress = Math.min((videosThisWeek / weeklyGoal) * 100, 100);

  const cardBaseClass = `rounded-xl p-6 border-2 transition-colors duration-300`;
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-white';
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-white';

  if (!isConfigured()) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">⚙️</span>
          <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Configuración Requerida</h2>
          <p className={`${textSecondary} mb-4`}>
            Para ver tus estadísticas reales de YouTube, configura tu API Key y Channel ID.
          </p>
          <div className={`${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              Ve a <strong>Configuración → Canal YouTube</strong> para agregar tus credenciales
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className={textSecondary}>Obteniendo datos reales de YouTube...</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-red-900 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h2 className={`text-xl font-bold ${isDark ? 'text-red-300' : 'text-red-800'} mb-2`}>Error de Configuración</h2>
          <p className={`${isDark ? 'text-red-400' : 'text-red-600'} mb-4 text-sm`}>{error}</p>
          <div className={`${isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
            <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
              Revisa tu configuración en <strong>Configuración → Canal YouTube</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'} flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">📺</span>
          <p className={textSecondary}>No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${cardBaseClass} ${bgCard}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📺</span>
          <h2 className={`text-xl font-bold ${textPrimary}`}>Canal YouTube</h2>
          <div className="flex items-center gap-1 text-xs">
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-green-600 font-medium">Datos reales</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className={`text-xs ${textSecondary}`}>
              {format(lastFetch, 'HH:mm')}
            </span>
          )}
          <button
            onClick={refreshStats}
            disabled={loading}
            className={`p-2 ${hoverBg} rounded-lg transition-colors disabled:opacity-50`}
            title="Actualizar estadísticas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} ${textSecondary}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className={`${isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-3 mb-4`}>
          <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
            ⚠️ Error obteniendo datos: {error}
          </p>
        </div>
      )}

      {/* Mensaje motivacional principal */}
      <div className={`text-center p-4 rounded-lg ${bgInner} mb-6 border-l-4 ${
        stats.daysSinceLastVideo < 3 ? 'border-green-500' : 
        stats.daysSinceLastVideo < 7 ? 'border-yellow-500' : 'border-red-500'
      }`}>
        <p className={`font-semibold ${getProgressColor()}`}>
          {getMotivationalMessage()}
        </p>
        <div className={`mt-2 text-sm ${textSecondary}`}>
          <span>Último video: {format(stats.lastVideoDate, "dd 'de' MMMM", { locale: es })}</span>
        </div>
      </div>

      {/* Estadísticas en grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-red-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Suscriptores</span>
          </div>
          <div className={`text-2xl font-bold ${textPrimary}`}>
            {stats.subscriberCount.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{stats.dailySubGrowth} hoy
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Días sin video</span>
          </div>
          <div className={`text-2xl font-bold ${getProgressColor()}`}>
            {stats.daysSinceLastVideo}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {stats.daysSinceLastVideo === 1 ? 'día' : 'días'}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Último video</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            +{stats.lastVideoSubGrowth}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            nuevos subs
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Promedio</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {(stats.averageViewsPerVideo / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            vistas/video
          </div>
        </motion.div>
      </div>

      {/* Barra de progreso semanal */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={textSecondary}>Meta semanal de videos</span>
          <span className={textPrimary}>{videosThisWeek}/{weeklyGoal}</span>
        </div>
        <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
          <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
        {weeklyProgress < 100 ? (
            <p className={`text-xs ${textSecondary} mt-1`}>¡Sube {weeklyGoal - videosThisWeek} video(s) más esta semana para completar tu meta! 🎯</p>
        ) : (
            <p className={`text-xs text-green-500 mt-1 flex items-center gap-1 font-semibold`}>
                <Check className="w-4 h-4"/>
                ¡Objetivo de videos semanal completado!
            </p>
        )}
      </div>
    </motion.div>
  );
};