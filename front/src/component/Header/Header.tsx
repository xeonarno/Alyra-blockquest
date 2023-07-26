"use client"

import { Flex, Image as ChakraImage } from '@chakra-ui/react';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Header = () => {
  const { isConnected } = useAccount();

  return (
    <>
      <Flex
        paddingLeft="1rem"
        paddingRight="1rem"
        paddingBottom="1rem"
        paddingTop="0.1rem"
        justifyContent="space-between"
        alignItems="center"
      >
        <ChakraImage src={"logo.svg"} w="5%" />
        {isConnected && <ConnectButton />}
      </Flex>
    </>
  );
}
export default Header
