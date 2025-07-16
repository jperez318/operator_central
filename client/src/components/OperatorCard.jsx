import React from "react";
import { useDrag } from "react-dnd";

export default function OperatorCard({ operator, isLocked }) {
  const statusColors = {
    not_trained: "#EFB5B9",   
    trained: "#FBC176",     
    shadowed: "#FBFB89",    
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

function getSinceString(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();

  let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  let days = now.getDate() - date.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  return `Since: ${date.toLocaleDateString()} (${months} months ${days} days ago)`;
}

const backgroundColor = statusColors[operator.status] || "#ffffff";

  return (
    <div
    ref={dragRef}
      style={{
        display: "inline-block", // <-- Add this line
        opacity: isDragging ? 0.5 : 1,
        padding: "5px",
        margin: "5px 5px",
        fontSize: "1.1em",
        background: backgroundColor,
        border: "1px solid #ddd",
        borderRadius: "10px",
        cursor: "move",
      }}
      title={operator.date_assigned ? getSinceString(operator.date_assigned) : ""}
    >
      {operator.name}
    </div>
  );
}
