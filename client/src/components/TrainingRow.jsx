import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const TrainingRow = ({ training, index, moveTraining, children }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "TRAINING_ROW",
    hover(item) {
      if (item.index === index) return;
      moveTraining(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "TRAINING_ROW",
    item: { id: training.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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