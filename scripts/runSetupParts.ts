import { ethers } from 'hardhat';
import setupParts from './setupParts';
import { DoodleBase, DoodleSheet, DoodlePart, RobotFactory } from '../typechain-types';

async function main() {
  const baseFactory = await ethers.getContractFactory('DoodleBase');
  const factoryFactory = await ethers.getContractFactory('RobotFactory');
  const sheetFactory = await ethers.getContractFactory('DoodleSheet');
  const partFactory = await ethers.getContractFactory('DoodlePart');
  
  const base: DoodleBase = baseFactory.attach('0x21F0EF66E3962b5f76CeD3Cbe3141BE779470631')
  const sheet: DoodleSheet = sheetFactory.attach('0x9f6f4613736Fca87776fD588892eB08a649Da6F2')
  const head: DoodlePart = partFactory.attach('0x8417712a316D3cC328C974D825E1550C8e6f4682')
  const body: DoodlePart = partFactory.attach('0xf7A0359A4e00263a6983E6c9fAbFa7BD93234b49')
  const legs: DoodlePart = partFactory.attach('0x4918Fc7997a442D11B2E3A2472d6cf10Ff9fFc77')
  const leftArm: DoodlePart = partFactory.attach('0xF42Be2522fC244D44e0D2ED50D2462f5f3d3a5f9')
  const rightArm: DoodlePart = partFactory.attach('0x0BFbB08EE018d7a456958DA60f82b40585D42104')
  const factory: RobotFactory = factoryFactory.attach('0x570bc32916aBD507055c3C5B3AF1cbFc9cD25987')

  await setupParts(factory, base, sheet, head, body, legs, leftArm, rightArm)
  console.log('Right arm Configured');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
