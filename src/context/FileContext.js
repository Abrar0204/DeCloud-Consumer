import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import DeCloudFiles from "../res/contracts/DeCloudFiles.json";
import { useToast } from "@chakra-ui/toast";
import { useDisclosure } from "@chakra-ui/hooks";
const CONTRACT_ADDRESS = "0x9C8E1b9989B3f9eB310d587B1107F74491A20b50";
const wcProvider = new WalletConnectProvider({
  rpc: {
    1337: "HTTP://192.168.232.238:7545",
  },
});
const FileContext = createContext();

const sendMoney = {
  title: "Payment to Storage Providers",
  description: "Please approve the Payment Transaction in your MetMask App",
};
const refundMoney = {
  title: "File not found. Initiating Witdrawal",
  description: "Please approve the Withdrawal Transaction in your MetMask App",
};
const FileProvider = ({ children }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [fileContract, setFileContract] = useState(null);
  // const [paymentContract,setPaymentContract]=useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState("false");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isOpenData, setIsOpenData] = useState({
    title: "",
    description: "",
  });
  const connectToMetaMask = async () => {
    try {
      await wcProvider.enable();
      const web3Provider = new ethers.providers.Web3Provider(wcProvider);

      const signer = web3Provider.getSigner(wcProvider.accounts[0]);

      const fContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DeCloudFiles.abi,
        signer
      );

      console.log(wcProvider.accounts[0]);
      setAccountNumber(wcProvider.accounts[0]);
      setFileContract(fContract);
      refreshFiles(fContract);
    } catch (err) {
      console.log(err);
    }
  };

  const disconnect = async () => {
    console.log("Being called");
    await wcProvider.disconnect();
    setAccountNumber("");
  };

  const addFile = useCallback(
    async ({
      fileHash,
      fileName,
      fileType,
      storedIn,
      storedMetaMaskNumber,
      splitInto,
      fileSize,
    }) => {
      try {
        // One byte = One Mwei = 	1,000,000 Wei
        const options = {
          value: ethers.utils.parseEther(
            // normal
            // ethers.utils.formatEther(fileSize * 1000000)
            // exaggerated
            ethers.utils.formatEther(fileSize * 1000000)
          ),
        };
        const uploadDateEnoch = Date.now();
        setIsOpenData(sendMoney);
        onOpen();
        await fileContract?.addFile(
          fileHash,
          fileName,
          fileType,
          storedIn,
          storedMetaMaskNumber,
          storedMetaMaskNumber.length,
          splitInto,
          uploadDateEnoch,
          fileSize,
          options
        );
        onClose();
        toast({
          title: "Success",
          description: "File Uploaded Successfully",
          status: "success",
          position: "top",
          duration: 2000,
          isClosable: true,
        });
        setFiles((prev) => [
          ...prev,
          {
            fileHash,
            fileName,
            fileType,
            storedIn,
            splitInto,
            uploadDateEnoch,
            fileSize,
          },
        ]);
      } catch (err) {
        console.log(err);
        onClose();
        window.api.send("delete-file", { fileHash, splitInto, storedIn });
        toast({
          title: "Error",
          description: err.message,
          status: "warning",
          duration: 2000,
          position: "top",
          isClosable: true,
        });
      }
    },
    [fileContract, onClose, onOpen, toast]
  );

  const getRefund = useCallback(
    async ({ storageAddress, fileUploadDate }) => {
      try {
        // console.log(storageAddress, fileUploadDate);
        await fileContract.getRefund(storageAddress, fileUploadDate);
      } catch (err) {
        console.log(err);
        toast({
          title: "Error",
          description: err.message,
          status: "warning",
          duration: 2000,
          position: "top",
          isClosable: true,
        });
      }
    },
    [fileContract, toast]
  );

  useEffect(() => {
    window.api.listen("file-sent-successfully", async (_, fileData) => {
      try {
        await addFile(fileData);
      } catch (err) {
        console.log(err);
      }
    });
  }, [addFile]);

  useEffect(() => {
    window.api.listen("file-downloaded", async (_, fileLocation) => {
      toast({
        title: "File Downloaded",
        description: `Location: ${fileLocation}`,
        status: "success",
        duration: 2000,
        position: "top",
        isClosable: true,
      });
    });
  }, [toast]);
  useEffect(() => {
    window.api.listen("file-not-found", async (_, fileData) => {
      try {
        setIsOpenData(refundMoney);
        onOpen();
        await getRefund(fileData);
        onClose();
      } catch (err) {
        onClose();
        console.log(err);
      }
    });
  }, [getRefund, toast, onOpen, onClose]);

  useEffect(() => {
    window.api.listen("no-nodes-found", (_) => {
      toast({
        title: "No Storage Nodes Found",
        description: `Please try again later`,
        status: "warning",
        duration: 2000,
        position: "top",
        isClosable: true,
      });
    });
  }, [toast]);

  const refreshFiles = async (con) => {
    try {
      setIsLoading(true);
      const noOfFiles = await con?.getNoOfFile();

      if (!noOfFiles) {
        setIsLoading(false);
        return;
      }
      const newFiles = [];
      for (let i = 0; i < noOfFiles; i++) {
        const file = await con?.getFile(i);

        console.log(file[3]);
        newFiles.push({
          fileHash: file[0],
          fileName: file[1],
          fileType: file[2],
          storedIn: file[3],
          splitInto: file[4].toNumber(),
          uploadDateEnoch: file[5].toNumber(),
          fileSize: file[6].toNumber(),
        });
      }

      setFiles(newFiles);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FileContext.Provider
      value={{
        connectToMetaMask,
        files,
        isLoading,
        accountNumber,
        disconnect,
        isOpen,
        isOpenData,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

const useFile = () => {
  const {
    connectToMetaMask,
    files,
    isLoading,
    accountNumber,
    disconnect,
    isOpen,
    isOpenData,
  } = useContext(FileContext);

  return {
    connectToMetaMask,
    files,
    isLoading,
    accountNumber,
    disconnect,
    isOpen,
    isOpenData,
  };
};

export { useFile, FileProvider };
