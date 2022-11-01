import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DoodleBase, DoodlePart, DoodleSheet, RobotFactory } from '../typechain-types';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import setupBase from '../scripts/setupBase';
import setupParts from '../scripts/setupParts';
import setupSheet from '../scripts/setupSheet';

const ONE_GLMR = ethers.utils.parseEther('1.0');
const ADDRESS_ZERO = ethers.constants.AddressZero;
const ROYALTIES = bn(50_000); // 5%

async function allContractsFactory(): Promise<{
  base: DoodleBase;
  sheet: DoodleSheet;
  head: DoodlePart;
  body: DoodlePart;
  legs: DoodlePart;
  leftArm: DoodlePart;
  rightArm: DoodlePart;
  factory: RobotFactory;
}> {
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

  await setupBase(base, head, body, legs, leftArm, rightArm);
  await setupSheet(base, sheet);
  await setupParts(base, sheet, head, body, legs, leftArm, rightArm);

  return { base, sheet, head, body, legs, leftArm, rightArm, factory };
}

describe('Doodle Minting', async () => {
  let factory: RobotFactory;
  let base: DoodleBase;
  let sheet: DoodleSheet;
  let head: DoodlePart;
  let body: DoodlePart;
  let legs: DoodlePart;
  let leftArm: DoodlePart;
  let rightArm: DoodlePart;

  let addrs: SignerWithAddress[];
  let owner: SignerWithAddress;
  let partner1: SignerWithAddress;
  let partner2: SignerWithAddress;
  let buyer: SignerWithAddress;

  beforeEach(async function () {
    [owner, partner1, partner2, buyer, buyer, ...addrs] = await ethers.getSigners();
    ({ base, sheet, head, body, legs, leftArm, rightArm, factory } = await loadFixture(
      allContractsFactory,
    ));

    await factory.updatePartner1(partner1.address);
    await factory.updatePartner2(partner2.address);
  });

  it('can mint from factory', async () => {
    await factory.setSalesOpen(true);
    await expect(
      factory.connect(buyer).mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: bn(10).mul(5) }),
    )
      .to.emit(factory, 'BotBuilt')
      .withArgs(buyer.address, 1, 1, 2, 1, 2, 1, 2);
  });

  it('cannot mint if sales not open', async () => {
    await expect(
      factory.connect(buyer).mint(buyer.address, 1, 1, 1, 1, 1, 1, { value: bn(10).mul(5) }),
    ).to.be.revertedWithCustomError(factory, 'SalesNotOpen');
  });

  it.only('cannot mint part out of stock', async () => {});

  it.only('cannot mint beyond max supply', async () => {});

  it.only('cannot only mint one full set', async () => {});

  it.only('cannot only mint from factory', async () => {});
});

function bn(value: number): BigNumber {
  return BigNumber.from(value);
}
