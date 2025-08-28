'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { createClient } from '@/utils/supabase/client';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      const formattedTasks = data.map((task: any) => ({
        ...task,
        createdAt: new Date(task.created_at),
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        scheduledDate: task.scheduled_date ? new Date(task.scheduled_date) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        estimatedDuration: task.estimated_duration,
        actualDuration: task.actual_duration,
        xpReward: task.xp_reward,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          estimated_duration: taskData.estimatedDuration,
          actual_duration: taskData.actualDuration,
          due_date: taskData.dueDate?.toISOString(),
          scheduled_date: taskData.scheduledDate?.toISOString(),
          category: taskData.category,
          xp_reward: taskData.xpReward,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      const newTask: Task = {
        ...taskData,
        id: data.id,
        createdAt: new Date(data.created_at),
      };

      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.estimatedDuration !== undefined) updateData.estimated_duration = updates.estimatedDuration;
      if (updates.actualDuration !== undefined) updateData.actual_duration = updates.actualDuration;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
      if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate?.toISOString();
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.xpReward !== undefined) updateData.xp_reward = updates.xpReward;
      
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(prev => prev.map(task =>
        task.id === id 
          ? { 
              ...task, 
              ...updates,
              completedAt: updates.status === 'completed' && !task.completedAt ? new Date() : task.completedAt
            }
          : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
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
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getTodayTasks,
    loadTasks,
  };
};