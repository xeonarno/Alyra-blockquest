"use client"

import Header from '../component/Header/Header'
import Footer from '../component/Footer/Footer'
import { Flex } from '@chakra-ui/react'

import LayoutProps from '@/type/layout-props.type';

export default function Layout({ children }: LayoutProps) {
  return (
    <Flex
      direction="column"
      h="100vh"
      justifyContent="start"
      flex="1"
    >
      <Header/>
      <Flex grow="1" p="1rem"
      justifyContent="center">
        {children}
      </Flex>
      <Footer />
    </Flex>
  )
}
