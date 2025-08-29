'use client';

import { useSmartYouTubeStats } from '@/hooks/useSmartYouTubeStats';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';
import { useAppConfig } from '@/hooks/useAppConfig';
import { RefreshCw, Users, Calendar, TrendingUp, Eye, Wifi, WifiOff, Check, Database, Clock, Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const YouTubeStatsCard = ({ isDark }: { isDark: boolean }) => {
  const { config } = useAppConfig();
  const smartStats = useSmartYouTubeStats(config?.channelId);
  const { weeklyStats } = useWeeklyVideoTracker();

  // Fallbacks seguros para todos los datos
  const stats = smartStats.stats || {
    daysSinceLastVideo: 0,
    lastVideoDate: null,
    subscriberCount: 0,
    totalViews: 0,
    averageViewsPerVideo: 0,
  };
  const dataSource = smartStats.dataSource || '';
  const loading = !!smartStats.loading;
  const error = smartStats.error || '';
  const quotaExceeded = !!smartStats.quotaExceeded;
  const lastUpdated = smartStats.lastUpdated || null;
  const refresh = smartStats.refresh;
  const getMotivationalMessage = smartStats.getMotivationalMessage || (() => '¡Sigue adelante!');
  const getProgressColor = smartStats.getProgressColor || (() => 'text-gray-500');

  const weeklyGoal = config?.goals?.videosPerWeek || 1;
  const videosThisWeek = weeklyStats?.videosThisWeek ?? 0;
  const weeklyProgress = weeklyGoal > 0 ? Math.min((videosThisWeek / weeklyGoal) * 100, 100) : 0;

  // Get data source icon and label
  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'api':
        return { icon: Wifi, label: 'API activa', color: 'text-green-500' };
      case 'cache':
        return { icon: Database, label: 'Cache', color: 'text-blue-500' };
      case 'historical':
        return { icon: Server, label: 'Histórico', color: 'text-purple-500' };
      default:
        return { icon: WifiOff, label: 'Sin datos', color: 'text-gray-500' };
    }
  };

  const cardBaseClass = `rounded-xl p-6 border-2 transition-colors duration-300`;
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-white';
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-white';

  if (!config.channelId) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">⚙️</span>
          <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Configuración Requerida</h2>
          <p className={`${textSecondary} mb-4`}>
            Para ver tus estadísticas reales de YouTube, configura tu Channel ID.
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
          <p className={textSecondary}>Obteniendo datos de YouTube...</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
            {quotaExceeded ? 'Cargando datos alternativos...' : 'Esto puede tomar unos segundos'}
          </p>
        </div>
      </div>
    );
  }

  // Error state - only show if no stats at all
  if (error && !stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-red-900 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h2 className={`text-xl font-bold ${isDark ? 'text-red-300' : 'text-red-800'} mb-2`}>
            Error de Configuración
          </h2>
          <p className={`${isDark ? 'text-red-400' : 'text-red-600'} mb-4 text-sm`}>
            {error}
          </p>
          <div className={`${isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
            <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
              Revisa tu configuración en Configuración → Canal YouTube
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No stats available at all
  if (!stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'} flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">📺</span>
          <p className={textSecondary}>No hay datos disponibles</p>
          <p className={`text-xs ${textSecondary} mt-1`}>
            Configura tu canal en Configuración
          </p>
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
            {(() => {
              const { icon: Icon, label, color } = getDataSourceInfo();
              return (
                <>
                  <Icon className={`w-3 h-3 ${color}`} />
                  <span className={`font-medium ${color.replace('text-', 'text-')}`}>{label}</span>
                </>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className={`text-xs ${textSecondary} flex items-center gap-1`}>
              <Clock className="w-3 h-3" />
              {format(lastUpdated, 'HH:mm')}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className={`p-2 ${hoverBg} rounded-lg transition-colors disabled:opacity-50`}
            title="Actualizar estadísticas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} ${textSecondary}`} />
          </button>
        </div>
      </div>

      {(error || quotaExceeded || dataSource !== 'api') && (
        <div className={`${isDark ? 
          (quotaExceeded ? 'bg-orange-900 border-orange-700' : 'bg-purple-900 border-purple-700') : 
          (quotaExceeded ? 'bg-orange-50 border-orange-200' : 'bg-purple-50 border-purple-200')
        } border rounded-lg p-3 mb-4`}>
          <p className={`text-sm ${isDark ? 
            (quotaExceeded ? 'text-orange-300' : 'text-purple-300') : 
            (quotaExceeded ? 'text-orange-800' : 'text-purple-800')
          }`}>
            {quotaExceeded ? 
              '🔄 Cuota API excedida - Mostrando datos guardados' :
              dataSource === 'historical' ?
              '📈 Usando datos históricos guardados' :
              dataSource === 'cache' ?
              '💾 Mostrando datos desde caché (actualizados hace menos de 2 horas)' :
              error ? `⚠️ ${error}` : '📊 Usando datos alternativos'
            }
          </p>
        </div>
      )}

      {/* Mensaje motivacional principal */}
      <div className={`text-center p-4 rounded-lg ${bgInner} mb-6 border-l-4 ${
        typeof stats.daysSinceLastVideo === 'number' ?
          (stats.daysSinceLastVideo < 3 ? 'border-green-500' :
            stats.daysSinceLastVideo < 7 ? 'border-yellow-500' : 'border-red-500')
          : 'border-gray-500'
      }`}>
        <p className={`font-semibold ${getProgressColor()}`}>
          {typeof getMotivationalMessage === 'function' ? getMotivationalMessage() : '¡Sigue adelante!'}
        </p>
        {stats.lastVideoDate && (
          <div className={`mt-2 text-sm ${textSecondary}`}>
            <span>Último video: {stats.lastVideoDate ? format(stats.lastVideoDate, "dd 'de' MMMM", { locale: es }) : 'Sin datos'}</span>
          </div>
        )}
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
            {typeof stats.subscriberCount === 'number' ? stats.subscriberCount.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-gray-500">
            Total
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
            {typeof stats.daysSinceLastVideo === 'number' ? stats.daysSinceLastVideo : '0'}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            días
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Videos totales</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {typeof stats.totalViews === 'number' && typeof stats.averageViewsPerVideo === 'number' && stats.averageViewsPerVideo > 0
              ? Math.floor(stats.totalViews / stats.averageViewsPerVideo)
              : '0'}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            publicados
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${textSecondary}`}>Vistas totales</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {typeof stats.totalViews === 'number' ? (stats.totalViews / 1000000).toFixed(1) + 'M' : '0'}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            visualizaciones
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
            <p className={`text-xs ${textSecondary} mt-1`}>
              ¡Sube {Math.max(weeklyGoal - videosThisWeek, 0)} video(s) más esta semana para completar tu meta! 🎯
            </p>
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