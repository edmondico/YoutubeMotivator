'use client';

import { useState } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useDataExport } from '@/hooks/useDataExport';
import { motion } from 'framer-motion';
import { 
  Target, 
  Save, 
  RotateCcw, 
  Youtube, 
  Eye, 
  Users, 
  Calendar,
  CheckCircle,
  Flame,
  Bell,
  Palette,
  Key,
  Download,
  Upload,
  FileText
} from 'lucide-react';

export const ConfigPage = () => {
  const { config, updateConfig, updateGoals, resetConfig, loading } = useAppConfig();
  const { exportToJSON, exportToCSV, generateProgressReport } = useDataExport();
  const [formData, setFormData] = useState(config);
  const [activeTab, setActiveTab] = useState<'goals' | 'channel' | 'notifications' | 'appearance' | 'data'>('goals');

  const isDark = config.theme.darkMode;

  const handleSave = () => {
    updateConfig(formData);
    // For a real app, you'd show a toast notification here
    alert('¡Configuración guardada!');
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear toda la configuración a los valores por defecto?')) {
      resetConfig();
      setFormData(config);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Conditional styles
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const bgBase = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const ringFocus = isDark ? 'focus:ring-blue-400' : 'focus:ring-blue-500';
  const hoverSubtle = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const tabs = [
    { id: 'goals', label: 'Objetivos', icon: Target, emoji: '🎯' },
    { id: 'channel', label: 'Canal YouTube', icon: Youtube, emoji: '📺' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, emoji: '🔔' },
    { id: 'appearance', label: 'Apariencia', icon: Palette, emoji: '🎨' },
    { id: 'data', label: 'Datos', icon: Download, emoji: '💾' }
  ];

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className={`w-11 h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 ${isDark ? 'peer-focus:ring-blue-800' : 'peer-focus:ring-blue-300'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'peer-checked:bg-blue-500' : 'peer-checked:bg-blue-600'}`}></div>
    </label>
  );

  const GoalInputCard = ({ icon, title, description, value, onChange, type = 'number', ...props }: any) => (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className={`font-medium ${textPrimary}`}>{title}</h3>
        </div>
        <p className={`text-sm ${textSecondary} mb-3 h-10`}>{description}</p>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 border ${inputBorder} ${inputBg} rounded-lg focus:outline-none focus:ring-2 ${ringFocus}`}
            {...props}
        />
    </div>
);

return (
    <div className={`rounded-xl p-6 shadow-lg ${bgBase}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Configuración</h2>
            <p className={`text-sm ${textSecondary}`}>Personaliza tus objetivos y preferencias</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-3 py-2 border ${inputBorder} ${textSecondary} rounded-lg ${hoverSubtle} transition-colors`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Resetear</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">Guardar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 mb-6 border-b ${border}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all
                ${isActive 
                  ? `${isDark ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-600'} border-b-2 border-blue-500` 
                  : `${textSecondary} ${isDark ? 'hover:text-gray-200 hover:bg-gray-700' : 'hover:text-gray-800 hover:bg-gray-50'}`
                }
              `}
            >
              <span>{tab.emoji}</span>
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GoalInputCard 
                    icon={<Eye className="w-5 h-5 text-blue-500" />} 
                    title="Vistas diarias objetivo"
                    description="Número de vistas que quieres alcanzar diariamente."
                    value={formData.goals.dailyViewsTarget}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, dailyViewsTarget: parseInt(e.target.value) }})}
                    min="0"
                />
                <GoalInputCard 
                    icon={<Users className="w-5 h-5 text-red-500" />} 
                    title="Suscriptores objetivo"
                    description="Meta de suscriptores que quieres alcanzar."
                    value={formData.goals.subscribersTarget}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, subscribersTarget: parseInt(e.target.value) }})}
                    min="0"
                />
                <GoalInputCard 
                    icon={<Calendar className="w-5 h-5 text-green-500" />} 
                    title="Fecha límite para suscriptores"
                    description="Cuándo quieres alcanzar tu meta de suscriptores."
                    type="date"
                    value={formData.goals.subscribersTargetDate.toISOString().split('T')[0]}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, subscribersTargetDate: new Date(e.target.value) }})}
                />
                <GoalInputCard 
                    icon={<Youtube className="w-5 h-5 text-red-500" />} 
                    title="Videos por semana"
                    description="Cuántos videos quieres subir semanalmente."
                    value={formData.goals.videosPerWeek}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, videosPerWeek: parseInt(e.target.value) }})}
                    min="1" max="7"
                />
                <GoalInputCard 
                    icon={<CheckCircle className="w-5 h-5 text-purple-500" />} 
                    title="Tareas diarias objetivo"
                    description="Número de tareas que quieres completar diariamente."
                    value={formData.goals.dailyTasksTarget}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, dailyTasksTarget: parseInt(e.target.value) }})}
                    min="1" max="20"
                />
                <GoalInputCard 
                    icon={<Flame className="w-5 h-5 text-orange-500" />} 
                    title="Racha objetivo (días)"
                    description="Días consecutivos de actividad que quieres mantener."
                    value={formData.goals.streakTarget}
                    onChange={(e: any) => setFormData({ ...formData, goals: { ...formData.goals, streakTarget: parseInt(e.target.value) }})}
                    min="7" max="365"
                />
            </div>
          </motion.div>
        )}

        {activeTab === 'channel' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`${isDark ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
              <h3 className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'} mb-2`}>📖 ¿Primera vez configurando?</h3>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Si necesitas ayuda para obtener tu API Key y Channel ID, tenemos una guía paso a paso.
              </p>
            </div>

            <div className="max-w-lg space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <label className={`font-medium ${textPrimary}`}>Nombre del canal</label>
                </div>
                <input
                  type="text"
                  value={formData.channelName || ''}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  className={`w-full px-4 py-3 border ${inputBorder} ${inputBg} rounded-lg focus:outline-none focus:ring-2 ${ringFocus}`}
                  placeholder="PokeBim"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-yellow-500" />
                  <label className={`font-medium ${textPrimary}`}>YouTube API Key</label>
                </div>
                <input
                  type="password"
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className={`w-full px-4 py-3 border ${inputBorder} ${inputBg} rounded-lg focus:outline-none focus:ring-2 ${ringFocus}`}
                  placeholder="Opcional: para datos reales de YouTube"
                />
                <p className={`text-sm ${textSecondary}`}>
                  Opcional: Para obtener estadísticas reales de tu canal. 
                  <a href="https://console.developers.google.com/" target="_blank" className="text-blue-600 hover:underline ml-1">
                    Obtén tu API Key aquí
                  </a>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🆔</span>
                  <label className={`font-medium ${textPrimary}`}>Channel ID</label>
                </div>
                <input
                  type="text"
                  value={formData.channelId || ''}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  className={`w-full px-4 py-3 border ${inputBorder} ${inputBg} rounded-lg focus:outline-none focus:ring-2 ${ringFocus}`}
                  placeholder="UCi22Ce1p-tDw6e7_WfsjPFg"
                />
                <p className={`text-sm ${textSecondary}`}>
                  ID de tu canal de YouTube (encuentra en tu URL del canal)
                </p>
                <div className={`${isDark ? 'bg-yellow-900/50 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded p-2`}>
                  <p className={`text-xs ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    💡 <strong>Tip:</strong> Si tu URL es youtube.com/channel/UCxxxxx, tu Channel ID es UCxxxxx
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${textPrimary}`}>Activar notificaciones</h3>
                  <p className={`text-sm ${textSecondary}`}>Recibe recordatorios para mantener tu productividad</p>
                </div>
                <ToggleSwitch 
                    checked={formData.notifications.enabled} 
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, enabled: e.target.checked }})} 
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Recordatorios de tareas</h4>
                    <p className={`text-sm ${textSecondary}`}>Te recordaremos completar tus tareas pendientes</p>
                  </div>
                  <ToggleSwitch 
                    checked={formData.notifications.taskReminders} 
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, taskReminders: e.target.checked }})} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Recordatorios de YouTube</h4>
                    <p className={`text-sm ${textSecondary}`}>Alertas sobre días sin subir contenido</p>
                  </div>
                  <ToggleSwitch 
                    checked={formData.notifications.youtubeReminders} 
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, youtubeReminders: e.target.checked }})} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${textPrimary}`}>Modo oscuro</h3>
                  <p className={`text-sm ${textSecondary}`}>Cambiar entre tema claro y oscuro</p>
                </div>
                <ToggleSwitch 
                    checked={formData.theme.darkMode} 
                    onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, darkMode: e.target.checked }})} 
                />
              </div>

              <div className="border-t pt-4">
                <h4 className={`font-medium ${textPrimary} mb-3`}>Color primario</h4>
                <div className="flex items-center gap-3">
                  {[
                    '#3b82f6', // blue
                    '#8b5cf6', // violet  
                    '#10b981', // emerald
                    '#f59e0b', // amber
                    '#ef4444', // red
                    '#ec4899', // pink
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, theme: { ...formData.theme, primaryColor: color }})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.theme.primaryColor === color ? `${isDark ? 'border-white' : 'border-gray-800'} scale-110` : `${inputBorder} hover:scale-105'}`}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Exportar datos completos */}
              <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'} rounded-xl p-6 text-center`}>
                <Download className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'} mb-2`}>Backup Completo</h3>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'} mb-4`}>Exporta todas tus tareas, configuración y progreso en formato JSON</p>
                <button onClick={exportToJSON} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Descargar JSON</button>
              </div>

              {/* Exportar tareas CSV */}
              <div className={`${isDark ? 'bg-green-900/50' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'} rounded-xl p-6 text-center`}>
                <FileText className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className={`font-semibold ${isDark ? 'text-green-200' : 'text-green-800'} mb-2`}>Exportar Tareas</h3>
                <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'} mb-4`}>Descarga tus tareas en formato CSV para análisis externo</p>
                <button onClick={exportToCSV} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">Descargar CSV</button>
              </div>

              {/* Reporte de progreso */}
              <div className={`${isDark ? 'bg-purple-900/50' : 'bg-purple-50'} border ${isDark ? 'border-purple-700' : 'border-purple-200'} rounded-xl p-6 text-center`}>
                <span className="text-4xl block mb-3">📊</span>
                <h3 className={`font-semibold ${isDark ? 'text-purple-200' : 'text-purple-800'} mb-2`}>Reporte de Progreso</h3>
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'} mb-4`}>Genera un reporte detallado de tu productividad y logros</p>
                <button onClick={generateProgressReport} className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">Generar Reporte</button>
              </div>
            </div>

            <div className={`border-t ${border} pt-6`}>
              <div className={`${isDark ? 'bg-yellow-900/50' : 'bg-yellow-50'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'} rounded-xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>Gestión de Datos</h3>
                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>Administra tus datos de forma segura</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className={`font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>Backup automático</h4>
                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      Tus datos se guardan automáticamente en el navegador. Te recomendamos hacer backups regulares.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>Importar datos</h4>
                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'} mb-2`}>
                      Restaura un backup previo (función próximamente)
                    </p>
                    <button disabled className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed">
                      <Upload className="w-4 h-4 inline-block mr-2" />
                      Próximamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};