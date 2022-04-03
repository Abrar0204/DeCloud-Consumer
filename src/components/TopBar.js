import React from "react";

import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useFile } from "../context/FileContext";

const TopBar = () => {
  const { accountNumber, disconnect } = useFile();
  return (
    <Flex height="50px" justify="flex-end" align="center" marginY="3">
      <Flex justify="flex-end" width="60%">
        <InputGroup width="40%" bg="gray.700" rounded="md">
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            border="none"
            type="text"
            placeholder="Search"
            _placeholder={{
              textColor: "gray.300",
            }}
          />
        </InputGroup>
      </Flex>

      <Flex justify="flex-end" align="center" width="40%" paddingRight="3">
        <Flex
          paddingLeft="3"
          align="center"
          width="40%"
          bg="gray.900"
          justify="space-between"
          rounded="10000px"
          _hover={{ cursor: "pointer" }}
          onClick={disconnect}
        >
          <Text isTruncated>{accountNumber}</Text>
          <Avatar bg="blue.500" margin="0" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TopBar;
