import { Box, Heading, Text, Image, Spinner, Center } from '@chakra-ui/react';
import { useNFTContext } from '@/context/nft';

function NFTGallery() {
    const { nfts, loading } = useNFTContext();

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (nfts.length === 0) {
        return <Text>No NFTs to display.</Text>
    }

    return (
        <Box>
            {nfts.map((nft, index) => (
                <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" p="6">
                    <Heading mb="2">{nft.name}</Heading>
                    <Text mb="4">{nft.description}</Text>
                    <Image src={nft.imageUri} alt={nft.name} />
                </Box>
            ))}
        </Box>
    );
}

export default NFTGallery;
