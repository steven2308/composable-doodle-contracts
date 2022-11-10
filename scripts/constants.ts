import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';

let IS_PROD = false;
if (network.name === 'moonbeam') {
  IS_PROD = true;
  console.log('Running on moonbeam network (PROD)');
}

const BODY_PART_ID = 1;
const HEAD_PART_ID = 2;
const LEGS_PART_ID = 3;
const LEFT_ARM_PART_ID = 4;
const RIGHT_ARM_PART_ID = 5;

const ONE_GLMR = ethers.utils.parseEther('1.0');
const ADDRESS_ZERO = ethers.constants.AddressZero;
const ROYALTIES = ethers.BigNumber.from(50_000); // 5%

const BASE_META_URI = 'ipfs://QmVVXtXk8z1ExDdFy5WCFX5cWDVTqzaqACH57fP9r3wv2V';
const TOTAL_PARTS = 5;
const BASE_PRICES = [10, 10, 10, 10, 15, 15, 15, 15, 24, 24, 24, 24, 105, 105, 225, 225];

let PRICES: Array<BigNumber>;
let MAX_SUPPLIES: Array<number>;

if (IS_PROD) {
  PRICES = BASE_PRICES.map((price) => {
    return ONE_GLMR.mul(price);
  });
  MAX_SUPPLIES = [150, 150, 150, 150, 100, 100, 100, 100, 50, 50, 50, 50, 10, 10, 4, 4];
} else {
  PRICES = BASE_PRICES.map((price) => {
    return ONE_GLMR.mul(price).div(100);
  });
  MAX_SUPPLIES = [15, 15, 15, 15, 10, 10, 10, 10, 5, 5, 5, 5, 1, 1, 4, 4];
}

async function sleep(seconds: number) {
  if (IS_PROD)
    await new Promise((f) => setTimeout(f, seconds * 1000));
}

export {
  ADDRESS_ZERO,
  BASE_META_URI,
  BODY_PART_ID,
  HEAD_PART_ID,
  IS_PROD,
  LEFT_ARM_PART_ID,
  LEGS_PART_ID,
  MAX_SUPPLIES,
  ONE_GLMR,
  PRICES,
  RIGHT_ARM_PART_ID,
  ROYALTIES,
  TOTAL_PARTS,
  sleep,
};
