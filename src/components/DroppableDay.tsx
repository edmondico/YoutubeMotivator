'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableDayProps {
  id: string;
  children: ReactNode;
}

export const DroppableDay = ({ id, children }: DroppableDayProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] transition-all duration-200 rounded-lg p-1
        ${isOver ? 'bg-blue-100 ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
    >
      {children}
    </div>
  );
};