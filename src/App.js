import Home from "./screens/Home";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useFile } from "./context/FileContext";
import Connect from "./screens/Connect";
import Main from "./components/Main";
import MyFiles from "./screens/MyFiles";

function App() {
  const { accountNumber, connectToMetaMask } = useFile();

  return (
    <div className="App">
      {accountNumber ? (
        <Router>
          <Main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/files" element={<MyFiles />} />
            </Routes>
          </Main>
        </Router>
      ) : (
        <Connect connectToMetaMask={connectToMetaMask} />
      )}
    </div>
  );
}

export default App;
