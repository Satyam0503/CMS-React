import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Stack, Tooltip } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import zIndex from "@mui/material/styles/zIndex";

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
    zIndex: 4,
  };

  return (
    <Stack ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Tooltip title="Drag me" followCursor arrow placement="left-end">
        <Stack ref={droppableRef}>{children}</Stack>
      </Tooltip>
    </Stack>
  );
}
