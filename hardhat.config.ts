import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mumbai: {
      url: `${process.env.RPC_MUMBAI_URL || ''}`,
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [`0x${process.env.WALLET_PRIVATE_KEY}`]
        : [],
      allowUnlimitedContractSize: true
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || undefined,
  },
};

export default config;
