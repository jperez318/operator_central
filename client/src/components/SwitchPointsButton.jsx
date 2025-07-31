import React, { useState } from "react";

function SwitchPointsButton({ switch_points }) {
  const [showModal, setShowModal] = useState(false);

  const confirmSwitch = () => {
    switch_points();
    setShowModal(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: "#24477F",
          color: "white",
          border: "2px solid #ccc",
          borderRadius: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        Reset Operator Points
      </button>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            width: "300px"
          }}>
            <h2>Are you sure?</h2>
            <p>This will reset all operator points to 0. Operator points from this current month will be stored in the system until the next reset.</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                backgroundColor: "#eee",
                cursor: "pointer"
              }}>
                Cancel
              </button>
              <button onClick={confirmSwitch} style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#24477F",
                color: "white",
                cursor: "pointer"
              }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwitchPointsButton;
