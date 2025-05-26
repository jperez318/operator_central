import React from "react";

export default function OperatorCard({ operator }) {
  return (
    <div
      style={{
        padding: "10px",
        margin: "5px 0",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    >
      {operator.name}
    </div>
  );
}
