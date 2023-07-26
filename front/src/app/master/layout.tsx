"use client"

import Footer from '@/component/Footer/Footer';
import LayoutProps from '@/type/layout-props.type';
import {
    Box,
    Flex, Stack, Link, useColorModeValue, Image as ChakraImage
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';


interface NavItem {
    label: string;
    href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
    {
        label: 'Inspiration',
        href: '#',
    },
    {
        label: 'Find Work',
        href: '#',
    },
    {
        label: 'Learn Design',
        href: '#',
    },
    {
        label: 'Hire Designers',
        href: '#',
    },
];

export default function LayoutMaster({ children }: LayoutProps) {

    return (
        <Flex
        direction={'column'}
        >
                <Flex
                    bg={useColorModeValue('white', 'gray.800')}
                    color={useColorModeValue('gray.600', 'white')}
                    minH={'60px'}
                    py={{ base: 2 }}
                    px={{ base: 4 }}
                    borderBottom={1}
                    borderStyle={'solid'}
                    borderColor={useColorModeValue('gray.200', 'gray.900')}
                    align={'center'}>
                    <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                        <ChakraImage src={"logo.svg"} w="5%" />
                        <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                            <DesktopNav />
                        </Flex>
                    </Flex>

                    <Stack
                        flex={{ base: 1, md: 0 }}
                        justify={'flex-end'}
                        direction={'row'}
                        spacing={12}>
                        <ConnectButton />
                    </Stack>
                </Flex>
            
            <Flex grow="1" p="1rem"
                justifyContent="center">
                {children}
            </Flex>
            <Footer />
        </Flex>
    );
}

const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');

    return (
        <Stack direction={'row'} spacing={0}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Link
                        p={2}
                        href={navItem.href ?? '#'}
                        fontSize={'sm'}
                        fontWeight={500}
                        color={linkColor}
                        _hover={{
                            textDecoration: 'none',
                            color: linkHoverColor,
                        }}>
                        {navItem.label}
                    </Link>

                </Box>
            ))}
        </Stack>
    );
};
