import { ethers } from "hardhat";
import fs from 'fs/promises';
import path from 'path';

const sourceFolder = path.join(__dirname, '..', 'artifacts', 'contracts');
const destinationFolder = path.join(__dirname, '..', '..', 'front', 'public', 'contracts');

async function deployContract(contractName: string, ...args: any[]) {
  try {
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...args);
    await contract.waitForDeployment();
    console.log(`${contractName} deployed to:`, contract.target);
    return contract;
  } catch (err) {
    console.error(`Failed to deploy ${contractName}: ${err}`);
  }
}

async function main() {

  const [owner] = await ethers.getSigners();

  const contracts = new Map();
  contracts.set('Session', await deployContract('Session'));
  const sessionAddress = contracts.get('Session').target;
  contracts.set('Certification', await deployContract('Certification', sessionAddress));
  
  const certifAddress = contracts.get('Certification').target;
  contracts.set('Team', await deployContract('Team', sessionAddress,certifAddress));
  
  const teamAddress = contracts.get('Team').target;
  contracts.set('Player', await deployContract('Player', teamAddress));
  contracts.set('GameMaster', await deployContract('GameMaster', teamAddress));
  
  try {
    const contractDirs = await fs.readdir(sourceFolder);
    
    // delete all files in destination folder
    const files = await fs.readdir(destinationFolder);
    for (const file of files) {
      await fs.unlink(path.join(destinationFolder, file));
    }

    // copy all json files from source folder to destination folder
    for (const contractDir of contractDirs) {
      const files = await fs.readdir(path.join(sourceFolder, contractDir));

      const jsonFile = files.find((file) => path.extname(file) === '.json' && !file.includes('.dbg'));

      if (jsonFile) {
        const sourceFile = path.join(sourceFolder, contractDir, jsonFile);
        const destinationFile = path.join(destinationFolder, jsonFile);
        await fs.copyFile(sourceFile, destinationFile);
        console.log(`${jsonFile} was copied to ${destinationFolder}`);
      }
    }
  } catch (err) {
    console.error(`Failed to copy files: ${err}`);
  }

  try {
    const contractAddresses: Record<string,string> = {};
    for (const [name, contract] of contracts) {
      contractAddresses[name] = contract.target;
    }
    const json = JSON.stringify(contractAddresses, null, 2);
    await fs.writeFile(path.join(destinationFolder, 'addresses.json'), json);
    console.log(`addresses.json was written to ${destinationFolder}`);
  }catch (err) {
    console.error(`Failed to write addresses.json: ${err}`);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
