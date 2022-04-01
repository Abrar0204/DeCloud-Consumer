import { useState, useCallback } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import DeCloudFiles from "../res/contracts/DeCloudFiles.json";

const wcProvider = new WalletConnectProvider({
  rpc: {
    1337: "http://127.0.0.1:7545",
  },
});

const useEthers = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [fileContract, setFileContract] = useState(null);
  // const [paymentContract,setPaymentContract]=useState(null);

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState("false");

  const connectToMetaMask = async () => {
    await wcProvider.enable();
    const web3Provider = new ethers.providers.Web3Provider(wcProvider);

    const signer = web3Provider.getSigner(wcProvider.accounts[0]);

    const fContract = new ethers.Contract(
      "0x82A27f22bFf1c85507FCb472519293D0501CD2A9",
      DeCloudFiles.abi,
      signer
    );

    console.log(wcProvider.accounts[0]);
    setAccountNumber(wcProvider.accounts[0]);
    setFileContract(fContract);
    refreshFiles(fContract);
  };

  const refreshFiles = async (con) => {
    setIsLoading(true);
    const noOfFiles = await con?.getNoOfFile();

    if (!noOfFiles) {
      setIsLoading(false);
      return;
    }
    const newFiles = [];
    for (let i = 0; i < noOfFiles; i++) {
      const file = await con?.getFile(i);

      newFiles.push({
        fileHash: file[0],
        fileName: file[1],
        fileType: file[2],
        storedIn: file[3],
        splitInto: file[4].toNumber(),
      });
    }

    setFiles(newFiles);
    setIsLoading(false);
  };

  const addFile = useCallback(
    async ({
      fileHash,
      fileName,
      fileType,
      storedIn,
      storedMetaMaskNumber,
      splitInto,
    }) => {
      const options = { value: ethers.utils.parseEther("1.0") };
      await fileContract?.addFile(
        fileHash,
        fileName,
        fileType,
        storedIn,
        storedMetaMaskNumber,
        splitInto,
        options
      );
      refreshFiles(fileContract);
    },
    [fileContract]
  );

  return {
    connectToMetaMask,
    files,
    refreshFiles,
    isLoading,
    accountNumber,
    addFile,
  };
};

export default useEthers;
