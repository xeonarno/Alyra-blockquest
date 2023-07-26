"use client" 

import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from 'next/navigation';
import { useGamerContext } from "@/context/gamer";

const Login = () => {
    const { isConnected } = useAccount();
    const { currentUser, hasCompletedProfile } = useGamerContext();

    const router = useRouter();

    // Redirect based on user role
    useEffect(() => {
        console.log('[[Login]]: isConnected:', isConnected);
        console.log('[[Login]]: currentUser:', currentUser);
        console.log('[[Login]]: hasCompletedProfile:', hasCompletedProfile);


        if (currentUser && hasCompletedProfile) {
            if (currentUser.role === "master") {
                router.push("/master");
            } else if (currentUser.role === "player") {
                router.push("/player");
            }
        } else if (currentUser && !hasCompletedProfile) {
            router.push("/inscription");
        }
    }, [currentUser, hasCompletedProfile, isConnected]);

    return (
        <>
            <ConnectButton />
        </>
    );
}

export default Login;
