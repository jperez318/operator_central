import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DnDContext from "./components/DnDcontext";
import Home from "./pages/Home";
import OperatorOTM from "./pages/OperatorOTM";

function App() {
  return (
    <Router>
      <nav style={{
        background: "#24477F",
        padding: "12px 24px",
        display: "flex",
        gap: "24px"
      }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Operator Skills Matrix</Link>
        <Link to="/operatorotm" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Operator of the Month</Link>
      </nav>
      <DnDContext>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operatorotm" element={<OperatorOTM />} />
        </Routes>
      </DnDContext>
    </Router>
  );
}

export default App;