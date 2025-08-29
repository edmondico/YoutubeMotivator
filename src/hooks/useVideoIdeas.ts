'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/AuthProvider';

export interface IdeaGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VideoIdea {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  score: number; // 1-10
  tags: string[];
  notes?: string;
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'uploaded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useVideoIdeas = () => {
  const [groups, setGroups] = useState<IdeaGroup[]>([]);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const supabase = createClient();

  // Initialize default groups if none exist
  const initializeDefaultGroups = useCallback(async () => {
    if (!user) {
      setError('Debes iniciar sesión para crear grupos de ideas.');
      return;
    }

    try {
      const { data: existingGroups } = await supabase
        .from('idea_groups')
        .select('id')
        .eq('user_id', user.id);

      if (existingGroups && existingGroups.length === 0) {
        const defaultGroups = [
          { name: 'Bangers', description: 'Ideas que van a ser éxito seguro', color: '#10B981', sort_order: 1 },
          { name: 'Buenos', description: 'Ideas sólidas, buen potencial', color: '#3B82F6', sort_order: 2 },
          { name: 'Mid', description: 'Ideas normales, para rellenar', color: '#6B7280', sort_order: 3 }
        ];

        for (const group of defaultGroups) {
          await supabase
            .from('idea_groups')
            .insert({
              user_id: user.id,
              ...group
            });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al inicializar grupos de ideas');
      }
      console.error('Error initializing default groups:', error);
    }
  }, [user, supabase]);

  // Load groups
  const loadGroups = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('idea_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;
      setGroups(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al cargar grupos de ideas');
      }
    }
  }, [user, supabase]);

  // Load ideas
  const loadIdeas = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;
      setIdeas(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al cargar ideas');
      }
    }
  }, [user, supabase]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await initializeDefaultGroups();
      await Promise.all([loadGroups(), loadIdeas()]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, initializeDefaultGroups, loadGroups, loadIdeas]);

  // Group management
  const addGroup = useCallback(async (name: string, description?: string, color: string = '#3B82F6') => {
    if (!user) {
      setError('Debes iniciar sesión para crear grupos de ideas.');
      return null;
    }

    try {
      const maxOrder = Math.max(...groups.map(g => g.sort_order), 0);
      
      const { data, error } = await supabase
        .from('idea_groups')
        .insert({
          user_id: user.id,
          name,
          description,
          color,
          sort_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;
      
      setGroups(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al crear grupo de ideas');
      }
      return null;
    }
  }, [user, groups, supabase]);

  const updateGroup = useCallback(async (id: string, updates: Partial<Omit<IdeaGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('idea_groups')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setGroups(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates } : g)
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al actualizar grupo de ideas');
      }
      return false;
    }
  }, [user, supabase]);

  const deleteGroup = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      // First, delete all ideas in this group
      await supabase
        .from('video_ideas')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);

      // Then delete the group
      const { error } = await supabase
        .from('idea_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setGroups(prev => prev.filter(g => g.id !== id));
      setIdeas(prev => prev.filter(i => i.group_id !== id));
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al eliminar grupo de ideas');
      }
      return false;
    }
  }, [user, supabase]);

  // Ideas management
  const addIdea = useCallback(async (groupId: string, title: string, description?: string, score: number = 5) => {
    if (!user) return null;

    try {
      const groupIdeas = ideas.filter(i => i.group_id === groupId);
      const maxOrder = Math.max(...groupIdeas.map(i => i.sort_order), 0);

      const { data, error } = await supabase
        .from('video_ideas')
        .insert({
          user_id: user.id,
          group_id: groupId,
          title,
          description,
          score,
          sort_order: maxOrder + 1,
          tags: []
        })
        .select()
        .single();

      if (error) throw error;
      
      setIdeas(prev => [...prev, data].sort((a, b) => {
        if (a.group_id !== b.group_id) return 0;
        return a.sort_order - b.sort_order;
      }));
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al crear idea');
      }
      return null;
    }
  }, [user, ideas, supabase]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Omit<VideoIdea, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('video_ideas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al actualizar idea');
      }
      return false;
    }
  }, [user, supabase]);

  const deleteIdea = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('video_ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIdeas(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al eliminar idea');
      }
      return false;
    }
  }, [user, supabase]);

  // Reorder ideas within a group
  const reorderIdeas = useCallback(async (groupId: string, ideaIds: string[]) => {
    if (!user) return false;

    try {
      const updates = ideaIds.map((ideaId, index) => ({
        id: ideaId,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('video_ideas')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      setIdeas(prev => 
        prev.map(idea => {
          const newOrderIndex = ideaIds.indexOf(idea.id);
          return newOrderIndex >= 0 ? { ...idea, sort_order: newOrderIndex } : idea;
        }).sort((a, b) => {
          if (a.group_id !== b.group_id) return 0;
          return a.sort_order - b.sort_order;
        })
      );
      
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al reordenar ideas');
      }
      return false;
    }
  }, [user, supabase]);

  // Get ideas by group
  const getIdeasByGroup = useCallback((groupId: string) => {
    return ideas
      .filter(idea => idea.group_id === groupId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [ideas]);

  // Get top ideas across all groups
  const getTopIdeas = useCallback((limit: number = 5) => {
    return [...ideas]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [ideas]);

  // Stats
  const stats = {
    totalIdeas: ideas.length,
    ideasByStatus: {
      idea: ideas.filter(i => i.status === 'idea').length,
      scripting: ideas.filter(i => i.status === 'scripting').length,
      filming: ideas.filter(i => i.status === 'filming').length,
      editing: ideas.filter(i => i.status === 'editing').length,
      uploaded: ideas.filter(i => i.status === 'uploaded').length,
    },
    averageScore: ideas.length > 0 ? ideas.reduce((acc, i) => acc + i.score, 0) / ideas.length : 0,
    topScoringIdeas: getTopIdeas(3)
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  return {
    groups,
    ideas,
    loading,
    error,
    stats,
    
    // Group methods
    addGroup,
    updateGroup,
    deleteGroup,
    
    // Idea methods
    addIdea,
    updateIdea,
    deleteIdea,
    reorderIdeas,
    getIdeasByGroup,
    getTopIdeas,
    
    // Refresh
    refresh: loadData
  };
};