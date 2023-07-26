"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLocalStorage } from 'usehooks-ts'
import { Role, UserData } from "@/type/user-data.type";

type GamerContextType = {
    users: UserData[]; 
    currentUser: UserData | null;
    hasCompletedProfile: boolean;
    updateUser: (user: UserData) => void;
    switchUser: (address: string) => void;
}

const GamerContext = createContext<GamerContextType>({
    users: [],
    currentUser: null,
    hasCompletedProfile: false,
    updateUser: () => {},
    switchUser: () => {},
});

export const GamerContextProvider: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
    const { isConnected, address } = useAccount();
    const [users, setUsers] = useLocalStorage<UserData[]>('users', []);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

    const updateUser = (updatedUser: UserData) => {
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.address === updatedUser.address ? updatedUser : user)
        );
        setCurrentUser(updatedUser);
    }

    const switchUser = (address: string) => {
        setCurrentUser(users.find(user => user.address === address) || null);
    }

    useEffect(() => {
        if (currentUser) {
            const { name, surname, image, description } = currentUser;
            if (name && surname && image && description) {
                setHasCompletedProfile(true);
            } else {
                setHasCompletedProfile(false);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        if (isConnected && address) {
            let existingUser = users.find(user => user.address === address);
            if (!existingUser) {
                const newUser = {
                    address,
                    role: 'player' as Role,
                    name: '',
                    surname:'',
                    image: '',
                    description: '',
                }
                setUsers(prevUsers => [...prevUsers, newUser]);
                existingUser = newUser;
            }
            setCurrentUser(existingUser);
        }
    }, [isConnected, address]);

    return (
        <GamerContext.Provider value={{ users, currentUser, hasCompletedProfile, updateUser, switchUser }}>
            { children }
        </GamerContext.Provider>
    );
};

export const useGamerContext = () => useContext(GamerContext);
