import { Flex, Box } from "@chakra-ui/react";
import React from "react";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

const Main = ({ children }) => {
  return (
    <Flex width="100%">
      <SideBar />
      <Box width="100%">
        <TopBar />
        <Box paddingY="4" paddingX="8">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default Main;
