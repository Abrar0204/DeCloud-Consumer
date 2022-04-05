import React from "react";
import { Flex, Image, IconButton, Tooltip } from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import logo from "../res/img/DeCloud Logo.png";
import { FaNetworkWired, FaFolderOpen } from "react-icons/fa";

const SideBar = () => {
  return (
    <Flex
      direction="column"
      align="center"
      width="80px"
      padding="2"
      height="100vh"
      bg="gray.900"
    >
      <Image src={logo} alt="DeCloud" width="50px" marginY="3" />

      <Tooltip label="Recent Files">
        <IconButton as={RouterLink} to="/" icon={<TimeIcon />} marginY="2" />
      </Tooltip>

      <Tooltip label="All Files">
        <IconButton
          as={RouterLink}
          to="/files"
          icon={<FaFolderOpen />}
          marginY="2"
        />
      </Tooltip>

      <Tooltip label="View Network">
        <IconButton
          as={RouterLink}
          to="/network"
          icon={<FaNetworkWired />}
          marginY="2"
        />
      </Tooltip>
    </Flex>
  );
};

export default SideBar;
