'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Target, Calendar, Star } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';
import { useWeeklyVideoTracker } from '@/hooks/useWeeklyVideoTracker';

import { useAppConfig } from '@/hooks/useAppConfig';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (xp: number) => void;
  isDark: boolean;
}

const VideoUploadModal = ({ isOpen, onClose, onVideoUploaded, isDark }: VideoUploadModalProps) => {
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    estimatedViews: 1000,
    category: 'gaming' as const,
  });

  const categories = [
    { value: 'gaming', label: 'Gaming', emoji: '🎮', xp: 100 },
    { value: 'tutorial', label: 'Tutorial', emoji: '📚', xp: 120 },
    { value: 'review', label: 'Review', emoji: '⭐', xp: 110 },
    { value: 'unboxing', label: 'Unboxing', emoji: '📦', xp: 90 },
    { value: 'discussion', label: 'Discusión', emoji: '💬', xp: 80 },
    { value: 'shorts', label: 'Shorts', emoji: '📱', xp: 60 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoData.title.trim()) return;

    const selectedCategory = categories.find(cat => cat.value === videoData.category);
    const baseXP = selectedCategory?.xp || 100;
    const bonus = videoData.estimatedViews > 5000 ? 50 : videoData.estimatedViews > 1000 ? 25 : 0;
    const totalXP = baseXP + bonus;

    onVideoUploaded(totalXP);
    
    setVideoData({ title: '', description: '', estimatedViews: 1000, category: 'gaming' });
    onClose();
  };

  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgModal = isDark ? 'bg-gray-800' : 'bg-white';
  const border = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const ringFocus = isDark ? 'focus:ring-red-400' : 'focus:ring-red-500';

  if (!isOpen) return null;

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
          className={`${bgModal} rounded-2xl shadow-2xl max-w-lg w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>¡Subiste un Video!</h2>
              <p className={textSecondary}>Registra tu nuevo video para ganar XP</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  📹 Título del video *
                </label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent`}
                  placeholder="Ej: ¡Nuevas cartas Pokémon reveladas!"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    🏷️ Categoría
                  </label>
                  <select
                    value={videoData.category}
                    onChange={(e) => setVideoData(prev => ({ ...prev, category: e.target.value as any }))}
                    className={`w-full px-4 py-3 border ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label} (+{cat.xp} XP)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    👀 Vistas esperadas
                  </label>
                  <select
                    value={videoData.estimatedViews}
                    onChange={(e) => setVideoData(prev => ({ ...prev, estimatedViews: parseInt(e.target.value) }))}
                    className={`w-full px-4 py-3 border ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent`}
                  >
                    <option value={500}>500 - 1K (+0 XP)</option>
                    <option value={1000}>1K - 5K (+25 XP)</option>
                    <option value={5000}>5K+ (+50 XP)</option>
                  </select>
                </div>
              </div>

              <div className={`${isDark ? 'bg-yellow-900/50 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className={`font-semibold ${textPrimary}`}>Recompensa XP</span>
                </div>
                <div className={`text-sm ${textSecondary}`}>
                  Ganarás{' '}
                  <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {(categories.find(cat => cat.value === videoData.category)?.xp || 100) + 
                     (videoData.estimatedViews > 5000 ? 50 : videoData.estimatedViews > 1000 ? 25 : 0)} XP
                  </span>{' '}
                  por este video
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-6 py-3 border ${border} ${textPrimary} rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} font-medium transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg font-medium transition-all"
                >
                  ¡Registrar Video!
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const VideoUploadButton = () => {
  const { config } = useAppConfig();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addVideo, completeTask } = useUserStats();
  const { addVideoThisWeek } = useWeeklyVideoTracker();
  
  const handleVideoUploaded = (xp: number) => {
    addVideo();
    addVideoThisWeek();
    completeTask(xp);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">¡Video registrado! +XP ganado</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all h-full"
      >
        <Upload className="w-5 h-5" />
        ¡He subido un video!
      </motion.button>

      {/* Modal */}
      <VideoUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVideoUploaded={handleVideoUploaded}
        isDark={config.theme.darkMode}
      />
    </>
  );
};