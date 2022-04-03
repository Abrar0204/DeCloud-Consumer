import React from "react";
import { Button } from "@chakra-ui/button";
import { FaUpload } from "react-icons/fa";

const UploadFileButton = () => {
  const sendFile = () => {
    window.api.send("filepath", null);
  };
  return (
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
  );
};

export default UploadFileButton;
