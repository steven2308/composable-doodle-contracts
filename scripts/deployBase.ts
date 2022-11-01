import { ethers } from 'hardhat';
import { DoodleBase } from '../typechain-types';

const META_URI = 'ipfs://base';
const ITEM_TYPE_FIXED = 1;

const BODY_PART_ID = 1;
const HEAD_PART_ID = 2;
const LEGS_PART_ID = 3;
const LEFT_ARM_PART_ID = 4;
const RIGHT_ARM_PART_ID = 5;

async function main() {
  const baseFactory = await ethers.getContractFactory('DoodleBase');
  const base: DoodleBase = await baseFactory.deploy(META_URI, 'image/png');
  await base.deployed();

  await base.addPartList([
    {
      partId: BODY_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 3,
        equippable: [],
        metadataURI: '',
      },
    },
    {
      partId: HEAD_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [],
        metadataURI: '',
      },
    },
    {
      partId: LEGS_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [],
        metadataURI: '',
      },
    },
    {
      partId: LEFT_ARM_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [],
        metadataURI: '',
      },
    },
    {
      partId: RIGHT_ARM_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [],
        metadataURI: '',
      },
    },
  ]);

  console.log('Base deployed at: %s', base.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
