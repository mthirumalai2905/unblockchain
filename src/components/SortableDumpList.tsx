import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useWorkspace, Dump } from "@/store/WorkspaceStore";
import DumpCard from "@/components/DumpCard";

interface SortableDumpProps {
  dump: Dump;
  index: number;
  draggable: boolean;
}

const SortableDump = ({ dump, index, draggable }: SortableDumpProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dump.id, disabled: !draggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="absolute -left-5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground/0 group-hover/sortable:text-muted-foreground/60 hover:text-foreground transition-colors cursor-grab active:cursor-grabbing touch-none hidden sm:block"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <DumpCard dump={dump} index={index} />
    </div>
  );
};

interface SortableDumpListProps {
  dumps: Dump[];
  draggable?: boolean;
}

const SortableDumpList = ({ dumps, draggable = true }: SortableDumpListProps) => {
  const { reorderDumps } = useWorkspace();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dumps.findIndex((d) => d.id === active.id);
    const newIndex = dumps.findIndex((d) => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(dumps, oldIndex, newIndex);
    reorderDumps(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={dumps.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {dumps.map((dump, i) => (
            <SortableDump key={dump.id} dump={dump} index={i} draggable={draggable} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableDumpList;
