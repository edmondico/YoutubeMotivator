'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  isDark: boolean;
}

export const AddTaskForm = ({ onAddTask, isDark }: AddTaskFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: 'video-creation' as Task['category'],
    estimatedDuration: 60,
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const xpReward = {
      low: 10,
      medium: 25,
      high: 50,
      urgent: 100,
    }[formData.priority];

    onAddTask({
      ...formData,
      status: 'pending',
      xpReward,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'video-creation',
      estimatedDuration: 60,
      dueDate: '',
    });
    setIsOpen(false);
  };

  const textPrimary = isDark ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-700';
  const bgForm = isDark ? 'bg-gray-800' : 'bg-white';
  const border = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const ringFocus = isDark ? 'focus:ring-blue-400' : 'focus:ring-blue-500';

  return (
    <div>
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className={`w-full p-4 border-2 border-dashed ${isDark ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'} rounded-lg transition-colors flex items-center justify-center gap-2`}
        >
          <Plus className="w-5 h-5" />
          <span>Agregar nueva tarea</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className={`p-4 ${bgForm} rounded-lg border-2 ${isDark ? 'border-blue-800' : 'border-blue-200'} space-y-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold ${textPrimary}`}>Nueva Tarea 🎯</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`p-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  placeholder="Ej: Grabar intro del video de Pokémon"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  placeholder="Detalles adicionales..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🟠 Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })}
                    className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  >
                    <option value="video-creation">🎬 Creación</option>
                    <option value="editing">✂️ Edición</option>
                    <option value="research">🔍 Investigación</option>
                    <option value="marketing">📢 Marketing</option>
                    <option value="other">📝 Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 border ${border} ${inputBg} ${textPrimary} rounded-md focus:outline-none focus:ring-2 ${ringFocus}`}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  ✨ Crear Tarea
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 ${textSecondary} border ${border} rounded-md ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};