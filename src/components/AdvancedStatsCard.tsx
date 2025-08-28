'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Eye, Heart, MessageCircle, Clock, Target, Calendar } from 'lucide-react';
import { useAdvancedYouTubeStats } from '@/hooks/useAdvancedYouTubeStats';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const AdvancedStatsCard = ({ isDark }: { isDark: boolean }) => {
  const { stats, loading, error, isConfigured } = useAdvancedYouTubeStats();

  const cardBaseClass = `rounded-xl p-6 border-2 transition-colors duration-300`;
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-white';
  const borderInner = isDark ? 'border-gray-600' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50';

  if (!isConfigured()) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Estadísticas Avanzadas</h2>
          <p className={`${textSecondary} text-sm`}>
            Configura tu API de YouTube para ver análisis detallados
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          <p className={textSecondary}>Analizando tu canal...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`${cardBaseClass} ${isDark ? 'bg-red-900 border-red-700' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className={`text-lg font-bold ${isDark ? 'text-red-300' : 'text-red-800'} mb-2`}>Error en Análisis</h2>
          <p className={`${isDark ? 'text-red-400' : 'text-red-600'} text-sm`}>{error || 'No se pudieron obtener estadísticas avanzadas'}</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (stats.trendingDirection) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    if (isDark) {
        switch (stats.trendingDirection) {
            case 'up': return 'text-green-400';
            case 'down': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    }
    switch (stats.trendingDirection) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBaseClass} ${bgCard}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Análisis Avanzado</h2>
            <p className={`text-sm ${textSecondary}`}>Insights de tu canal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {stats.trendingDirection === 'up' ? 'Creciendo' : 
             stats.trendingDirection === 'down' ? 'Bajando' : 'Estable'}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center border ${borderInner}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className={`text-xs ${textSecondary}`}>Promedio últimos 3</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {formatNumber(stats.averageViewsLast3Videos)}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>vistas</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center border ${borderInner}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className={`text-xs ${textSecondary}`}>Engagement</span>
          </div>
          <div className="text-lg font-bold text-red-600">
            {stats.avgEngagementRate}%
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>promedio</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center border ${borderInner}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className={`text-xs ${textSecondary}`}>Duración</span>
          </div>
          <div className="text-lg font-bold text-purple-600">
            {stats.avgVideoDurationMinutes}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>minutos</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${bgInner} rounded-lg p-4 text-center border ${borderInner}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className={`text-xs ${textSecondary}`}>Consistencia</span>
          </div>
          <div className="text-lg font-bold text-green-600">
            {stats.consistencyScore}%
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>score</div>
        </motion.div>
      </div>

      {/* Upload Frequency */}
      <div className={`${bgInner} rounded-lg p-4 mb-6 border ${borderInner}`}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className={`font-semibold ${textPrimary}`}>Frecuencia de Subida</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.videosThisWeek}</div>
            <div className={`text-xs ${textSecondary}`}>Esta semana</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.videosThisMonth}</div>
            <div className={`text-xs ${textSecondary}`}>Este mes</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.avgVideosPerWeek.toFixed(1)}</div>
            <div className={`text-xs ${textSecondary}`}>Promedio/semana</div>
          </div>
        </div>
      </div>

      {/* Best Video This Month */}
      {stats.bestPerformingVideoThisMonth && (
        <div className={`${isDark ? 'bg-gray-700 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className={`font-semibold ${textPrimary}`}>Mejor Video del Mes</span>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 line-clamp-1`}>
            {stats.bestPerformingVideoThisMonth.title}
          </div>
          <div className={`flex items-center gap-4 text-xs ${textSecondary}`}>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(stats.bestPerformingVideoThisMonth.viewCount)}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(stats.bestPerformingVideoThisMonth.likeCount)}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(stats.bestPerformingVideoThisMonth.commentCount)}
            </div>
            <div>
              {formatDistanceToNow(stats.bestPerformingVideoThisMonth.publishedAt, { locale: es, addSuffix: true })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Videos */}
      <div className={`${bgInner} rounded-lg p-4 border ${borderInner}`}>
        <h3 className={`font-semibold ${textPrimary} mb-3`}>📹 Últimos Videos</h3>
        <div className="space-y-3">
          {stats.last3Videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-2 rounded-lg ${hoverBg} transition-colors`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${textPrimary} line-clamp-1 mb-1`}>
                  {video.title}
                </div>
                <div className={`flex items-center gap-3 text-xs ${textSecondary}`}>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.viewCount)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {formatNumber(video.likeCount)}
                  </div>
                  <div>
                    {formatDistanceToNow(video.publishedAt, { locale: es, addSuffix: true })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};