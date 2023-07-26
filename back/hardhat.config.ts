import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const PK = process.env.PK || ""
const RPC_URL = process.env.RPC_URL || ""

const config: HardhatUserConfig = {
  solidity:{
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: RPC_URL,
      accounts: [`0x${PK}`],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
  },
  gasReporter: {
    currency: "EUR",
    gasPrice: 22.46,
  },
  
};

export default config;