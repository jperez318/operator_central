import React from "react";
import { useDrag } from "react-dnd";

export default function OperatorCard({ operator }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "OPERATOR",
    item: { ...operator },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
    ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        margin: "5px 0",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        cursor: "move",
      }}
    >
      {operator.name}
    </div>
  );
}
