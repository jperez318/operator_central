import React, { use, useEffect, useState } from "react";
import axios from "axios";
import OperatorCard from "./OperatorCard";
import { useDrop } from "react-dnd";
import AddOperator from "./AddOperator";
import DeleteOperator from "./DeleteOperator";
import AddTraining from "./AddTraining";
import DeleteTraining from "./DeleteTraining";
import TrainingRow from "./TrainingRow";

const categories = ["not_trained", "trained", "shadowed", "ran_in_workshop", "can_train"];
const displayNames = {
  not_trained: "Not Trained",
  trained: "Trained",
  ran_in_workshop: "Ran in Workshop",
  shadowed: "Shadowed",
  can_train: "Can Train",
};
const colors = {
  not_trained: "#E68F96",       
  trained: "#FAA433",           
  shadowed: "#F4DC27",         
  ran_in_workshop: "#62DB28",   
  can_train: "#73B7F7",         
};

export default function TrainingBoard() {
  const [operatorsByTraining, setOperatorsByTraining] = useState({});
  const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
  const [showDeleteOperatorModal, setShowDeleteOperatorModal] = useState(false);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [showDeleteTrainingModal, setShowDeleteTrainingModal] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [isLocked, setIsLocked] = useState(true);

  const fetchTrainings = () => {
    axios.get(`${process.env.REACT_APP_API_BASE}/trainings`).then((res) => {
      setTrainings(res.data);
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#9c9b9b";
    document.body.style.margin = "0";
    const fetchAll = async () => {
      try {
        const trainingsRes = await axios.get(`${process.env.REACT_APP_API_BASE}/trainings`);
        const trainingList = trainingsRes.data;
        setTrainings(trainingList);

        const responses = await Promise.all(
          trainingList.map((training) =>
            axios.get(`${process.env.REACT_APP_API_BASE}/operators`, {
              params: { training_id: training.id },
            })
          )
        );

        const updatedOperators = {};
        trainingList.forEach((training, i) => {
          const ops = responses[i].data.map((op) => ({
            ...op,
            status: op.status || "not_trained",
          }));
          updatedOperators[training.id] = ops;
        });

        setOperatorsByTraining(updatedOperators);
      } catch (err) {
        console.error("❌ Error loading trainings/operators", err);
      }
    };

    fetchAll();
}, []);

  const addOperator = (newop) => {
    const name = typeof newop === "string" ? newop : newop.name;
    axios
      .post(`${process.env.REACT_APP_API_BASE}/operators`, { name })
      .then(() => {
        trainings.forEach((training) => {
          axios
            .get(`${process.env.REACT_APP_API_BASE}/operators`, {
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
      .delete(`${process.env.REACT_APP_API_BASE}/operators`, { params: { name } })
      .then(() => {
        trainings.forEach((training) => {
          axios
            .get(`${process.env.REACT_APP_API_BASE}/operators`, {
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
        `${process.env.REACT_APP_API_BASE}/operators/${operator.id}/training/${trainingId}/status`,
        {
          status: newStatus,
        }
      )
      .then(() => console.log("✅ Status updated"))
      .catch((err) => console.error("❌ Error updating status", err));
  };

  const addTraining = (trainingData) => {
  axios
    .post(`${process.env.REACT_APP_API_BASE}/trainings`, trainingData)
    .then(() => fetchTrainings())
    .catch((err) => {
      console.error("❌ Error adding training:", err);
      alert("Error adding training. See console.");
    });
};

  const deleteTraining = (name) => {
    axios
      .delete(`${process.env.REACT_APP_API_BASE}/trainings`, { params: { name } })
      .then(() => fetchTrainings()) // Refresh list of trainings
      .catch((err) => {
        console.error("❌ Error deleting training:", err);
        alert("Error deleting training. See console.");
      });
  };

  const moveTraining = (fromIndex, toIndex) => {
    const scrollY = window.scrollY;

    setTrainings((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      const reordered = updated.map((t, i) => ({
        id: t.id,
        position: i
      }));

      // Save the previous state for reverting if needed
      const prevTrainings = prev;

      axios.patch(`${process.env.REACT_APP_API_BASE}/trainings/reorder`, reordered)
        .then(() => console.log("✅ Order saved"))
        .catch((err) => {
          // Show error message from backend if available
          const msg = err.response?.data?.error || "❌ Failed to save order";
          alert(msg);
          // Revert to previous state
          setTrainings(prevTrainings);
        });

      return updated;
    });

    setTimeout(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    }, 0);
  };

  const renameTraining = (id, newName, onError) => {
    axios
      .patch(`${process.env.REACT_APP_API_BASE}/trainings/${id}/rename`, { name: newName })
      .then(() => fetchTrainings())
      .catch((err) => {
        console.error("❌ Rename error", err);
        if (err.response?.status === 409) {
          onError?.("A training with that name already exists.");
        } else {
          onError?.("An error occurred while renaming.");
        }
      });
  };

  const switch_importance = (id) => {
    // Optimistically update local state
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, important: !t.important } : t
      )
    );
    axios
      .patch(`${process.env.REACT_APP_API_BASE}/trainings/${id}/importance`)
      .then(() => fetchTrainings())
      .catch((err) => {
        console.error("❌ Error switching importance", err);
        alert("Error switching importance. See console.");
      });
  };

  const handleTrainingFieldChange = (id, field, value) => {
    setTrainings(prev =>
      prev.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );

    axios.patch(`${process.env.REACT_APP_API_BASE}/trainings/${id}`, { [field]: value })
      .catch(err => {
        alert("Failed to update training field.");
        console.error(err);
      });
  };
  
  return (
      <div style={{padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "white", marginBottom: "20px" }}>Operator Skills Matrix</h1>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setShowAddOperatorModal(true)}
              style={{ backgroundColor: "#24477F", borderRadius: "10px", color: "white", padding: 8 }}
            >
              ➕ Add Operator
            </button>

            <button
              onClick={() => setShowDeleteOperatorModal(true)}
              style={{ backgroundColor: "#24477F", borderRadius: "10px", color: "white", padding: 8 }}
            >
              🗑️ Delete Operator
            </button>

            <button
              onClick={() => setShowAddTrainingModal(true)}
              style={{ backgroundColor: "#24477F", borderRadius: "10px", color: 'white', padding: 8 }}
            >
              ➕ Add Training
            </button>

            <button
              onClick={() => setShowDeleteTrainingModal(true)}
              style={{ backgroundColor: "#24477F", borderRadius: "10px", color: "white", padding: 8 }}
            >
              🗑️ Delete Training
            </button>

            <button
              onClick={() => setIsLocked((prev) => !prev)}
              style={{
                backgroundColor: isLocked ? "green" : "red",
                color: "white",
                borderRadius: "10px",
                padding: 8,
                marginLeft: 10,
              }}
            >
              {isLocked ? "Unlock Drag & Drop" : "Lock Drag & Drop"}
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
        </div>

       {trainings.map((training, index) => (
          <TrainingRow
            key={training.id}
            training={training}
            index={index}
            moveTraining={moveTraining}
            isLocked={isLocked}
            onRename={(id, newName, onError) => {
              renameTraining(id, newName, onError);
            }}
            onSwitchImportance={switch_importance}
            onFieldChange={handleTrainingFieldChange}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              {categories.map((status) => (
                <Column
                  key={status}
                  status={status}
                  displayName={displayNames[status]}
                  isLocked={isLocked}
                  operators={
                    operatorsByTraining[training.id]?.filter(
                      (op) => op.status === status
                    ) || []
                  }
                  onDrop={(op) => moveOperator(training.id, op, status)}
                />
              ))}
            </div>
          </TrainingRow>
        ))}
      </div>
    );
  }

function Column({ status, displayName, isLocked, operators, onDrop }) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "OPERATOR",
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const baseColor = colors[status] || "#f9f9f9";
  const background = isOver ? "#e6f7ff" : baseColor;

  return (
    <div
      ref={dropRef}
      style={{
        flex: 1,
        minHeight: "300px",
        padding: "10px",
        border: "2px dashed #ccc",
        background,
        borderRadius: "8px",
      }}
    >
      <h3>{displayName}</h3>
      {operators.map((op) => (
        <OperatorCard key={op.id} operator={op} isLocked={isLocked} />
      ))}
    </div>
  );
}