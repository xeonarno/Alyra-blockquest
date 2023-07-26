import { ContractConfig, defineConfig, loadEnv } from '@wagmi/cli'
import { etherscan, react } from '@wagmi/cli/plugins'
import { hardhat, sepolia } from 'wagmi/chains'
import { Abi, Address } from 'viem';

import 'dotenv';

import CertificationABI from './public/contracts/Certification.json';
import GameMasterABI from './public/contracts/GameMaster.json';
import PlayerABI from './public/contracts/Player.json';
import SessionABI from './public/contracts/Session.json';
import TeamABI from './public/contracts/Team.json';

import addresses from './public/contracts/addresses.json';

const contracts: ContractConfig[] = [
    {
        name: 'Certification',
        abi: CertificationABI.abi as Abi,
        address: {
            [hardhat.id]: addresses.Certification as Address,
            // [sepolia.id]: '0x0',
        },
    },
    {
        name: 'Session',
        abi: SessionABI.abi as Abi,
        address: {
            [hardhat.id]: addresses.Session as Address,
            // [sepolia.id]: '0x0',
        },
    },
    {
        name: 'GameMaster',
        abi: GameMasterABI.abi as Abi,
        address: {
            [hardhat.id]: addresses.GameMaster as Address,
            // [sepolia.id]: '0x0',
        },
    },
    {
        name: 'Player',
        abi: PlayerABI.abi as Abi,
        address: {
            [hardhat.id]: addresses.Player as Address,
            // [sepolia.id]: '0x0',
        },
    },
    {
        name: 'Team',
        abi: TeamABI.abi as Abi,
        address: {
            [hardhat.id]: addresses.Team as Address,
            // [sepolia.id]: '0x0',
        },
    },
];

export default defineConfig(() => {
    const env = loadEnv({
        mode: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
        envDir: process.cwd(),
    });

    const etherScanOptions = {
        apiKey: env.ETHERSCAN_API_KEY,
        contracts,
        chainId: sepolia.id,
    };

    return {
        out: 'src/context/contract/API.ts',
        contracts,
        plugins: [
            // etherscan(etherScanOptions as any),
            react(),
        ]
    };
})
