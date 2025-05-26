import React, { useEffect, useState } from "react";
import axios from "axios";
import OperatorCard from "./OperatorCard";

/*
const mockOperators = [
  { id: 1, name: "Alice", status: "trained" },
  { id: 2, name: "Bob", status: "not_trained" },
  { id: 3, name: "Charlie", status: "can_train" },
  { id: 4, name: "Diana", status: "shadowed" },
];
 */



const categories = ["not_trained", "trained", "shadowed", "can_train"];
const displayNames = {
  not_trained: "Not Trained",
  trained: "Trained",
  shadowed: "Shadowed",
  can_train: "Can Train",
};

export default function TrainingBoard() {
  const [operators, setOperators] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/operators")
      .then((res) => {
        // Add a default status (for now) until Flask provides one
        const operatorsWithStatus = res.data.map(op => ({
          ...op,
          status: "not_trained"  // or fetch from backend later
        }));
        setOperators(operatorsWithStatus);
      })
      .catch((err) => console.error("API error:", err));
}, []);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {categories.map((status) => (
        <div
          key={status}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#f9f9f9",
          }}
        >
          <h3>{displayNames[status]}</h3>
          {operators
            .filter((op) => op.status === status)
            .map((op) => (
              <OperatorCard key={op.id} operator={op} />
            ))}
        </div>
      ))}
    </div>
  );
}
