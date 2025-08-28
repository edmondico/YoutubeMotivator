'use client';

import { useState, useEffect } from 'react';
import { useAppConfig } from './useAppConfig';
import { useTasks } from './useTasks';
import { useRealYouTubeStats } from './useRealYouTubeStats';

interface Notification {
  id: string;
  type: 'task' | 'youtube' | 'goal' | 'celebration';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export const useNotifications = () => {
  const { config } = useAppConfig();
  const { tasks } = useTasks();
  const { stats } = useRealYouTubeStats();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Browser notification si están habilitadas
    if (config.notifications.enabled && permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Verificar condiciones para notificaciones automáticas
  useEffect(() => {
    if (!config.notifications.enabled) return;

    const checkConditions = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Recordatorio de tareas pendientes
      if (config.notifications.taskReminders) {
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent');
        
        if (urgentTasks.length > 0 && [9, 14, 18].includes(currentHour)) {
          addNotification({
            type: 'task',
            title: '🚨 Tareas Urgentes Pendientes',
            message: `Tienes ${urgentTasks.length} tareas urgentes por completar. ¡Vamos a por ellas!`,
            action: {
              label: 'Ver tareas',
              handler: () => console.log('Navigate to tasks')
            }
          });
        }
      }

      // Recordatorio de YouTube
      if (config.notifications.youtubeReminders && stats) {
        if (stats.daysSinceLastVideo >= 3 && [10, 16, 20].includes(currentHour)) {
          addNotification({
            type: 'youtube',
            title: '📺 Tu canal te necesita',
            message: `Han pasado ${stats.daysSinceLastVideo} días sin subir contenido. ¡Es hora de crear!`,
            action: {
              label: 'Ver estadísticas',
              handler: () => console.log('Navigate to youtube stats')
            }
          });
        }
      }
    };

    // Verificar cada 30 minutos
    const interval = setInterval(checkConditions, 30 * 60 * 1000);
    checkConditions(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [config.notifications, tasks, stats]);

  // Celebraciones automáticas
  const celebrate = (type: 'task_completed' | 'level_up' | 'goal_achieved', message: string) => {
    addNotification({
      type: 'celebration',
      title: '🎉 ¡Celebración!',
      message,
    });
  };

  // Detectar logros
  useEffect(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const todayCompleted = completedTasks.filter(t => 
      t.completedAt && t.completedAt.toDateString() === new Date().toDateString()
    );

    // Celebrar metas diarias
    if (todayCompleted.length >= config.goals.dailyTasksTarget) {
      const lastCelebration = localStorage.getItem('last-daily-goal-celebration');
      const today = new Date().toDateString();
      
      if (lastCelebration !== today) {
        celebrate('goal_achieved', `¡Has completado ${todayCompleted.length} tareas hoy! Meta diaria alcanzada 🏆`);
        localStorage.setItem('last-daily-goal-celebration', today);
      }
    }
  }, [tasks, config.goals.dailyTasksTarget]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    permission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    celebrate,
  };
};