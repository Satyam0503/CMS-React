import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Stack } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";

export function DraggableComponent({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: id,
  });

  const { setNodeRef: droppableRef, isOver } = useDroppable({
    id: id,
  });
  const style = {
    // Outputs `translate3d(x, y, 0)`
  };

  return (
    <Stack
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        cursor: "move",
        transform: CSS.Translate.toString(transform),
      }}
    >
      <Stack ref={droppableRef} style={style}>
        {children}
      </Stack>
    </Stack>
  );
}
