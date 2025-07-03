import React from "react";
import { useDrag } from "react-dnd";

export default function OperatorCard({ operator, isLocked }) {
  const statusColors = {
    not_trained: "#EFB5B9",   // red
    trained: "#FBC176",       // green
    shadowed: "#FBFB89",      // yellow
    ran_in_workshop: "#A8F583", 
    can_train: "#A0D1FF",     
  };

  const [{ isDragging }, dragRef] = useDrag(() => {
  return {
    type: "OPERATOR",
    item: { ...operator },
    canDrag: () => {
      return !isLocked;
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  };
}, [operator.id, isLocked]);

const backgroundColor = statusColors[operator.status] || "#ffffff";

  return (
    <div
    ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        margin: "5px 0",
        background: backgroundColor,
        border: "1px solid #ddd",
        borderRadius: "4px",
        cursor: "move",
      }}
    >
      {operator.name}
    </div>
  );
}
