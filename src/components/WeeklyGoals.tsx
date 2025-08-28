'use client';

import { useAppConfig } from '@/hooks/useAppConfig';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';
import { Target, Plus, Minus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const WeeklyGoals = ({ isDark }: { isDark: boolean }) => {
  const { config, updateGoals } = useAppConfig();
  const { weeklyStats } = useWeeklyVideoTracker();

  const weeklyGoal = config.goals.videosPerWeek;
  const videosThisWeek = weeklyStats.videosThisWeek;
  const progress = Math.min((videosThisWeek / weeklyGoal) * 100, 100);

  const handleGoalChange = (amount: number) => {
    const newGoal = Math.max(1, weeklyGoal + amount);
    updateGoals({ videosPerWeek: newGoal });
  };

  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgSubtle = isDark ? 'bg-gray-700/50' : 'bg-gray-50';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgSubtle} rounded-lg p-4 mt-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`font-semibold ${textPrimary}`}>Meta Semanal</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleGoalChange(-1)} 
            className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            disabled={weeklyGoal <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={`font-bold text-lg ${textPrimary}`}>{weeklyGoal}</span>
          <button 
            onClick={() => handleGoalChange(1)} 
            className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span className={textSecondary}>Progreso</span>
          <span className={`font-medium ${textPrimary}`}>{videosThisWeek} / {weeklyGoal} videos</span>
        </div>
        <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded-full h-2.5`}>
          <motion.div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        {progress === 100 && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mt-2 text-green-500 font-semibold text-sm">
                <Check className="w-5 h-5" />
                ¡Meta semanal completada!
            </motion.div>
        )}
      </div>
    </div>
  );
};