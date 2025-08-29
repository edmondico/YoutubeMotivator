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
  group_id: string | null;
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
  const supabase = createClientComponentClient();

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
      // First, update all ideas in this group to be ungrouped
      await supabase
        .from('video_ideas')
        .update({ group_id: null })
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
      setIdeas(prev => prev.map(i => i.group_id === id ? { ...i, group_id: null } : i));
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
  const addIdea = useCallback(async (groupId: string | null, title: string, description?: string, score: number = 5) => {
    if (!user) return null;

    try {
      const relevantIdeas = groupId ? ideas.filter(i => i.group_id === groupId) : ideas.filter(i => !i.group_id);
      const maxOrder = Math.max(...relevantIdeas.map(i => i.sort_order), 0);

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
  const reorderIdeas = useCallback(async (source: { droppableId: string, index: number }, destination: { droppableId: string, index: number }, draggableId: string) => {
    if (!user) return false;

    const { source: sourceInfo, destination: destInfo, draggableId: ideaId } = { source, destination, draggableId };

    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return false;

    const sourceGroupId = sourceInfo.droppableId === 'ungrouped' ? null : sourceInfo.droppableId;
    const destGroupId = destInfo.droppableId === 'ungrouped' ? null : destInfo.droppableId;

    // Optimistic update
    const newIdeas = Array.from(ideas);
    const [movedIdea] = newIdeas.splice(newIdeas.findIndex(i => i.id === ideaId), 1);
    movedIdea.group_id = destGroupId;

    const destIdeas = newIdeas.filter(i => i.group_id === destGroupId);
    destIdeas.splice(destInfo.index, 0, movedIdea);

    // Update sort order for destination list
    destIdeas.forEach((item, index) => {
      item.sort_order = index;
    });

    // Update sort order for source list if different
    if (sourceGroupId !== destGroupId) {
      const sourceIdeas = newIdeas.filter(i => i.group_id === sourceGroupId);
      sourceIdeas.forEach((item, index) => {
        item.sort_order = index;
      });
    }

    setIdeas(newIdeas);

    try {
      // Update moved idea in DB
      await supabase
        .from('video_ideas')
        .update({ group_id: destGroupId, sort_order: destInfo.index })
        .eq('id', ideaId)
        .eq('user_id', user.id);

      // Update sort order of other ideas in destination group
      for (let i = 0; i < destIdeas.length; i++) {
        if (destIdeas[i].id !== ideaId) {
          await supabase
            .from('video_ideas')
            .update({ sort_order: i })
            .eq('id', destIdeas[i].id)
            .eq('user_id', user.id);
        }
      }

      // Update sort order of ideas in source group if different
      if (sourceGroupId !== destGroupId) {
        const sourceIdeas = ideas.filter(i => i.group_id === sourceGroupId);
        for (let i = 0; i < sourceIdeas.length; i++) {
          await supabase
            .from('video_ideas')
            .update({ sort_order: i })
            .eq('id', sourceIdeas[i].id)
            .eq('user_id', user.id);
        }
      }

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al reordenar ideas');
      }
      // Rollback optimistic update on error
      setIdeas(ideas);
      return false;
    }
  }, [user, ideas, supabase]);

  // Get ideas by group
  const getIdeasByGroup = useCallback((groupId: string | null) => {
    return ideas
      .filter(idea => idea.group_id === groupId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [ideas]);

  const getUngroupedIdeas = useCallback(() => {
    return ideas
      .filter(idea => idea.group_id === null)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [ideas]);
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
    getUngroupedIdeas,
    
    // Refresh
    refresh: loadData
  };
};