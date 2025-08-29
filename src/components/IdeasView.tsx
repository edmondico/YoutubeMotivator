'use client';

import { useState } from 'react';
import { useVideoIdeas, IdeaGroup, VideoIdea } from '@/hooks/useVideoIdeas';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Clock, 
  Tag, 
  MoreVertical,
  Lightbulb,
  TrendingUp,
  Camera,
  Upload,
  CheckCircle
} from 'lucide-react';

interface IdeasViewProps {
  isDark: boolean;
}

export const IdeasView = ({ isDark }: IdeasViewProps) => {
  const { 
    groups, 
    ideas, 
    loading, 
    error, 
    stats,
    addGroup,
    updateGroup, 
    deleteGroup,
    addIdea,
    updateIdea,
    deleteIdea,
    reorderIdeas,
    getIdeasByGroup,
    getUngroupedIdeas
  } = useVideoIdeas();

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IdeaGroup | null>(null);
  const [editingIdea, setEditingIdea] = useState<VideoIdea | null>(null);

  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const bgInner = isDark ? 'bg-gray-700' : 'bg-gray-50';

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    await reorderIdeas(source, destination, draggableId);
  };
  
  const hoverBg = isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100';

  const getStatusIcon = (status: VideoIdea['status']) => {
    switch (status) {
      case 'idea': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'scripting': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'filming': return <Camera className="w-4 h-4 text-red-500" />;
      case 'editing': return <Edit3 className="w-4 h-4 text-purple-500" />;
      case 'uploaded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: VideoIdea['status']) => {
    switch (status) {
      case 'idea': return 'Idea';
      case 'scripting': return 'Escribiendo';
      case 'filming': return 'Grabando';
      case 'editing': return 'Editando';
      case 'uploaded': return 'Subido';
      default: return 'Idea';
    }
  };

  const getPriorityColor = (priority: VideoIdea['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-blue-500 bg-blue-100';
      case 'low': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <Star 
            key={i}
            className={`w-3 h-3 ${i < score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${bgCard} rounded-xl p-8 border flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={textSecondary}>Cargando banco de ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgCard} rounded-xl p-8 border border-red-500`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h2 className={`text-xl font-bold text-red-500 mb-2`}>Error</h2>
          <p className={`text-red-600 mb-4`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className={`${bgCard} rounded-xl p-6 border`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>Banco de Ideas</h1>
              <p className={textSecondary}>Gestiona tus ideas de videos para YouTube</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddGroup(true)}
            className={`flex items-center gap-2 px-4 py-2 ${hoverBg} rounded-lg transition-colors`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Nuevo Grupo</span>
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`${bgInner} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold ${textPrimary}`}>{stats.totalIdeas}</div>
            <div className={`text-sm ${textSecondary}`}>Ideas Totales</div>
          </div>
          <div className={`${bgInner} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold text-yellow-600`}>{stats.ideasByStatus.idea}</div>
            <div className={`text-sm ${textSecondary}`}>Por Hacer</div>
          </div>
          <div className={`${bgInner} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold text-blue-600`}>{stats.ideasByStatus.scripting + stats.ideasByStatus.filming + stats.ideasByStatus.editing}</div>
            <div className={`text-sm ${textSecondary}`}>En Proceso</div>
          </div>
          <div className={`${bgInner} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold text-green-600`}>{stats.ideasByStatus.uploaded}</div>
            <div className={`text-sm ${textSecondary}`}>Completadas</div>
          </div>
        </div>
      </div>

      {/* Groups and Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups sidebar */}
        <div className={`${bgCard} rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Grupos</h3>
          
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGroup('ungrouped')}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedGroup === 'ungrouped'
                  ? 'border-current'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ 
                backgroundColor: selectedGroup === 'ungrouped' ? '#A0A0A020' : 'transparent',
                borderColor: selectedGroup === 'ungrouped' ? '#A0A0A0' : 'transparent'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${textPrimary}`} style={{ color: selectedGroup === 'ungrouped' ? '#A0A0A0' : undefined }}>
                    Banco de Ideas General
                  </div>
                  <div className={`text-xs ${textSecondary}`}>
                    {getUngroupedIdeas().length} ideas
                  </div>
                </div>
              </div>
            </motion.button>

            {groups.map((group) => (
              <motion.button
                key={group.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedGroup === group.id
                    ? 'border-current'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ 
                  backgroundColor: selectedGroup === group.id ? group.color + '20' : 'transparent',
                  borderColor: selectedGroup === group.id ? group.color : 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${textPrimary}`} style={{ color: selectedGroup === group.id ? group.color : undefined }}>
                      {group.name}
                    </div>
                    <div className={`text-xs ${textSecondary}`}>
                      {getIdeasByGroup(group.id).length} ideas
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                    }}
                    className={`p-1 ${hoverBg} rounded`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Ideas main area */}
        <div className="lg:col-span-3 space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {selectedGroup ? (
              <div className={`${bgCard} rounded-xl p-6 border`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>
                      {selectedGroup === 'ungrouped' ? 'Banco de Ideas General' : groups.find(g => g.id === selectedGroup)?.name}
                    </h2>
                    <p className={textSecondary}>
                      {selectedGroup === 'ungrouped' ? 'Ideas sin agrupar' : groups.find(g => g.id === selectedGroup)?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddIdea(true)}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Idea
                  </button>
                </div>

                {/* Ideas list with drag & drop */}
                <Droppable droppableId={selectedGroup}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''} transition-colors rounded-lg p-2`}
                    >
                      {(selectedGroup === 'ungrouped' ? getUngroupedIdeas() : getIdeasByGroup(selectedGroup))
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((idea, index) => (
                        <Draggable key={idea.id} draggableId={idea.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${bgInner} rounded-lg p-4 border transition-all ${
                                snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : hoverBg
                              } ${snapshot.isDragging ? 'z-50' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex items-start gap-3 flex-1 cursor-grab active:cursor-grabbing"
                                >
                                  <div className={`mt-1 ${textSecondary} hover:text-blue-500 transition-colors`}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      {getStatusIcon(idea.status)}
                                      <h3 className={`font-semibold ${textPrimary}`}>{idea.title}</h3>
                                      <div className="flex items-center gap-1">
                                        {renderStars(idea.score)}
                                        <span className={`text-sm font-medium ${textSecondary}`}>({idea.score}/10)</span>
                                      </div>
                                    </div>
                                    
                                    {idea.description && (
                                      <p className={`${textSecondary} text-sm mb-2`}>{idea.description}</p>
                                    )}
                                    
                                    <div className="flex items-center gap-3 text-xs">
                                      <div className={`px-2 py-1 rounded ${getPriorityColor(idea.priority)}`}>
                                        {idea.priority.toUpperCase()}
                                      </div>
                                      <div className={`px-2 py-1 rounded ${textSecondary} bg-gray-200`}>
                                        {getStatusLabel(idea.status)}
                                      </div>
                                      {idea.estimated_duration && (
                                        <div className={`flex items-center gap-1 ${textSecondary}`}>
                                          <Clock className="w-3 h-3" />
                                          {idea.estimated_duration}m
                                        </div>
                                      )}
                                      {idea.tags.length > 0 && (
                                        <div className={`flex items-center gap-1 ${textSecondary}`}>
                                          <Tag className="w-3 h-3" />
                                          {idea.tags.slice(0, 2).join(', ')}{idea.tags.length > 2 ? '...' : ''}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-3">
                                  <button
                                    onClick={() => setEditingIdea(idea)}
                                    className={`p-2 ${hoverBg} rounded transition-colors`}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteIdea(idea.id)}
                                    className={`p-2 text-red-500 ${hoverBg} rounded transition-colors`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                {(selectedGroup === 'ungrouped' ? getUngroupedIdeas() : getIdeasByGroup(selectedGroup)).length === 0 && (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay ideas aquí</p>
                    <p className="text-sm">Añade tu primera idea!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${bgCard} rounded-xl p-8 border text-center`}>
                <Lightbulb className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`} />
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Selecciona un grupo o el banco general</h3>
                <p className={textSecondary}>Elige un grupo de la izquierda para ver y gestionar tus ideas</p>
              </div>
            )}
          </DragDropContext>
        </div>
      </div>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showAddGroup && (
          <GroupModal
            isOpen={showAddGroup}
            onClose={() => setShowAddGroup(false)}
            onSave={async (name, description, color) => {
              await addGroup(name, description, color);
              setShowAddGroup(false);
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {editingGroup && (
          <GroupModal
            isOpen={!!editingGroup}
            onClose={() => setEditingGroup(null)}
            onSave={async (name, description, color) => {
              await updateGroup(editingGroup.id, { name, description, color });
              setEditingGroup(null);
            }}
            onDelete={async () => {
              await deleteGroup(editingGroup.id);
              setEditingGroup(null);
              setSelectedGroup(null);
            }}
            initialData={editingGroup}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Add Idea Modal */}
      <AnimatePresence>
        {showAddIdea && (
          <IdeaModal
            isOpen={showAddIdea}
            onClose={() => setShowAddIdea(false)}
            onSave={async (title, description, score, priority, tags, notes, estimatedDuration) => {
              const groupId = selectedGroup === 'ungrouped' ? null : selectedGroup;
              await addIdea(groupId, title, description, score);
              if (tags.length > 0 || notes || priority !== 'medium' || estimatedDuration) {
                const newIdea = ideas[ideas.length - 1];
                if (newIdea) {
                  await updateIdea(newIdea.id, { 
                    tags, 
                    notes, 
                    priority, 
                    estimated_duration: estimatedDuration 
                  });
                }
              }
              setShowAddIdea(false);
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Edit Idea Modal */}
      <AnimatePresence>
        {editingIdea && (
          <IdeaModal
            isOpen={!!editingIdea}
            onClose={() => setEditingIdea(null)}
            onSave={async (title, description, score, priority, tags, notes, estimatedDuration, status) => {
              await updateIdea(editingIdea.id, {
                title,
                description,
                score,
                priority,
                tags,
                notes,
                estimated_duration: estimatedDuration,
                status
              });
              setEditingIdea(null);
            }}
            onDelete={async () => {
              await deleteIdea(editingIdea.id);
              setEditingIdea(null);
            }}
            initialData={editingIdea}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Group Modal Component
interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: IdeaGroup;
  isDark: boolean;
}

const GroupModal = ({ isOpen, onClose, onSave, onDelete, initialData, isDark }: GroupModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || '#3B82F6');

  const colors = [
    '#10B981', '#3B82F6', '#6B7280', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await onSave(name.trim(), description.trim(), color);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {initialData ? 'Editar Grupo' : 'Nuevo Grupo'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre del Grupo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="ej: Bangers, Buenos, Mid..."
              required
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Ideas que van a ser éxito seguro..."
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Guardar' : 'Crear Grupo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Idea Modal Component  
interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, score: number, priority: VideoIdea['priority'], tags: string[], notes: string, estimatedDuration?: number, status?: VideoIdea['status']) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: VideoIdea;
  isDark: boolean;
}

const IdeaModal = ({ isOpen, onClose, onSave, onDelete, initialData, isDark }: IdeaModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [score, setScore] = useState(initialData?.score || 5);
  const [priority, setPriority] = useState<VideoIdea['priority']>(initialData?.priority || 'medium');
  const [status, setStatus] = useState<VideoIdea['status']>(initialData?.status || 'idea');
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [estimatedDuration, setEstimatedDuration] = useState(initialData?.estimated_duration || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await onSave(title.trim(), description.trim(), score, priority, tagArray, notes.trim(), estimatedDuration, status);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {initialData ? 'Editar Idea' : 'Nueva Idea de Video'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Título de la Idea
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="ej: Top 10 Pokemon Cards que van a explotar en precio"
              required
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Detalles de la idea, enfoque, etc..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Puntuación (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-yellow-600 font-medium">
                {score}/10 ⭐
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as VideoIdea['priority'])}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {initialData && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VideoIdea['status'])}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="idea">💡 Idea</option>
                <option value="scripting">📝 Escribiendo</option>
                <option value="filming">🎥 Grabando</option>
                <option value="editing">✂️ Editando</option>
                <option value="uploaded">✅ Subido</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags (separados por coma)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="pokemon, cards, review, top10"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Duración estimada (min)
              </label>
              <input
                type="number"
                value={estimatedDuration || ''}
                onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="15"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Ideas de script, referencias, links útiles..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Guardar' : 'Crear Idea'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};