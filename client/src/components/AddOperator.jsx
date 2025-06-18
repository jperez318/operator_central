import React, { useState } from "react";
import axios from "axios";

export default function AddOperator({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
        onAdd(name.trim());  // Pass the full operator (including ID/status) back to parent
        setName("");
        onClose();
    } catch (err) {
        console.error("Failed to add operator:", err);
        alert("Error adding operator. See console.");
    }
    };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2>Add Operator</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <div style={{ marginTop: "10px" }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.addBtn}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  cancelBtn: {
    marginRight: "10px",
    padding: "8px 12px",
    backgroundColor: "#aaa",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  addBtn: {
    padding: "8px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
