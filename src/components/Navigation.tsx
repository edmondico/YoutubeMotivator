'use client';

import { ViewMode } from '@/types';
import { Home, Calendar, BarChart3, Settings, Moon, Sun, Youtube, User, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationCenter } from './NotificationCenter';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useUserStats } from '@/hooks/useUserStats';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const navItems = [
  {
    id: 'dashboard' as ViewMode,
    label: 'Dashboard',
    icon: Home,
    emoji: '🏠',
    description: 'Vista principal'
  },
  {
    id: 'calendar' as ViewMode,
    label: 'Calendario',
    icon: Calendar,
    emoji: '📅',
    description: 'Planificación semanal'
  },
  {
    id: 'analytics' as ViewMode,
    label: 'Analíticas',
    icon: BarChart3,
    emoji: '📊',
    description: 'Estadísticas y progreso'
  },
  {
    id: 'youtube-analytics' as ViewMode,
    label: 'Estadísticas YT',
    icon: Youtube,
    emoji: '🚀',
    description: 'Análisis del canal de YouTube'
  },
  {
    id: 'ideas' as ViewMode,
    label: 'Ideas',
    icon: Lightbulb,
    emoji: '💡',
    description: 'Banco de ideas para videos'
  },
  {
    id: 'profile' as ViewMode,
    label: 'Perfil',
    icon: User,
    emoji: '👤',
    description: 'Tu perfil, logros y estadísticas'
  },
  {
    id: 'config' as ViewMode,
    label: 'Configuración',
    icon: Settings,
    emoji: '⚙️',
    description: 'Objetivos y ajustes'
  },
];

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { config, updateConfig } = useAppConfig();
  const { stats } = useUserStats();
  
  const toggleDarkMode = () => {
    updateConfig({
      theme: {
        ...config.theme,
        darkMode: !config.theme.darkMode,
      }
    });
  };

  return (
    <div className={`rounded-xl shadow-lg border mb-8 transition-colors duration-300 ${
      config.theme.darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between p-6">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎮</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PokeBim Motivator
            </h1>
            <p className={`text-sm ${config.theme.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tu entrenador PokéTuber
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                    : config.theme.darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
                title={item.description}
              >
                <span className="text-lg">{item.emoji}</span>
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Quick Stats & Notifications */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span className="font-medium">{stats.streak} días</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium">Nivel {stats.level}</span>
          </div>
          
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              config.theme.darkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
            }`}
            title={config.theme.darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {config.theme.darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
          
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};