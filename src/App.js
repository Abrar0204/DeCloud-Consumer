import Home from "./screens/Home";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useFile } from "./context/FileContext";
import Connect from "./screens/Connect";

function App() {
  const { accountNumber, connectToMetaMask } = useFile();

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              accountNumber ? (
                <Home />
              ) : (
                <Connect connectToMetaMask={connectToMetaMask} />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
