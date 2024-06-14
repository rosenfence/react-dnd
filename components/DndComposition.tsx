import React, { useState, useMemo, createContext, useContext } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import styled from '@emotion/styled';
import { CSS } from '@dnd-kit/utilities';

interface DragAndDropProviderProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

const DragAndDropProvider = <T extends { id: UniqueIdentifier }>({
  items,
  onChange,
  renderItem,
}: DragAndDropProviderProps<T>) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: { active: { id: UniqueIdentifier } }) => {
    setActiveId(active.id);
  };

  const handleDragEnd = ({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier };
    over: { id: UniqueIdentifier } | null;
  }) => {
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items}>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {items.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.4' } },
          }),
        }}
      >
        {activeItem ? renderItem(activeItem) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableItemProps {
  id: string;
  children: ({
    listeners,
    isDragging,
  }: {
    listeners: import('@dnd-kit/core/dist/hooks/utilities').SyntheticListenerMap | undefined;
    isDragging: boolean;
  }) => React.ReactNode;
}

interface Context {
  attributes: Record<string, any>;
  listeners: import('@dnd-kit/core/dist/hooks/utilities').SyntheticListenerMap | undefined;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: {},
  ref() {},
});

export const SortableItem = ({ children, id }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        {children({ listeners, isDragging })}
      </div>
    </SortableItemContext.Provider>
  );
};

export const DragHandle = () => {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <button {...attributes} {...listeners} ref={ref}>
      <svg viewBox='0 0 20 20' width='12'>
        <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
      </svg>
    </button>
  );
};

interface IDragAndDrop {
  Provider: typeof DragAndDropProvider;
  SortableItem: typeof SortableItem;
  DragHandle: typeof DragHandle;
}

const DragAndDrop: IDragAndDrop = {
  Provider: DragAndDropProvider,
  SortableItem: SortableItem,
  DragHandle: DragHandle,
};

export default DragAndDrop;
