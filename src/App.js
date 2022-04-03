import Home from "./screens/Home";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useFile } from "./context/FileContext";
import Connect from "./screens/Connect";
import Main from "./components/Main";
import MyFiles from "./screens/MyFiles";
import { useEffect } from "react";
import { useToast } from "@chakra-ui/toast";

function App() {
  const { accountNumber, connectToMetaMask, addFile } = useFile();
  const toast = useToast();
  useEffect(() => {
    window.api.listen("file-sent-successfully", async (_, fileData) => {
      try {
        await addFile(fileData);
        toast({
          title: "File Uploaded Successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }, [toast, addFile]);

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
