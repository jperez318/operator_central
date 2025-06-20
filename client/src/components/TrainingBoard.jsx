import React, { use, useEffect, useState } from "react";
import axios from "axios";
import OperatorCard from "./OperatorCard";
import { useDrop } from "react-dnd";
import AddOperator from "./AddOperator";
import DeleteOperator from "./DeleteOperator";
import AddTraining from "./AddTraining";
import DeleteTraining from "./DeleteTraining";

const categories = ["not_trained", "trained", "shadowed", "can_train"];
const displayNames = {
  not_trained: "Not Trained",
  trained: "Trained",
  shadowed: "Shadowed",
  can_train: "Can Train",
};

export default function TrainingBoard() {
  const [operatorsByTraining, setOperatorsByTraining] = useState({});
    const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
    const [showDeleteOperatorModal, setShowDeleteOperatorModal] = useState(false);
    const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
    const [showDeleteTrainingModal, setShowDeleteTrainingModal] = useState(false);
    const [trainings, setTrainings] = useState([]);

  const fetchTrainings = () => {
    axios.get("http://localhost:5000/trainings").then((res) => {
      setTrainings(res.data);
    });
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    trainings.forEach((training) => {
      axios
        .get(`http://localhost:5000/operators`, {
          params: { training_id: training.id },
        })
        .then((res) => {
          const withStatus = res.data.map((op) => ({
            ...op,
            status: op.status || "not_trained",
          }));
          setOperatorsByTraining((prev) => ({
            ...prev,
            [training.id]: withStatus,
          }));
        });
    });
  }, [trainings]);

  const addOperator = (newop) => {
    const name = typeof newop === "string" ? newop : newop.name;
    axios
      .post("http://localhost:5000/operators", { name })
      .then(() => {
        trainings.forEach((training) => {
          axios
            .get("http://localhost:5000/operators", {
              params: { training_id: training.id },
            })
            .then((res) => {
              const withStatus = res.data.map((op) => ({
                ...op,
                status: op.status || "not_trained",
              }));
              setOperatorsByTraining((prev) => ({
                ...prev,
                [training.id]: withStatus,
              }));
            });
        });
      })
      .catch((err) => console.error("❌ Error adding operator", err));
  };

  const deleteOperator = (op) => {
    const name = typeof op === "string" ? op : op.name;
    axios
      .delete("http://localhost:5000/operators", { params: { name } })
      .then(() => {
        trainings.forEach((training) => {
          axios
            .get("http://localhost:5000/operators", {
              params: { training_id: training.id },
            })
            .then((res) => {
              const withStatus = res.data.map((op) => ({
                ...op,
                status: op.status || "not_trained",
              }));
              setOperatorsByTraining((prev) => ({
                ...prev,
                [training.id]: withStatus,
              }));
            });
        });
      })
      .catch((err) => console.error("❌ Error deleting operator", err));
  };
  
  const moveOperator = (trainingId, operator, newStatus) => {
    if (operator.status === newStatus) return;

    setOperatorsByTraining((prev) => {
      const updated = prev[trainingId].map((op) =>
        op.id === operator.id ? { ...op, status: newStatus } : op
      );
      return {
        ...prev,
        [trainingId]: updated,
      };
    });

    axios
      .patch(
        `http://localhost:5000/operators/${operator.id}/training/${trainingId}/status`,
        {
          status: newStatus,
        }
      )
      .then(() => console.log("✅ Status updated"))
      .catch((err) => console.error("❌ Error updating status", err));
  };

  const addTraining = (name) => {
    axios
      .post("http://localhost:5000/trainings", { name })
      .then(() => fetchTrainings()) // Refresh list of trainings
      .catch((err) => {
        console.error("❌ Error adding training:", err);
        alert("Error adding training. See console.");
      });
  };

  const deleteTraining = (name) => {
    axios
      .delete("http://localhost:5000/trainings", { params: { name } })
      .then(() => fetchTrainings()) // Refresh list of trainings
      .catch((err) => {
        console.error("❌ Error deleting training:", err);
        alert("Error deleting training. See console.");
      });
  };

  return (
      <div>
        <div style={{ display: "flex", gap: "20px" }}>
          <button
            onClick={() => setShowAddOperatorModal(true)}
            style={{ backgroundColor: "#007bff", color: "white", padding: 8 }}
          >
            ➕ Add Operator
          </button>

          <button
            onClick={() => setShowDeleteOperatorModal(true)}
            style={{ backgroundColor: "#007bff", color: "white", padding: 8 }}
          >
            🗑️ Delete Operator
          </button>

          <button
            onClick={() => setShowAddTrainingModal(true)}
            style={{ backgroundColor: "#007bff", color: "white", padding: 8 }}
          >
            ➕ Add Training
          </button>

          <button
            onClick={() => setShowDeleteTrainingModal(true)}
            style={{ backgroundColor: "#007bff", color: "white", padding: 8 }}
          >
            🗑️ Delete Training
          </button>

          <AddOperator
            isOpen={showAddOperatorModal}
            onClose={() => setShowAddOperatorModal(false)}
            onAdd={addOperator}
          />

          <DeleteOperator
            isOpen={showDeleteOperatorModal}
            onClose={() => setShowDeleteOperatorModal(false)}
            onDelete={deleteOperator}
          />

          <AddTraining
            isOpen={showAddTrainingModal}
            onClose={() => setShowAddTrainingModal(false)}
            onAdd={addTraining}
          />

          <DeleteTraining
            isOpen={showDeleteTrainingModal}
            onClose={() => setShowDeleteTrainingModal(false)}
            onDelete={deleteTraining}
          />
        </div>

        {trainings.map((training) => (
          <div key={training.id}>
            <h2>{training.name}</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              {categories.map((status) => (
                <Column
                  key={status}
                  status={status}
                  displayName={displayNames[status]}
                  operators={
                    operatorsByTraining[training.id]?.filter(
                      (op) => op.status === status
                    ) || []
                  }
                  onDrop={(op) => moveOperator(training.id, op, status)}
                />
              ))}
            </div>
          </div>
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