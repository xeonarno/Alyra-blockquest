"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useToast } from "@chakra-ui/react";
import { useTeamOwner } from "./contract/API";

type OwnerContextType = {
	isOwner: boolean,
}

const OwnerContext = createContext<OwnerContextType>({
	isOwner:false,
});

export const OwnerContextProvider: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
	console.log('[[OwnerContextProvider]]: INIT !');
    const [isOwner, setOwner] = useState(false);

    const { isConnected, address } = useAccount();
    const { data:ownerAddress } = useTeamOwner();

    const toast = useToast();

    useEffect(()=> {
        console.log('[[OWNER]]  connected :', isConnected);
        if(isConnected && address)
        {
            const isAdmin = async()=> {
                try {
                    
                    console.log(`[OwnerContextProvider]: owner: ${ownerAddress} / user:${address}`);
                    setOwner(address === ownerAddress);
                    console.log(`[OwnerContextProvider]: change owner to ${ownerAddress}: ${address === ownerAddress}`);

                }catch(error) {
                    console.error(error);
                    toast({
                        title: 'Error.',
                        description: 'Problème administrateur, reload in 3sec...',
                        status: 'error',
                        duration: 4500,
                        isClosable: true,
                        position: 'top',
                    });
                    // Problem with Solidity
                    setTimeout(()=> {
                        window.location.reload();
                    },3000);
                }
            }
            isAdmin();
        }else {
            console.log('[[OwnerContextProvider]]: disable owner (not connected)');
            setOwner(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, address, ownerAddress])

	return(
		<OwnerContext.Provider value={{ isOwner }}>
			{ children }
		</OwnerContext.Provider>
	);
};

export const useOwnerContext = ()=> useContext(OwnerContext);