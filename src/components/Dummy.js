// import logo from "./res/img/DeCloud Logo.png";
// import { Flex, Heading, Button, Text, Image, useToast } from "@chakra-ui/react";
// import { AttachmentIcon, DownloadIcon } from "@chakra-ui/icons";
// import dragDrop from "drag-drop";
// import { useEffect, useState } from "react";

// import WalletConnectProvider from "@walletconnect/web3-provider";
// import { ethers } from "ethers";
// import DeCloudFiles from "./res/contracts/DeCloudFiles.json";

// //  Create WalletConnect Provider
// const provider = new WalletConnectProvider({
//   rpc: {
//     1337: "http://127.0.0.1:7545",
//     // ...
//   },
// });
// function App() {
//   const [accountNumber, setAccountNumber] = useState("");

//   const toast = useToast();
//   useEffect(() => {
//     window.api.listen("file-sent-successfully", () => {
//       toast({
//         title: "File Uploaded Successfully.",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     });
//   }, [toast]);

//   const sendFile = () => {
//     window.api.send("filepath", null);
//   };

//   const connectAccount = async () => {
//     await provider.enable();

//     setAccountNumber(provider.accounts[0]);

//     const web3Provider = new ethers.providers.Web3Provider(provider);

//     const signer = web3Provider.getSigner(0);
//     new ethers.Contract(
//       "0x215670BA5B43f022b2c8eA3cc00bC322d36516a7",
//       DeCloudFiles.abi,
//       signer
//     );
//   };

//   const disconnect = async () => {
//     await provider.disconnect();
//   };
//   // const printAccounts = () => {
//   //   console.log();
//   //   setAccountNumber(con)
//   // };

//   dragDrop("#root", (files) => {
//     const _files = files.map((file) => {
//       return {
//         name: file.name,
//         path: file.path,
//       };
//     });

//     window.api.send("filepath", _files);
//   });
//   return (
//     <div className="App">
//       <Flex marginTop="10" direction={"column"} alignItems="center">
//         <Image align="center" src={logo} alt="DeCloud" width="100px" />
//         <Heading marginTop="5">
//           Welcome to{" "}
//           <Text as="span" fontFamily="fantasy" fontWeight="400">
//             DeCloud
//           </Text>
//         </Heading>
//         <Heading>{accountNumber}</Heading>
//       </Flex>
//       <Flex marginTop="10" direction={"column"} alignItems="center">
//         <Button
//           leftIcon={<AttachmentIcon />}
//           colorScheme="purple"
//           onClick={sendFile}
//         >
//           Upload a File
//         </Button>
//         <Button colorScheme="green" onClick={connectAccount}>
//           Connect to Metamask
//         </Button>
//         <Button colorScheme="red" onClick={disconnect}>
//           Disconnect
//         </Button>
//         <Text marginY="5">Or</Text>
//         <Button
//           leftIcon={<DownloadIcon />}
//           colorScheme="purple"
//           variant="outline"
//         >
//           Drag & Drop
//         </Button>
//       </Flex>
//     </div>
//   );
// }

// export default App;
