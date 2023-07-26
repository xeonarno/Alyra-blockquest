import { createContext, useState, useEffect, useContext } from 'react';
import { useCertificationGetDiplomaData, useCertificationTokenUri, useCertificationBalanceOf, useCertificationTokenOfOwnerByIndex } from '@/context/contract/API';
import { useAccount } from 'wagmi';
import { NFT } from '@/type/nft.type';
import { useGamerContext } from './gamer';
import { Role } from '@/type/user-data.type';


type NFTContextType = {
    nfts: NFT[],
    loading: boolean
}

const NFTContext = createContext<NFTContextType>({
    nfts: [],
    loading: false,
});

export const NFTProvider: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);

    const { address: playerAddress = "0x" } = useAccount();
    const { currentUser } = useGamerContext();

    useEffect(() => {
    
        async function loadNFTs() {
            const { data: balanceOfPlayer = 0 } = useCertificationBalanceOf({ args: [playerAddress] });
            const loadedNfts = [];

            for (let i = 0; i < balanceOfPlayer; i++) {
                const { data: tokenId } = useCertificationTokenOfOwnerByIndex({ args: [playerAddress, BigInt(i)] });
                if (!tokenId) continue;
                const { data: diplomaData } = useCertificationGetDiplomaData({ args: [tokenId] });
                const { data: tokenUri } = useCertificationTokenUri({ args: [tokenId] });

                if (diplomaData && tokenUri) {
                    const { fullname, surname } = diplomaData;

                    const newNft: NFT = {
                        name: fullname,
                        description: surname,
                        imageUri: tokenUri,
                    };

                    loadedNfts.push(newNft);
                }
            }

            setNfts(loadedNfts);
            setLoading(false);
        }

        if (playerAddress && currentUser?.role === 'player') {
            loadNFTs();
        }
    }, [playerAddress, currentUser]);


    return (
        <NFTContext.Provider value={{ nfts, loading }}>
            {children}
        </NFTContext.Provider>
    );
}

export const useNFTContext = () => useContext(NFTContext);
