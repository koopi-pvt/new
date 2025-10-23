'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

type DraggableSectionProps = {
  id: string;
  children: React.ReactNode;
};

export function DraggableSection({ id, children }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      {children}
      <button {...listeners} className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing bg-white/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-6 h-6 text-gray-500" />
      </button>
    </div>
  );
}