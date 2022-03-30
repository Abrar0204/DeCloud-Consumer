import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";

const theme = {
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  fonts: {
    heading: "Poppins",
    text: "Poppins",
    fantasy: "Righteous",
  },
};

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />

    <ChakraProvider theme={extendTheme(theme)}>
      <App />
    </ChakraProvider>
  </>,
  document.getElementById("root")
);
