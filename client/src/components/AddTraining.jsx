import React, { useState } from "react";

export default function AddTraining({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [numOperators, setNumOperators] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [line, setLine] = useState("");
  const [information, setInformation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      name,
      num_operators: numOperators,
      time_taken: timeTaken,
      line,
      information,
    });
    setName("");
    setNumOperators("");
    setTimeTaken("");
    setLine("");
    setInformation("");
    onClose();
  };

  if (!isOpen) return null;

    return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.modal}>
        <h2 style={{ color: "#24477F", marginBottom: 16 }}>Add Training</h2>
        <label style={{ display: "block", marginBottom: 10 }}>
          Name:
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <label style={{ display: "block", marginBottom: 10 }}>
          # Operators:
          <input
            value={numOperators}
            onChange={e => {
              if (/^[\d-]*$/.test(e.target.value)) setNumOperators(e.target.value);
            }}
            maxLength={5}
            style={styles.input}
            placeholder="e.g. 2-3"
          />
        </label>
        <label style={{ display: "block", marginBottom: 10 }}>
          Time Taken:
          <input
            value={timeTaken}
            onChange={e => setTimeTaken(e.target.value)}
            style={styles.input}
            placeholder="e.g. 1 hour"
          />
        </label>
        <label style={{ display: "block", marginBottom: 10 }}>
          Line:
          <input
            value={line}
            onChange={e => setLine(e.target.value)}
            style={styles.input}
            placeholder="e.g. Tealine"
            />
        </label>
        <label style={{ display: "block", marginBottom: 10 }}>
          Information:
          <textarea
            value={information}
            onChange={e => setInformation(e.target.value)}
            style={{ ...styles.input, minHeight: 60, resize: "vertical" }}
            placeholder="Any extra information..."
          />
        </label>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" style={styles.addBtn}>
            Add Training
          </button>
        </div>
      </form>
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