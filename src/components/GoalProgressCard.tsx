'use client';

import { useState, useEffect } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useUserStats } from '@/hooks/useUserStats';
import { useRealYouTubeStats } from '@/hooks/useRealYouTubeStats';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';
import { motion } from 'framer-motion';
import { Target, Video, CheckCircle, Users, Flame, Eye } from 'lucide-react';

const ProgressCircle = ({ percentage, color, isDark }: { percentage: number, color: string, isDark: boolean }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className={isDark ? "stroke-gray-700" : "stroke-gray-200"}
                    strokeWidth="10"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <motion.circle
                    className={`stroke-current ${color}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {Math.round(percentage)}%
            </div>
        </div>
    );
};

const GoalItem = ({ icon, title, current, target, color, isDark }: any) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
        <div className="text-center">
            <ProgressCircle percentage={percentage} color={color} isDark={isDark} />
            <p className={`mt-2 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{title}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{current} / {target}</p>
        </div>
    );
};

export const GoalProgressCard = ({ isDark }: { isDark: boolean }) => {
    const { config } = useAppConfig();
    const { stats: userStats } = useUserStats();
    const { stats: ytStats } = useRealYouTubeStats();
    const { weeklyStats } = useWeeklyVideoTracker();

    // Estado para las tareas completadas hoy
    const [dailyTasksCompleted, setDailyTasksCompleted] = useState(0);
    const [dailyViews, setDailyViews] = useState(0);

    // Calcular tareas completadas hoy
    useEffect(() => {
        const today = new Date().toDateString();
        const completedToday = parseInt(localStorage.getItem('pokebim-daily-tasks-completed') || '0');
        const lastActivityDate = localStorage.getItem('pokebim-last-activity-date');
        
        if (lastActivityDate === today) {
            setDailyTasksCompleted(completedToday);
        } else {
            setDailyTasksCompleted(0);
        }
    }, [userStats.completedTasks]);

    // Simulación de vistas diarias (en una implementación real, esto vendría de la API de YouTube)
    useEffect(() => {
        // Por ahora usamos un valor simulado o guardado en localStorage
        const savedViews = parseInt(localStorage.getItem('pokebim-daily-views') || '0');
        setDailyViews(savedViews);
    }, []);

    const goals = [
        {
            id: 'videos',
            title: 'Videos Semanales',
            current: weeklyStats.videosThisWeek,
            target: config.goals.videosPerWeek,
            color: 'text-red-500',
            icon: <Video />
        },
        {
            id: 'tasks',
            title: 'Tareas Diarias',
            current: dailyTasksCompleted,
            target: config.goals.dailyTasksTarget,
            color: 'text-blue-500',
            icon: <CheckCircle />
        },
        {
            id: 'views',
            title: 'Vistas Diarias',
            current: dailyViews,
            target: config.goals.dailyViewsTarget,
            color: 'text-purple-500',
            icon: <Eye />
        },
        {
            id: 'subs',
            title: 'Subs Semanales',
            current: ytStats?.weeklySubGrowth || 0,
            target: config.goals.weeklySubscribersTarget,
            color: 'text-green-500',
            icon: <Users />
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
                <Target className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Progreso de Objetivos</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goals.map(goal => (
                    <GoalItem key={goal.id} {...goal} isDark={isDark} />
                ))}
            </div>
        </motion.div>
    );
};