import logo from "./res/img/DeCloud Logo.png";
import {
  Flex,
  Heading,
  Button,
  Text,
  Image,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import useEthers from "./hooks/use-ethers";
import Home from "./components/Home";

function App() {
  const ethers = useEthers();

  return (
    <div className="App">
      {ethers.accountNumber ? (
        <Home ethers={ethers} />
      ) : (
        <Flex
          height="85vh"
          direction={"column"}
          alignItems="center"
          justify="center"
        >
          <Image align="center" src={logo} alt="DeCloud" width="100px" />
          <Heading marginTop="5">
            Welcome to{" "}
            <Text as="span" fontFamily="fantasy" fontWeight="400">
              DeCloud
            </Text>
          </Heading>

          <Button
            colorScheme="green"
            onClick={ethers.connectToMetaMask}
            marginY="5"
          >
            Connect to Metamask
          </Button>
          <Alert status="info" width="30%" marginTop="5">
            <AlertIcon />
            Link your Metamask account to start uploading files
          </Alert>
        </Flex>
      )}
    </div>
  );
}

export default App;
