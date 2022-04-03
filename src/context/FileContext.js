import { useState, useCallback, createContext, useContext } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import DeCloudFiles from "../res/contracts/DeCloudFiles.json";
const wcProvider = new WalletConnectProvider({
  rpc: {
    1337: "http://192.168.1.28:7545",
  },
});
const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [fileContract, setFileContract] = useState(null);
  // const [paymentContract,setPaymentContract]=useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState("false");

  const disconnect = async () => {
    console.log("Being called");
    await wcProvider.disconnect();
    setAccountNumber("");
  };

  const connectToMetaMask = async () => {
    try {
      await wcProvider.enable();
      const web3Provider = new ethers.providers.Web3Provider(wcProvider);

      const signer = web3Provider.getSigner(wcProvider.accounts[0]);

      const fContract = new ethers.Contract(
        "0x220d6A0867a4304a32918A02Ae8EA0ab32f09aD0",
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

        console.log(file[5]);
        newFiles.push({
          fileHash: file[0],
          fileName: file[1],
          fileType: file[2],
          storedIn: file[3],
          splitInto: file[4].toNumber(),
          uploadDateUTC: file[5],
          fileSize: file[6].toNumber(),
        });
      }

      setFiles(newFiles);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
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
            ethers.utils.formatEther(fileSize * 1000000)
          ),
        };
        const uploadDateUTC = Date.now();
        await fileContract?.addFile(
          fileHash,
          fileName,
          fileType,
          storedIn,
          storedMetaMaskNumber,
          splitInto,
          uploadDateUTC,
          fileSize,
          options
        );
        setFiles((prev) => [
          ...prev,
          {
            fileHash,
            fileName,
            fileType,
            storedIn,
            splitInto,
            uploadDateUTC,
            fileSize,
          },
        ]);
      } catch (err) {
        console.log(err);
      }
    },
    [fileContract]
  );

  return (
    <FileContext.Provider
      value={{
        connectToMetaMask,
        files,
        isLoading,
        accountNumber,
        addFile,
        disconnect,
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
    addFile,
  } = useContext(FileContext);

  return {
    connectToMetaMask,
    files,
    isLoading,
    accountNumber,
    addFile,
    disconnect,
  };
};

export { useFile, FileProvider };
