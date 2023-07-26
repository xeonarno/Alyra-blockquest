import { RoomTemplate, generate } from '@halftheopposite/dungeon';
import { ethers } from "hardhat";
import room from '../data/rooms.json';
import { DungeonDrawer } from './helper/DungeonDrawer';
import { NFTStorage, File } from 'nft.storage';
import { readFile } from 'fs/promises';

async function main() {
  // Get latest block number
  const latestBlockNumber = await ethers.provider.getBlockNumber();

  console.log('Number of latest block: ', latestBlockNumber);

  // Upload to IPFS
  const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY || '' });


  const NFTsData = [];
  // Get block hashes 
  for (let i = latestBlockNumber - 256; i <= latestBlockNumber; i++) {
    const block = await ethers.provider.getBlock(i);
    if (block) {
      console.log(`Block number: ${i}, Block hash: ${block.hash}`);

      const dungeon = generate({
        rooms: room as any,
        mapWidth: 96,
        mapHeight: 56,
        mapGutterWidth: 1,
        iterations: 5,
        containerSplitRetries: 20,
        containerMinimumRatio: 0.45,
        containerMinimumSize: 4,
        corridorWidth: 2,
        seed: "helloworld",
      });
      console.log('Dungeon', dungeon);

      const div = new HTMLDivElement();
      const draw = new DungeonDrawer(div);

      draw.draw(dungeon, {
        unitWidthInPixels: 16,
        debug: false
      });
      draw.saveAsPNG('../data/  output/' + block.hash + '.png');
      // ERROR ! PIXI.Texture.from("assets/tiles/hole.png");

      const blob = await readFile('../data/output/' + block.hash + '.png', 'binary');

      // add nft.storage the image
      const url = await nftStorage.store({
        name: 'Dungeon'+ block.hash,
        description: 'Dungeon'+ block.hash,
        image: new File([blob], 'dungeon.png', { type: 'image/png' }),
        properties: {
          blockHash: block.hash,
          blockNumber: i,
        },
      });
      NFTsData.push(url);
    }

    console.table(NFTsData);

  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
