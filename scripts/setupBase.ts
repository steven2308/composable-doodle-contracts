import { DoodleBase, DoodlePart } from '../typechain-types';

const ITEM_TYPE_FIXED = 1;
import {
  BODY_PART_ID,
  HEAD_PART_ID,
  LEGS_PART_ID,
  LEFT_ARM_PART_ID,
  RIGHT_ARM_PART_ID,
} from './constants';

async function setupBase(
  base: DoodleBase,
  head: DoodlePart,
  body: DoodlePart,
  legs: DoodlePart,
  leftArm: DoodlePart,
  rightArm: DoodlePart,
) {
  await base.addPartList([
    {
      partId: BODY_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 3,
        equippable: [body.address],
        metadataURI: '',
      },
    },
    {
      partId: HEAD_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [head.address],
        metadataURI: '',
      },
    },
    {
      partId: LEGS_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [legs.address],
        metadataURI: '',
      },
    },
    {
      partId: LEFT_ARM_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [leftArm.address],
        metadataURI: '',
      },
    },
    {
      partId: RIGHT_ARM_PART_ID,
      part: {
        itemType: ITEM_TYPE_FIXED,
        z: 2,
        equippable: [rightArm.address],
        metadataURI: '',
      },
    },
  ]);

  console.log('Base configured');
}

export default setupBase;
