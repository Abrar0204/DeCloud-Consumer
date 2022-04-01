import { Flex, Button, useToast } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import dragDrop from "drag-drop";
import { useEffect } from "react";

dragDrop("#root", (files) => {
  const _files = files.map((file) => {
    return {
      name: file.name,
      path: file.path,
    };
  });

  window.api.send("filepath", _files);
});

const Home = ({ ethers }) => {
  const { files, addFile } = ethers;
  const toast = useToast();

  useEffect(() => {
    window.api.listen("file-sent-successfully", async (event, fileData) => {
      toast({
        title: "File Uploaded Successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      addFile(fileData);
      // console.log(fileData);
    });
  }, [toast, addFile]);

  const sendFile = () => {
    window.api.send("filepath", null);
  };

  const downloadFile = (file) => (e) => {
    window.api.send("download-file", file);
  };

  return (
    <div className="Home">
      <Flex marginTop="10" direction={"column"} alignItems="center">
        {files.map((file) => (
          <Button key={file.fileHash} onClick={downloadFile(file)}>
            {file.fileName}
          </Button>
        ))}
      </Flex>
      <Button
        leftIcon={<AttachmentIcon />}
        colorScheme="purple"
        onClick={sendFile}
        position="fixed"
        right="5"
        bottom="5"
      >
        Upload a File
      </Button>
    </div>
  );
};

export default Home;
