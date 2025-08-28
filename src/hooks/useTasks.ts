'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('pokebim-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
      setTasks(parsedTasks);
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('pokebim-tasks', JSON.stringify(newTasks));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    saveTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id 
        ? { 
            ...task, 
            ...updates,
            completedAt: updates.status === 'completed' && !task.completedAt ? new Date() : task.completedAt
          }
        : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByPriority = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  };

  const getTodayTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.toDateString() === today.toDateString();
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getTodayTasks,
  };
};