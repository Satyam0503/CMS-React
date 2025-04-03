import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Stack, Tooltip } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import zIndex from "@mui/material/styles/zIndex";

export function DraggableComponent({
  id,
  children,
  isDragging,
  withOpacity,
}: {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
  withOpacity?: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: id,
  });

  const { setNodeRef: droppableRef, isOver } = useDroppable({
    id: id,
  });

  const style = {
    cursor: "move",
    // transform: CSS.Translate.toString(transform),
    transition: isOver ? "background-color 0.2s ease" : "none",
    transform: isDragging ? "scale(1.05)" : "scale(1)",
  };

  return (
    <Stack ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Tooltip title="Drag / Drop" followCursor arrow placement="left-end">
        <Stack ref={droppableRef}>{children}</Stack>
      </Tooltip>
    </Stack>
  );
}
