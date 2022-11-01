import { ethers } from 'hardhat';
import { DoodleBase, DoodleSheet, DoodlePart, RobotFactory } from '../typechain-types';
import {
  BODY_PART_ID,
  HEAD_PART_ID,
  LEGS_PART_ID,
  LEFT_ARM_PART_ID,
  RIGHT_ARM_PART_ID,
} from './constants';

const mainBodiesMetaUris = [
  'ipfs://main/bodies/1',
  'ipfs://main/bodies/2',
  'ipfs://main/bodies/3',
  'ipfs://main/bodies/4',
];
const mainHeadsMetaUris = [
  'ipfs://main/heads/1',
  'ipfs://main/heads/2',
  'ipfs://main/heads/3',
  'ipfs://main/heads/4',
];
const mainLegsMetaUris = [
  'ipfs://main/legs/1',
  'ipfs://main/legs/2',
  'ipfs://main/legs/3',
  'ipfs://main/legs/4',
];
const mainLeftArmsMetaUris = [
  'ipfs://main/leftArms/1',
  'ipfs://main/leftArms/2',
  'ipfs://main/leftArms/3',
  'ipfs://main/leftArms/4',
];
const mainRightArmsMetaUris = [
  'ipfs://main/rightArms/1',
  'ipfs://main/rightArms/2',
  'ipfs://main/rightArms/3',
  'ipfs://main/rightArms/4',
];

const equipBodiesMetaUris = [
  'ipfs://equip/bodies/1',
  'ipfs://equip/bodies/2',
  'ipfs://equip/bodies/3',
  'ipfs://equip/bodies/4',
];
const equipHeadsMetaUris = [
  'ipfs://equip/heads/1',
  'ipfs://equip/heads/2',
  'ipfs://equip/heads/3',
  'ipfs://equip/heads/4',
];
const equipLegsMetaUris = [
  'ipfs://equip/legs/1',
  'ipfs://equip/legs/2',
  'ipfs://equip/legs/3',
  'ipfs://equip/legs/4',
];
const equipLeftArmsMetaUris = [
  'ipfs://equip/leftArms/1',
  'ipfs://equip/leftArms/2',
  'ipfs://equip/leftArms/3',
  'ipfs://equip/leftArms/4',
];
const equipRightArmsMetaUris = [
  'ipfs://equip/rightArms/1',
  'ipfs://equip/rightArms/2',
  'ipfs://equip/rightArms/3',
  'ipfs://equip/rightArms/4',
];
// FIXME: Update ALL later when there are more resources
const fullToEquip = [5, 6, 7, 8];
const prices = [10, 10, 15, 50];
const maxSupplies = [100, 100, 50, 2];

interface Config {
  resourceId: number;
  fullToEquip: number;
  maxSupply: number;
  pricePerResource: number;
}

async function setupParts(
  factory: RobotFactory,
  base: DoodleBase,
  sheet: DoodleSheet,
  head: DoodlePart,
  body: DoodlePart,
  legs: DoodlePart,
  leftArm: DoodlePart,
  rightArm: DoodlePart,
) {
  // BODY

  // This config is the same for all parts
  let configs: Array<Config> = Array();
  for (let i = 0; i < mainBodiesMetaUris.length; i++) {
    configs.push({
      resourceId: i + 1,
      fullToEquip: fullToEquip[i],
      maxSupply: maxSupplies[i],
      pricePerResource: prices[i],
    });
  }

  for (let i = 0; i < mainBodiesMetaUris.length; i++) {
    await body.addResourceEntry(
      {
        id: i + 1,
        equippableGroupId: 0,
        baseAddress: ethers.constants.AddressZero,
        metadataURI: mainBodiesMetaUris[i],
      },
      [],
      [],
    );
    await body.addResourceEntry(
      {
        id: mainBodiesMetaUris.length + i + 1,
        equippableGroupId: 1,
        baseAddress: base.address,
        metadataURI: equipBodiesMetaUris[i],
      },
      [],
      [],
    );
  }
  await body.setValidParentForEquippableGroup(1, sheet.address, BODY_PART_ID);
  await body.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);

  // HEAD
  for (let i = 0; i < mainHeadsMetaUris.length; i++) {
    await head.addResourceEntry(
      {
        id: i + 1,
        equippableGroupId: 0,
        baseAddress: ethers.constants.AddressZero,
        metadataURI: mainHeadsMetaUris[i],
      },
      [],
      [],
    );
    await head.addResourceEntry(
      {
        id: mainHeadsMetaUris.length + i + 1,
        equippableGroupId: 1,
        baseAddress: base.address,
        metadataURI: equipHeadsMetaUris[i],
      },
      [],
      [],
    );
  }
  await head.setValidParentForEquippableGroup(1, sheet.address, HEAD_PART_ID);
  await head.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);

  // Legs
  for (let i = 0; i < mainLegsMetaUris.length; i++) {
    await legs.addResourceEntry(
      {
        id: i + 1,
        equippableGroupId: 0,
        baseAddress: ethers.constants.AddressZero,
        metadataURI: mainLegsMetaUris[i],
      },
      [],
      [],
    );
    await legs.addResourceEntry(
      {
        id: mainLegsMetaUris.length + i + 1,
        equippableGroupId: 1,
        baseAddress: base.address,
        metadataURI: equipLegsMetaUris[i],
      },
      [],
      [],
    );
  }
  await legs.setValidParentForEquippableGroup(1, sheet.address, LEGS_PART_ID);
  await legs.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);

  // Left ARM
  for (let i = 0; i < mainLeftArmsMetaUris.length; i++) {
    await leftArm.addResourceEntry(
      {
        id: i + 1,
        equippableGroupId: 0,
        baseAddress: ethers.constants.AddressZero,
        metadataURI: mainLeftArmsMetaUris[i],
      },
      [],
      [],
    );
    await leftArm.addResourceEntry(
      {
        id: mainLeftArmsMetaUris.length + i + 1,
        equippableGroupId: 1,
        baseAddress: base.address,
        metadataURI: equipLeftArmsMetaUris[i],
      },
      [],
      [],
    );
  }
  await leftArm.setValidParentForEquippableGroup(1, sheet.address, LEFT_ARM_PART_ID);
  await leftArm.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);

  // RIGHT ARM
  for (let i = 0; i < mainRightArmsMetaUris.length; i++) {
    await rightArm.addResourceEntry(
      {
        id: i + 1,
        equippableGroupId: 0,
        baseAddress: ethers.constants.AddressZero,
        metadataURI: mainRightArmsMetaUris[i],
      },
      [],
      [],
    );
    await rightArm.addResourceEntry(
      {
        id: mainRightArmsMetaUris.length + i + 1,
        equippableGroupId: 1,
        baseAddress: base.address,
        metadataURI: equipRightArmsMetaUris[i],
      },
      [],
      [],
    );
  }
  await rightArm.setValidParentForEquippableGroup(1, sheet.address, RIGHT_ARM_PART_ID);
  await rightArm.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);

  console.log('Parts configured');
}

export default setupParts;
