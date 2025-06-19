import React, { useEffect, useState } from "react";
import axios from "axios";
import OperatorCard from "./OperatorCard";
import { useDrop } from "react-dnd";
import AddOperator from "./AddOperator";
import DeleteOperator from "./DeleteOperator";

const categories = ["not_trained", "trained", "shadowed", "can_train"];
const displayNames = {
  not_trained: "Not Trained",
  trained: "Trained",
  shadowed: "Shadowed",
  can_train: "Can Train",
};

export default function TrainingBoard() {
  const [operators, setOperators] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainingId, setTrainingId] = useState(1);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/operators`, {
        params: { training_id: trainingId }
      })
      .then((res) => {
        const withStatus = res.data.map((op) => ({
          ...op,
          status: op.status || "not_trained",
        }));
        setOperators(withStatus);
      });
  }, [trainingId]); // if trainingId ever changes, re-fetch

  const addOperator = (newop) => {
    const name = typeof newop === "string" ? newop : newop.name;
    axios
      .post("http://localhost:5000/operators", { name })
      .then(() => {
        return axios.get("http://localhost:5000/operators", {
          params: { training_id: trainingId },
        });
      })
      .then((res) => {
        const withStatus = res.data.map((op) => ({
          ...op,
          status: op.status || "not_trained",
        }));
        setOperators(withStatus);
      })
      .catch((err) => console.error("❌ Error adding operator", err));
  };


  const deleteOperator = (op) => {
    const name = typeof op === "string" ? op : op.name;
    axios
      .delete("http://localhost:5000/operators", { params: { name }})
      .then(() => {
        return axios.get("http://localhost:5000/operators", {
          params: { training_id: trainingId },
        });
      })
      .then((res) => {
        const withStatus = res.data.map((op) => ({
          ...op,
          status: op.status || "not_trained",
        }));
        setOperators(withStatus);
      })   
      .catch((err) => console.error("❌ Error adding operator", err));
  };
  

  const moveOperator = (operator, newStatus) => {
    if (operator.status === newStatus) return;

    setOperators((prev) => {
      const updated = prev.map((op) =>
        op.id === operator.id ? { ...op, status: newStatus } : op
      );
      console.log("✅ Updated operator list:", updated);
      return updated;
    });

    axios
      .patch(`http://localhost:5000/operators/${operator.id}/training/${trainingId}/status`, {
        status: newStatus,
      })
      .then(() => console.log("✅ Status updated"))
      .catch((err) => console.error("❌ Error updating status", err));
  };


  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          marginBottom: "15px",
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ➕ Add Operator
      </button>

      <AddOperator
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addOperator}
      />
      
      
      <button
        onClick={() => setShowDeleteModal(true)}
        style={{
          marginBottom: "15px",
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🗑️ Delete Operator
      </button>

      <DeleteOperator
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={deleteOperator}
      />
      
      {categories.map((status) => (
        <Column
          key={status}
          status={status}
          displayName={displayNames[status]}
          operators={operators.filter((op) => op.status === status)}
          onDrop={(operator) => moveOperator(operator, status)}
        />
      ))}
    </div>
  );
}

function Column({ status, displayName, operators, onDrop }) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "OPERATOR",
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      style={{
        flex: 1,
        minHeight: "300px",
        padding: "10px",
        border: "2px dashed #ccc",
        background: isOver ? "#e6f7ff" : "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h3>{displayName}</h3>
      {operators.map((op) => (
        <OperatorCard key={op.id} operator={op} />
      ))}
    </div>
  );
}