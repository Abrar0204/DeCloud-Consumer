import { Flex, Heading, Box } from "@chakra-ui/react";
import dragDrop from "drag-drop";
import { useFile } from "../context/FileContext";
import FileCard from "../components/FileCard";
import UploadFileButton from "../components/UploadFileButton";

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
  const { files } = useFile();

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
      <UploadFileButton />
    </Box>
  );
};

export default Home;
