import { DoodleCatalog, DoodleSheet, RobotFactory } from '../typechain-types';
import {
  BASE_META_URI,
  BODY_PART_ID,
  HEAD_PART_ID,
  LEFT_ARM_PART_ID,
  LEGS_PART_ID,
  RIGHT_ARM_PART_ID,
} from './constants';

const sheetMetaUris = Array.from(
  new Array(3),
  (_, index) => `${BASE_META_URI}/sheets/${index + 1}`,
);

async function setupSheet(factory: RobotFactory, base: DoodleCatalog, sheet: DoodleSheet) {
  for (let i = 0; i < sheetMetaUris.length; i++) {
    await sheet.addAssetEntry(
      i + 1,
      0,
      base.address,
      sheetMetaUris[i],
      [BODY_PART_ID, HEAD_PART_ID, LEGS_PART_ID, LEFT_ARM_PART_ID, RIGHT_ARM_PART_ID],
    );
    await sheet.updateRoyaltyRecipient(factory.address);
  }

  console.log('Sheet configured');
}

export default setupSheet;
