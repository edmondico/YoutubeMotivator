'use client';

import { useRealYouTubeStats } from '@/hooks/useRealYouTubeStats';
import { useAdvancedYouTubeStats } from '@/hooks/useAdvancedYouTubeStats';
import { motion } from 'framer-motion';
import { Eye, Users, Video, ThumbsUp, MessageSquare, BarChart, TrendingUp, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ icon, label, value, isDark }: any) => (
    <div className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
            {icon}
        </div>
        <div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</div>
        </div>
    </div>
);

const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
};

export const YouTubeAnalyticsView = ({ isDark }: { isDark: boolean }) => {
    const { stats: realStats, loading: loadingReal } = useRealYouTubeStats();
    const { stats: advancedStats, loading: loadingAdvanced } = useAdvancedYouTubeStats();

    if (loadingReal || loadingAdvanced) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!realStats || !advancedStats) {
        return (
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>No se pudieron cargar las estadísticas</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Asegúrate de que la API Key y el Channel ID estén configurados correctamente.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Análisis del Canal de YouTube</h1>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Un vistazo profundo a tu rendimiento.</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-6 h-6 text-red-500" />} label="Suscriptores" value={formatNumber(realStats.subscriberCount)} isDark={isDark} />
                <StatCard icon={<Eye className="w-6 h-6 text-blue-500" />} label="Vistas Totales" value={formatNumber(realStats.totalViews)} isDark={isDark} />
                <StatCard icon={<Video className="w-6 h-6 text-green-500" />} label="Videos Totales" value={formatNumber(realStats.videoCount)} isDark={isDark} />
                <StatCard icon={<BarChart className="w-6 h-6 text-yellow-500" />} label="Vistas / Video" value={formatNumber(realStats.averageViewsPerVideo)} isDark={isDark} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Videos Recientes */}
                    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Rendimiento de Videos Recientes</h3>
                        <div className="space-y-4">
                            {advancedStats.last3Videos.map(video => (
                                <div key={video.id} className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded-md" />
                                    <div className="flex-1">
                                        <p className={`font-semibold line-clamp-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{video.title}</p>
                                        <div className={`flex items-center gap-4 text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> {formatNumber(video.viewCount)}</span>
                                            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4"/> {formatNumber(video.likeCount)}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4"/> {formatNumber(video.commentCount)}</span>
                                        </div>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{format(video.publishedAt, "dd MMM yyyy", { locale: es })}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                    {/* Engagement */}
                    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Engagement</h3>
                        <div className="space-y-3">
                            <StatCard icon={<TrendingUp className="w-6 h-6 text-pink-500" />} label="Tasa de Engagement" value={`${advancedStats.avgEngagementRate}%`} isDark={isDark} />
                            <StatCard icon={<ThumbsUp className="w-6 h-6 text-blue-400" />} label="Likes / Video" value={formatNumber(advancedStats.avgLikesPerVideo)} isDark={isDark} />
                            <StatCard icon={<MessageSquare className="w-6 h-6 text-green-400" />} label="Comentarios / Video" value={formatNumber(advancedStats.avgCommentsPerVideo)} isDark={isDark} />
                        </div>
                    </div>
                    {/* Consistencia */}
                    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Consistencia</h3>
                        <div className="space-y-3">
                            <StatCard icon={<Clock className="w-6 h-6 text-yellow-500" />} label="Videos / Semana" value={advancedStats.avgVideosPerWeek.toFixed(1)} isDark={isDark} />
                            <StatCard icon={<Award className="w-6 h-6 text-indigo-500" />} label="Score de Consistencia" value={`${advancedStats.consistencyScore}%`} isDark={isDark} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};