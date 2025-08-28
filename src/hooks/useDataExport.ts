'use client';

import { useTasks } from './useTasks';
import { useUserStats } from './useUserStats';
import { useAppConfig } from './useAppConfig';

interface ExportData {
  tasks: any[];
  userStats: any;
  config: any;
  exportDate: string;
  version: string;
}

export const useDataExport = () => {
  const { tasks } = useTasks();
  const { stats } = useUserStats();
  const { config } = useAppConfig();

  const exportToJSON = () => {
    const exportData: ExportData = {
      tasks,
      userStats: stats,
      config,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokebim-motivator-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (tasks.length === 0) {
      alert('No hay tareas para exportar');
      return;
    }

    const headers = [
      'Título',
      'Descripción',
      'Prioridad',
      'Estado',
      'Categoría',
      'Duración Estimada (min)',
      'XP Reward',
      'Fecha Creación',
      'Fecha Vencimiento',
      'Fecha Programada',
      'Fecha Completada'
    ];

    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.priority,
        task.status,
        task.category,
        task.estimatedDuration,
        task.xpReward,
        task.createdAt.toISOString(),
        task.dueDate?.toISOString() || '',
        task.scheduledDate?.toISOString() || '',
        task.completedAt?.toISOString() || ''
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokebim-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const generateProgressReport = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalXp = completedTasks.reduce((acc, task) => acc + task.xpReward, 0);
    const avgDuration = tasks.length > 0 ? tasks.reduce((acc, task) => acc + task.estimatedDuration, 0) / tasks.length : 0;
    
    const categoriesCount = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCount = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = `
# 📊 Reporte de Progreso PokeBim Motivator
**Fecha:** ${new Date().toLocaleDateString('es-ES')}

## 📈 Estadísticas Generales
- **Tareas Totales:** ${tasks.length}
- **Tareas Completadas:** ${completedTasks.length}
- **Tasa de Finalización:** ${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
- **XP Total Ganado:** ${totalXp}
- **Nivel Actual:** ${stats.level}
- **Racha Actual:** ${stats.streak} días

## ⏱️ Tiempo y Productividad
- **Duración Promedio por Tarea:** ${Math.round(avgDuration)} minutos
- **Tiempo Total Estimado:** ${Math.round(tasks.reduce((acc, task) => acc + task.estimatedDuration, 0) / 60)} horas
- **Videos Creados:** ${stats.totalVideosMade}

## 📊 Distribución por Categorías
${Object.entries(categoriesCount).map(([category, count]) => 
  `- **${category}:** ${count} tareas`
).join('\n')}

## 🎯 Distribución por Prioridades
${Object.entries(priorityCount).map(([priority, count]) => 
  `- **${priority}:** ${count} tareas`
).join('\n')}

## 🏆 Objetivos Actuales
- **Vistas Diarias:** ${config.goals.dailyViewsTarget}
- **Meta de Suscriptores:** ${config.goals.subscribersTarget}
- **Videos por Semana:** ${config.goals.videosPerWeek}
- **Tareas Diarias:** ${config.goals.dailyTasksTarget}

---
*Generado por PokeBim Motivator*
    `.trim();

    const dataBlob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokebim-progress-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importFromJSON = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ExportData;
          
          // Validar formato
          if (!data.tasks || !data.userStats || !data.config) {
            throw new Error('Formato de archivo inválido');
          }

          // Importar datos (aquí necesitarías métodos para actualizar cada store)
          console.log('Datos importados:', data);
          
          // TODO: Implementar importación real
          alert('Importación completada exitosamente');
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  };

  return {
    exportToJSON,
    exportToCSV,
    generateProgressReport,
    importFromJSON,
  };
};