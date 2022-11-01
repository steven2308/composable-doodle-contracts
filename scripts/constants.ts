import { ethers } from 'hardhat';

const BODY_PART_ID = 1;
const HEAD_PART_ID = 2;
const LEGS_PART_ID = 3;
const LEFT_ARM_PART_ID = 4;
const RIGHT_ARM_PART_ID = 5;

const ONE_GLMR = ethers.utils.parseEther('1.0');
const ADDRESS_ZERO = ethers.constants.AddressZero;
const ROYALTIES = ethers.BigNumber.from(50_000); // 5%

export {
  BODY_PART_ID,
  HEAD_PART_ID,
  LEGS_PART_ID,
  LEFT_ARM_PART_ID,
  RIGHT_ARM_PART_ID,
  ONE_GLMR,
  ADDRESS_ZERO,
  ROYALTIES,
};
