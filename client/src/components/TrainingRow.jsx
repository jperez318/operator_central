import React, { useRef, useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const TrainingRow = ({ training, index, moveTraining, children, isLocked, onRename, onSwitchImportance, onFieldChange }) => {
  const ref = useRef(null);
  const dragRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(training.name);
  const [numOperators, setNumOperators] = useState(training.num_operators || "");
  const [timeTaken, setTimeTaken] = useState(training.time_taken || "");
  const [line, setLine] = useState(training.line || "");
  const [information, setInformation] = useState(training.information || "");

  useEffect(() => {
    setNewName(training.name);
  }, [training.name]);

  const [, drop] = useDrop({
    accept: "TRAINING_ROW",
    drop(item) {
      if (isLocked) return;
      if (item.index !== index) {
        moveTraining(item.index, index);
        item.index = index;
      }
    },
    hover(_, monitor) {
      if (isLocked) return;
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
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "TRAINING_ROW",
    item: { id: training.id, index },
    canDrag: !isLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drop(ref);
  drag(dragRef);

  const finishRename = () => {
    const trimmed = newName.trim();

    if (!editing || trimmed === training.name) {
      setEditing(false);
      return;
    }

    setEditing(false);

    if (onRename) {
      onRename(training.id, trimmed, (errorMessage) => {
        alert(errorMessage);
        setNewName(training.name);
        setEditing(false);
      });
    }
  };

  const handleNumOperatorsChange = (e) => {
    const value = e.target.value;
    if (/^[\d-]*$/.test(value)) {
      setNumOperators(value);
      onFieldChange && onFieldChange(training.id, "num_operators", value);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: training.important ? (isDragging ? 0.4 : 1) : 0.7,
        borderRadius: "16px",
        padding: 16,
        marginBottom: 20,
        background: "#24477F",
        color: "white",
        position: "relative",
      }}
    >
      {/* Importance Toggle Button */}
      <button
        onClick={() => onSwitchImportance(training.id)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: training.important ? "#3498db" : "#e74c3c",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "8px",
          fontSize: "0.75rem",
          cursor: "pointer",
        }}
      >
        {training.important ? "Important" : "Not Important"}
      </button>

        {editing ? (
        <input
          ref={dragRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={finishRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishRename();
            if (e.key === "Escape") {
              setNewName(training.name);
              setEditing(false);
            }
          }}
          autoFocus
          style={{
            fontSize: "1.5em",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            width: "calc(100% - 100px)",
          }}
        />
      ) : (
          <>
          <h2
            ref={dragRef}
            style={{
              cursor: isLocked ? "default" : "move",
              userSelect: "none",
              margin: 0,
            }}
            title={isLocked ? "Unlock to drag training" : "Double-click to rename"}
            onDoubleClick={() => setEditing(true)}
          >
            {training.name}
          </h2>
          <div style={{ display: "flex", gap: "1em", marginTop: 8 }}>
            <div># Operators: {training.num_operators}</div>
            <div>Time Taken: {training.time_taken}</div>
            <div>Line: {training.line}</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>Information:</strong>
            <div>{training.information}</div>
          </div>
        </>
      )}
      <div style={{ color: "black", marginTop: "10px" }}>{children}</div>
    </div>
  );
}
export default TrainingRow;
