import React, { useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const TrainingRow = ({ training, index, moveTraining, children }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "TRAINING_ROW",
    drop(item) {
        if (item.index !== index) {
        moveTraining(item.index, index);
        item.index = index;
        }
    },
    hover(_, monitor) {
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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : 1,
        border: "1px solid lightgray",
        padding: 8,
        marginBottom: 10,
        background: "white",
      }}
    >
      <h2 style={{ cursor: "move" }}>{training.name}</h2>
      {children}
    </div>
  );
};

export default TrainingRow;