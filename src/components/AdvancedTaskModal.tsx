'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flag, Tag, Calendar, Zap } from 'lucide-react';
import { Task } from '@/types';

interface AdvancedTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  scheduledDate?: Date;
  isDark: boolean;
}

const priorityOptions = [
  { value: 'low', label: 'Baja', emoji: '🟢' },
  { value: 'medium', label: 'Media', emoji: '🟡' },
  { value: 'high', label: 'Alta', emoji: '🟠' },
  { value: 'urgent', label: 'Urgente', emoji: '🔴' },
];

const categoryOptions = [
  { value: 'video-creation', label: 'Creación de Video', emoji: '🎬', xp: 50 },
  { value: 'editing', label: 'Edición', emoji: '✂️', xp: 40 },
  { value: 'research', label: 'Investigación', emoji: '🔍', xp: 20 },
  { value: 'marketing', label: 'Marketing/Promoción', emoji: '📢', xp: 30 },
  { value: 'other', label: 'Otros', emoji: '📝', xp: 10 },
];

const timePresets = [15, 30, 60, 120, 240];

export const AdvancedTaskModal = ({ isOpen, onClose, onAddTask, scheduledDate, isDark }: AdvancedTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedDuration: 60,
    priority: 'medium' as const,
    category: 'video-creation' as const,
    dueDate: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      estimatedDuration: 60,
      priority: 'medium',
      category: 'video-creation',
      dueDate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);
    const baseXP = selectedCategory?.xp || 10;
    const priorityMultiplier = {
      low: 1,
      medium: 1.2,
      high: 1.5,
      urgent: 2
    }[formData.priority];
    const durationMultiplier = Math.max(0.5, formData.estimatedDuration / 60);
    
    const calculatedXP = Math.round(baseXP * priorityMultiplier * durationMultiplier);

    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      estimatedDuration: formData.estimatedDuration,
      priority: formData.priority,
      category: formData.category,
      status: 'pending',
      xpReward: calculatedXP,
      scheduledDate: scheduledDate,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    };

    onAddTask(newTask);
    resetForm();
    onClose();
  };

  // Estilos condicionales
  const bgModal = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-600' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const ringFocus = isDark ? 'focus:ring-purple-400' : 'focus:ring-purple-500';

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
          className={`${bgModal} rounded-2xl shadow-2xl max-w-6xl w-full h-[95vh] flex flex-col`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${border}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>Nueva Tarea</h2>
                <p className={`text-sm ${textSecondary}`}>Crea una tarea para tu canal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${hoverBg} rounded-full transition-colors`}
            >
              <X className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-3`}>
                    📝 Título de la tarea *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-6 py-4 text-lg border-2 ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent transition-colors`}
                    placeholder="Ej: Grabar intro del video de Pokémon"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-3`}>
                    📄 Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-6 py-4 text-base border-2 ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent transition-colors resize-none`}
                    rows={6}
                    placeholder="Detalles adicionales sobre la tarea..."
                  />
                </div>

                {/* Tiempo Estimado */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-4`}>
                    <Clock className="w-5 h-5 inline mr-2" />
                    Tiempo estimado
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="15"
                        max="480"
                        step="15"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                        className={`flex-1 h-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer slider`}
                      />
                      <span className={`text-lg font-bold ${isDark ? 'text-purple-300 bg-purple-900/50' : 'text-purple-600 bg-purple-50'} px-4 py-2 rounded-xl min-w-[90px] text-center`}>
                        {formData.estimatedDuration}min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {timePresets.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, estimatedDuration: time }))}
                          className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-colors ${
                            formData.estimatedDuration === time
                              ? isDark ? 'bg-purple-500 border-purple-500 text-white' : 'bg-purple-100 border-purple-300 text-purple-700'
                              : `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} ${textSecondary} ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
                          }`}
                        >
                          {time}min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-3`}>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Fecha límite (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full px-6 py-4 text-lg border-2 ${border} ${inputBg} ${textPrimary} rounded-xl focus:ring-2 ${ringFocus} focus:border-transparent transition-colors`}
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Categoría */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-4`}>
                    <Tag className="w-5 h-5 inline mr-2" />
                    Categoría
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {categoryOptions.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          formData.category === category.value
                            ? isDark ? 'border-purple-400 bg-purple-900/30' : 'border-purple-300 bg-purple-50'
                            : `${border} ${isDark ? 'hover:border-gray-500 bg-gray-700' : 'hover:border-gray-300 bg-gray-50'}`
                        }`}
                      >
                        <span className="text-2xl">{category.emoji}</span>
                        <div className="flex-1">
                          <div className={`font-semibold text-base ${textPrimary}`}>{category.label}</div>
                          <div className={`text-sm ${textSecondary}`}>+{category.xp} XP base</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prioridad */}
                <div>
                  <label className={`block text-lg font-semibold ${textPrimary} mb-4`}>
                    <Flag className="w-5 h-5 inline mr-2" />
                    Prioridad
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {priorityOptions.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          formData.priority === priority.value
                            ? isDark ? 'border-purple-400 bg-purple-900/30' : 'border-purple-300 bg-purple-100'
                            : `${border} ${isDark ? 'hover:border-gray-500 bg-gray-700' : 'hover:border-gray-300 bg-gray-50'}`
                        }`}
                      >
                        <span className="text-xl">{priority.emoji}</span>
                        <span className={`font-semibold text-base ${textPrimary}`}>{priority.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* XP Preview */}
                <div className={`${isDark ? 'bg-yellow-900/50 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border-2 rounded-xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⭐</span>
                    <span className={`font-bold text-lg ${textPrimary}`}>Recompensa XP</span>
                  </div>
                  <div className={`text-base ${textSecondary} mb-2`}>
                    Esta tarea otorgará al completarse:
                  </div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mb-2`}>
                    {Math.round(
                      (categoryOptions.find(cat => cat.value === formData.category)?.xp || 10) *
                      ({ low: 1, medium: 1.2, high: 1.5, urgent: 2 }[formData.priority]) *
                      Math.max(0.5, formData.estimatedDuration / 60)
                    )} XP
                  </div>
                  <div className={`text-sm ${textSecondary}`}>
                    Base: {categoryOptions.find(cat => cat.value === formData.category)?.xp || 10} XP • 
                    Prioridad: ×{({ low: 1, medium: 1.2, high: 1.5, urgent: 2 }[formData.priority])} • 
                    Tiempo: ×{Math.max(0.5, formData.estimatedDuration / 60).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones - pegados al fondo */}
            <div className={`p-6 border-t ${border} bg-opacity-50 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-8 py-4 text-lg border-2 ${border} ${textPrimary} rounded-xl ${hoverBg} font-semibold transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.title.trim()}
                >
                  Crear Tarea
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};