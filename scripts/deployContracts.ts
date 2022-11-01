import { ethers } from 'hardhat';
import { DoodleBase, DoodlePart, DoodleSheet, RobotFactory } from '../typechain-types';
import { ONE_GLMR, ADDRESS_ZERO } from './constants';

async function deployContracts() {
  const baseFactory = await ethers.getContractFactory('DoodleBase');
  const factoryFactory = await ethers.getContractFactory('RobotFactory');
  const sheetFactory = await ethers.getContractFactory('DoodleSheet');
  const partFactory = await ethers.getContractFactory('DoodlePart');

  const base = <DoodleBase>await baseFactory.deploy('ipfs://base_meta', 'image/png');
  const sheet = <DoodleSheet>await sheetFactory.deploy('ipfs://collection_meta', ADDRESS_ZERO);
  const head = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Head',
      'CDRH',
      'ipfs:/head-meta',
      ONE_GLMR,
      ADDRESS_ZERO,
    )
  );
  const body = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Body',
      'CDRB',
      'ipfs:/head-meta',
      ONE_GLMR,
      ADDRESS_ZERO,
    )
  );
  const legs = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Legs',
      'CDRL',
      'ipfs:/head-meta',
      ONE_GLMR,
      ADDRESS_ZERO,
    )
  );
  const leftArm = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Left Arm',
      'CDRLA',
      'ipfs:/head-meta',
      ONE_GLMR,
      ADDRESS_ZERO,
    )
  );
  const rightArm = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Right Arm',
      'CDRRA',
      'ipfs:/head-meta',
      ONE_GLMR,
      ADDRESS_ZERO,
    )
  );

  await base.deployed();
  await sheet.deployed();
  await head.deployed();
  await body.deployed();
  await legs.deployed();
  await leftArm.deployed();
  await rightArm.deployed();

  const factory = <RobotFactory>(
    await factoryFactory.deploy(
      sheet.address,
      body.address,
      head.address,
      legs.address,
      leftArm.address,
      rightArm.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
    )
  );
  await factory.deployed();

  await sheet.updateFactory(factory.address);
  await head.updateFactory(factory.address);
  await body.updateFactory(factory.address);
  await legs.updateFactory(factory.address);
  await leftArm.updateFactory(factory.address);
  await rightArm.updateFactory(factory.address);

  return { base, sheet, head, body, legs, leftArm, rightArm, factory };
}

export default deployContracts;
