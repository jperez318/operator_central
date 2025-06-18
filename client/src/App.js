import React from "react";
import Home from "./pages/Home";
import DnDcontext from "./components/DnDcontext";

function App() {
  return (
    <DnDcontext>
      <Home />
    </DnDcontext>
  );
}

export default App;