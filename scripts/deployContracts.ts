import { ethers } from 'hardhat';
import { DoodleBase, DoodlePart, DoodleSheet, RobotFactory } from '../typechain-types';
import { ADDRESS_ZERO } from './constants';

async function deployContracts() {
  const baseFactory = await ethers.getContractFactory('DoodleBase');
  const factoryFactory = await ethers.getContractFactory('RobotFactory');
  const sheetFactory = await ethers.getContractFactory('DoodleSheet');
  const partFactory = await ethers.getContractFactory('DoodlePart');

  const base = <DoodleBase>await baseFactory.deploy('ipfs://QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/base', 'image/png');
  const sheet = <DoodleSheet>await sheetFactory.deploy('ipfs://QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/sheet', ADDRESS_ZERO);
  const head = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Bot Heads',
      'CDBH',
      'ipfs:/QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/heads',
      ADDRESS_ZERO,
    )
  );
  const body = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Bot Bodies',
      'CDBB',
      'ipfs:/QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/bodies',
      ADDRESS_ZERO,
    )
  );
  const legs = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Bot Legs',
      'CDBL',
      'ipfs:/QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/legs',
      ADDRESS_ZERO,
    )
  );
  const leftArm = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Bot Left Arms',
      'CDBLA',
      'ipfs:/QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/leftArms',
      ADDRESS_ZERO,
    )
  );
  const rightArm = <DoodlePart>(
    await partFactory.deploy(
      'Composable Doodle Robot Right Arms',
      'CDBRA',
      'ipfs:/QmU7hgSNywFcxzG6FcQXpBWjszf9sBRKYrr5yyoJgs9Q9j/collections/rightArms',
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
