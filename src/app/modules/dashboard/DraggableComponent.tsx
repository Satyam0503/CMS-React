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
    cursor: "move",
    transform: CSS.Translate.toString(transform),
    transition: isOver ? "background-color 0.2s ease" : "none",
  };

  return (
    <Stack ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Stack ref={droppableRef}>{children}</Stack>
    </Stack>
  );
}
