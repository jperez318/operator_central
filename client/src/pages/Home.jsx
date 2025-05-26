import React from "react";
import TrainingBoard from "../components/TrainingBoard";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Operator Training Status</h1>
      <TrainingBoard />
    </div>
  );
}