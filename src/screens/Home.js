import { Flex, Button, useToast, Heading, Box } from "@chakra-ui/react";
import dragDrop from "drag-drop";
import { useEffect } from "react";
import { useFile } from "../context/FileContext";
import { FaUpload } from "react-icons/fa";
import FileCard from "../components/FileCard";

dragDrop("#root", (files) => {
  const _files = files.map((file) => {
    return {
      name: file.name,
      path: file.path,
    };
  });

  window.api.send("filepath", _files);
});

const Home = () => {
  const { files, addFile } = useFile();
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

  return (
    <Box className="Home">
      <Heading fontFamily="fantasy" fontWeight="400" marginBottom="6">
        Recent Files
      </Heading>
      <Flex>
        {files.map((file) => (
          <FileCard file={file} />
        ))}
      </Flex>
      <Button
        leftIcon={<FaUpload />}
        colorScheme="purple"
        onClick={sendFile}
        position="fixed"
        right="5"
        bottom="5"
      >
        Upload a File
      </Button>
    </Box>
  );
};

export default Home;
