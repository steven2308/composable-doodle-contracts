import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { DoodleBase, DoodleSheet, DoodlePart, RobotFactory } from '../typechain-types';
import {
  BASE_META_URI,
  BODY_PART_ID,
  HEAD_PART_ID,
  LEFT_ARM_PART_ID,
  LEGS_PART_ID,
  MAX_SUPPLIES,
  PRICES,
  RIGHT_ARM_PART_ID,
  TOTAL_PARTS,
  sleep,
} from './constants';

const mainBodiesMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/main/bodies/${index + 1}`,
);
const mainHeadsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/main/heads/${index + 1}`,
);
const mainLegsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/main/legs/${index + 1}`,
);
const mainLeftArmsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/main/leftArms/${index + 1}`,
);
const mainRightArmsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/main/rightArms/${index + 1}`,
);

const equipBodiesMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/equip/bodies/${index + 1}`,
);
const equipHeadsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/equip/heads/${index + 1}`,
);
const equipLegsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/equip/legs/${index + 1}`,
);
const equipLeftArmsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/equip/leftArms/${index + 1}`,
);
const equipRightArmsMetaUris = Array.from(
  new Array(TOTAL_PARTS),
  (_, index) => `${BASE_META_URI}/equip/rightArms/${index + 1}`,
);

interface Config {
  resourceId: number;
  fullToEquip: number;
  maxSupply: number;
  pricePerResource: BigNumber;
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
  // This config is the same for all parts
  let configs: Array<Config> = Array();
  for (let i = 0; i < TOTAL_PARTS; i++) {
    configs.push({
      resourceId: i + 1,
      fullToEquip: TOTAL_PARTS + i + 1,
      maxSupply: MAX_SUPPLIES[i],
      pricePerResource: PRICES[i],
    });
  }

  // BODIES
  for (let i = 0; i < TOTAL_PARTS; i++) {
    await body.addResourceEntry(
      i + 1,
      0,
      ethers.constants.AddressZero,
      mainBodiesMetaUris[i],
      [],
      [],
    );
    await body.addResourceEntry(
      TOTAL_PARTS + i + 1,
      1,
      base.address,
      equipBodiesMetaUris[i],
      [],
      [],
    );
    await sleep(4);
  }
  await body.setValidParentForEquippableGroup(1, sheet.address, BODY_PART_ID);
  await body.configureResourceEntries(configs);
  await body.updateRoyaltyRecipient(factory.address);
  console.log('Body configured');
  await sleep(12);

  // HEADS
  for (let i = 0; i < TOTAL_PARTS; i++) {
    await head.addResourceEntry(
      i + 1,
      0,
      ethers.constants.AddressZero,
      mainHeadsMetaUris[i],
      [],
      [],
    );
    await head.addResourceEntry(
      TOTAL_PARTS + i + 1,
      1,
      base.address,
      equipHeadsMetaUris[i],
      [],
      [],
    );
    await sleep(4);
  }
  await head.setValidParentForEquippableGroup(1, sheet.address, HEAD_PART_ID);
  await head.configureResourceEntries(configs);
  await head.updateRoyaltyRecipient(factory.address);
  console.log('Head configured');
  await sleep(12);

  // LEGS
  for (let i = 0; i < TOTAL_PARTS; i++) {
    await legs.addResourceEntry(
      i + 1,
      0,
      ethers.constants.AddressZero,
      mainLegsMetaUris[i],
      [],
      [],
    );
    await legs.addResourceEntry(
      TOTAL_PARTS + i + 1,
      1,
      base.address,
      equipLegsMetaUris[i],
      [],
      [],
    );
    await sleep(4);
  }
  await legs.setValidParentForEquippableGroup(1, sheet.address, LEGS_PART_ID);
  await legs.configureResourceEntries(configs);
  await legs.updateRoyaltyRecipient(factory.address);
  console.log('Legs configured');
  await sleep(12);

  // LEFT ARMS
  for (let i = 0; i < TOTAL_PARTS; i++) {
    await leftArm.addResourceEntry(
      i + 1,
      0,
      ethers.constants.AddressZero,
      mainLeftArmsMetaUris[i],
      [],
      [],
    );
    await leftArm.addResourceEntry(
      TOTAL_PARTS + i + 1,
      1,
      base.address,
      equipLeftArmsMetaUris[i],
      [],
      [],
    );
    await sleep(4);
  }
  await leftArm.setValidParentForEquippableGroup(1, sheet.address, LEFT_ARM_PART_ID);
  await leftArm.configureResourceEntries(configs);
  await leftArm.updateRoyaltyRecipient(factory.address);
  console.log('Left arm Configured');
  await sleep(12);

  // RIGHT ARMS
  for (let i = 0; i < TOTAL_PARTS; i++) {
    await rightArm.addResourceEntry(
      i + 1,
      0,
      ethers.constants.AddressZero,
      mainRightArmsMetaUris[i],
      [],
      [],
    );
    await rightArm.addResourceEntry(
      TOTAL_PARTS + i + 1,
      1,
      base.address,
      equipRightArmsMetaUris[i],
      [],
      [],
    );
    await sleep(4);
  }
  await rightArm.setValidParentForEquippableGroup(1, sheet.address, RIGHT_ARM_PART_ID);
  await rightArm.configureResourceEntries(configs);
  await rightArm.updateRoyaltyRecipient(factory.address);
  console.log('Right arm Configured');
}

export default setupParts;
