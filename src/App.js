import Home from "./screens/Home";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useFile } from "./context/FileContext";
import Connect from "./screens/Connect";
import Main from "./components/Main";
import MyFiles from "./screens/MyFiles";
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@chakra-ui/modal";
import Network from "./screens/Network";

function App() {
  const { accountNumber, connectToMetaMask, isOpen, isOpenData } = useFile();

  return (
    <div className="App">
      {accountNumber ? (
        <Router>
          <Main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/files" element={<MyFiles />} />
              <Route path="/network" element={<Network />} />
            </Routes>
          </Main>
        </Router>
      ) : (
        <Connect connectToMetaMask={connectToMetaMask} />
      )}
      <Modal isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isOpenData.title}</ModalHeader>
          <ModalBody>{isOpenData.description}</ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;
