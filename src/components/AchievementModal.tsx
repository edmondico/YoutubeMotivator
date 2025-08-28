'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, CheckCircle } from 'lucide-react';
import { Achievement } from '@/types';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement | null;
  isDark: boolean;
}

export const AchievementModal = ({ isOpen, onClose, achievement, isDark }: AchievementModalProps) => {
  if (!isOpen || !achievement) return null;

  const bgModal = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-600' : 'border-gray-200';
  const progressBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const progressBar = isDark ? 'bg-yellow-400' : 'bg-yellow-500';

  const progress = achievement.getProgress ? achievement.getProgress() : (achievement.unlocked ? 100 : 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`${bgModal} rounded-2xl shadow-2xl max-w-md w-full`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${border}`}>
            <div className="flex items-center gap-4">
                <div className={`text-5xl transition-transform duration-300 ${!achievement.unlocked && 'filter grayscale'}`}>
                    {achievement.icon}
                </div>
                <div>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>{achievement.title}</h2>
                    <p className={`text-sm ${textSecondary}`}>{achievement.unlocked ? '¡Desbloqueado!' : 'Logro bloqueado'}</p>
                </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <p className={`${textPrimary} mb-4`}>{achievement.description}</p>
            
            <div className="space-y-3">
                <h4 className={`text-sm font-semibold ${textSecondary} flex items-center gap-2`}>
                    <Target className="w-4 h-4"/>
                    Progreso para desbloquear
                </h4>
                <div className="flex items-center gap-4">
                    <div className={`w-full ${progressBg} rounded-full h-4`}>
                        <motion.div 
                            className={`h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <span className={`font-bold ${textPrimary}`}>{Math.round(progress)}%</span>
                </div>
                {achievement.unlocked && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 pt-2 text-green-500 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        ¡Completado!
                    </motion.div>
                )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};