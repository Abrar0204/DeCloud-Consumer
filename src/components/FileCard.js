import React from "react";
import {
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import {
  FaEllipsisV,
  FaFileImage,
  FaFileAlt,
  FaFileArchive,
  FaFilePdf,
} from "react-icons/fa";
import format from "date-fns/format";

const FileCard = ({ file }) => {
  const { fileName, fileType, uploadDateUTC } = file;

  const getIconForType = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FaFilePdf size="50" />;
      case "jpg":
      case "png":
      case "jpeg":
        return <FaFileImage size="50" />;
      case "zip":
      case "7z":
        return <FaFileArchive size="50" />;
      default:
        return <FaFileAlt size="50" />;
    }
  };

  const downloadFile = (file) => (e) => {
    window.api.send("download-file", file);
  };
  return (
    <Flex
      direction="column"
      align="flex-start"
      width="200px"
      key={file.fileHash}
      bg="blue.900"
      rounded="md"
      paddingY="3"
      paddingX="3"
      margin="2"
    >
      <Flex width="100%" justify="space-between">
        {getIconForType(fileType)}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaEllipsisV />}
            variant="ghost"
          />

          <MenuList>
            <MenuItem onClick={downloadFile(file)}>Download</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Text marginTop="4" fontSize="lg" fontWeight="bold" isTruncated>
        {fileName}.{fileType}
      </Text>
      <Text marginTop="2" fontSize="smaller">
        {format(uploadDateUTC, "dd MMM yyyy")}
      </Text>
    </Flex>
  );
};

export default FileCard;
