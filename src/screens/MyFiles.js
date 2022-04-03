import React from "react";
import {
  Box,
  Heading,
  Table,
  Tbody,
  Thead,
  TableContainer,
  Th,
  Tr,
  Td,
  IconButton,
} from "@chakra-ui/react";
import UploadFileButton from "../components/UploadFileButton";
import { useFile } from "../context/FileContext";
import format from "date-fns/format";
import { FaDownload } from "react-icons/fa";
const MyFiles = () => {
  const { files } = useFile();

  const downloadFile = (file) => (e) => {
    window.api.send("download-file", file);
  };

  return (
    <Box className="my-files">
      <Heading fontFamily="fantasy" fontWeight="400" marginBottom="6">
        My Files
      </Heading>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th width="5%">S.no</Th>
              <Th width="20%">Name</Th>
              <Th width="10%">Size</Th>
              <Th width="20%">Upload Date</Th>
              <Th width="35%">Stored Nodes</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file, index) => (
              <FileRow
                key={file.fileHash + "isRow"}
                file={file}
                sNo={index + 1}
                downloadFile={downloadFile(file)}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <UploadFileButton />
    </Box>
  );
};

const FileRow = ({ file, sNo, downloadFile }) => {
  const { fileName, uploadDateUTC, fileSize, fileType, storedIn } = file;
  return (
    <Tr>
      <Td width="5%">{sNo}</Td>
      <Td width="25%">
        {fileName}.{fileType}
      </Td>
      <Td width="10%">{(fileSize * 0.000001).toPrecision(2)} MB</Td>
      <Td width="25%">{format(uploadDateUTC, "dd MMM yyyy hh:mm aaa")}</Td>
      <Td width="35%" isTruncated>
        {storedIn}
      </Td>
      <Td>
        <IconButton icon={<FaDownload />} onClick={downloadFile} />
      </Td>
    </Tr>
  );
};
export default MyFiles;
