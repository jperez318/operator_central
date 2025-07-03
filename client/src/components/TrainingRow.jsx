import React, { useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const TrainingRow = ({ training, index, moveTraining, children, isLocked }) => {
  const ref = useRef(null);
  const dragRef = useRef(null)

  const [, drop] = useDrop({
    accept: "TRAINING_ROW",
    drop(item) {
        if (isLocked) return;
        if (item.index !== index) {
        moveTraining(item.index, index);
        item.index = index;
        }
    },
    hover(_, monitor) {
        if (isLocked) return;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        const threshold = 100;
        const scrollSpeed = 15;
        const { y } = clientOffset;
        const viewportHeight = window.innerHeight;

        if (y < threshold) {
        window.scrollBy({ top: -scrollSpeed, behavior: "auto" });
        } else if (y > viewportHeight - threshold) {
        window.scrollBy({ top: scrollSpeed, behavior: "auto" });
        }
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "TRAINING_ROW",
    item: { id: training.id, index },
    canDrag: !isLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drop(ref);
  drag(dragRef)

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : 1,
        borderRadius: "16px",           // ✅ Rounded corners
        padding: 16,
        marginBottom: 20,
        background: "#24477F",          // ✅ McKinsey Blue
        color: "black",                 // ✅ Text color for contrast
        marginBottom: 10,
      }}
    >
      <h2
        ref={dragRef}
        style={{ cursor: isLocked ? "default" : "move", userSelect: "none" }}
        title={isLocked ? "Unlock to drag training" : "Drag training"}
      >
        {training.name}
      </h2>
      {children}
    </div>
  );
};

export default TrainingRow;