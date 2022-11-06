import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DoodleBase, DoodlePart, DoodleSheet, RobotFactory } from '../typechain-types';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import deployContracts from '../scripts/deployContracts';
import setupBase from '../scripts/setupBase';
import setupParts from '../scripts/setupParts';
import setupSheet from '../scripts/setupSheet';
import { BASE_META_URI, MAX_SUPPLIES, PRICES, TOTAL_PARTS } from '../scripts/constants';

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
  const { base, sheet, head, body, legs, leftArm, rightArm, factory } = await deployContracts();

  await setupBase(base, head, body, legs, leftArm, rightArm);
  await setupSheet(factory, base, sheet);
  await setupParts(factory, base, sheet, head, body, legs, leftArm, rightArm);

  return { base, sheet, head, body, legs, leftArm, rightArm, factory };
}

describe('Doodle Minting', async () => {
  let factory: RobotFactory;
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
    ({ sheet, head, body, legs, leftArm, rightArm, factory } = await loadFixture(
      allContractsFactory,
    ));

    await factory.updatePartner1(partner1.address);
    await factory.updatePartner2(partner2.address);
  });

  describe('Config', async () => {
    it('can get max supply per resource', async () => {
      expect(await head['maxSupply()']()).to.eql(bn(1000));
      expect(await head['maxSupply(uint64)'](1)).to.eql(bn(MAX_SUPPLIES[0]));
      expect(await head['maxSupply(uint64)'](4)).to.eql(bn(MAX_SUPPLIES[3]));
    });

    it('can get price per resource', async () => {
      expect(await head.pricePerResource(1)).to.eql(PRICES[1 - 1]);
      expect(await head.pricePerResource(2)).to.eql(PRICES[2 - 1]);
      expect(await head.pricePerResource(3)).to.eql(PRICES[3 - 1]);
      expect(await head.pricePerResource(4)).to.eql(PRICES[4 - 1]);
    });

    it('can get factory address', async () => {
      expect(await sheet.getFactory()).to.eql(factory.address);
      expect(await head.getFactory()).to.eql(factory.address);
      expect(await body.getFactory()).to.eql(factory.address);
      expect(await legs.getFactory()).to.eql(factory.address);
      expect(await leftArm.getFactory()).to.eql(factory.address);
      expect(await rightArm.getFactory()).to.eql(factory.address);
    });

    it('can get part addresses', async () => {
      expect(await factory.sheetAddress()).to.eql(sheet.address);
      expect(await factory.bodyAddress()).to.eql(body.address);
      expect(await factory.headAddress()).to.eql(head.address);
      expect(await factory.legsAddress()).to.eql(legs.address);
      expect(await factory.leftArmAddress()).to.eql(leftArm.address);
      expect(await factory.rightArmAddress()).to.eql(rightArm.address);
    });
  });

  describe('Minting', async () => {
    it('can mint from factory', async () => {
      await factory.setSalesOpen(true);
      await expect(
        factory
          .connect(buyer)
          .mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: priceFromResources(2, 1, 2, 1, 2) }),
      )
        .to.emit(factory, 'BotBuilt')
        .withArgs(buyer.address, 1, 1, 2, 1, 2, 1, 2);

      expect(await head['totalSupply()']()).to.eql(bn(1));
      expect(await head['totalSupply(uint64)'](1)).to.eql(bn(1));
      expect(await head.tokenURI(1)).to.eql(`${BASE_META_URI}/main/heads/1`);
      expect(await sheet.tokenURI(1)).to.eql(`${BASE_META_URI}/sheets/1`);
    });

    it('cannot mint same combination twice', async () => {
      await factory.setSalesOpen(true);
      await factory
        .connect(buyer)
        .mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: priceFromResources(2, 1, 2, 1, 2) });

      expect(await factory.isCombinationMinted(2, 1, 2, 1, 2)).to.eql(true);
      expect(await factory.isCombinationMinted(1, 1, 2, 1, 2)).to.eql(false);

      await expect(
        factory
          .connect(buyer)
          .mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: priceFromResources(2, 1, 2, 1, 2) }),
      ).to.be.revertedWithCustomError(factory, 'CombinationAlreadyMinted');
    });

    it('cannot mint if sales not open', async () => {
      await expect(
        factory
          .connect(buyer)
          .mint(buyer.address, 1, 1, 1, 1, 1, 1, { value: priceFromResources(1, 1, 1, 1, 1) }),
      ).to.be.revertedWithCustomError(factory, 'SalesNotOpen');
    });

    it('cannot mint with lower price', async () => {
      await factory.setSalesOpen(true);
      await expect(
        factory.connect(buyer).mint(buyer.address, 1, 1, 1, 1, 1, 1, {
          value: priceFromResources(1, 1, 1, 1, 1).div(2),
        }),
      ).to.be.revertedWithCustomError(factory, 'MintUnderpriced');
    });

    it('cannot mint part out of stock', async () => {
      await factory.setSalesOpen(true);
      const sheetId = 1; // We'll use always the same sheet
      const bodyResId = 1; // We'll use always the same body, but vary others since we cannot repeat
      const maxMints = MAX_SUPPLIES[0]; // This is the max supply for body of type 1
      let headResId = 1;
      let legsResId = 1;
      let leftArmResId = 1;
      let rightArmResId = 1;

      for (let i = 0; i < maxMints; i++) {
        await factory
          .connect(buyer)
          .mint(
            buyer.address,
            sheetId,
            bodyResId,
            headResId,
            legsResId,
            leftArmResId,
            rightArmResId,
            {
              value: priceFromResources(
                bodyResId,
                headResId,
                legsResId,
                leftArmResId,
                rightArmResId,
              ),
            },
          );

        headResId += 1;
        if (headResId == 6) {
          headResId = 1;
          legsResId += 1;
        }
        if (legsResId == 6) {
          legsResId = 1;
          leftArmResId += 1;
        }
        if (leftArmResId == 6) {
          leftArmResId = 1;
          rightArmResId += 1;
        }
        expect(rightArmResId).to.be.below(6, 'Cannot test with so few parts');
      }

      // Here we've minted all the possible bodies for type 1. Next should revert
      await expect(
        factory
          .connect(buyer)
          .mint(
            buyer.address,
            sheetId,
            bodyResId,
            headResId,
            legsResId,
            leftArmResId,
            rightArmResId,
            {
              value: priceFromResources(
                bodyResId,
                headResId,
                legsResId,
                leftArmResId,
                rightArmResId,
              ),
            },
          ),
      ).to.be.revertedWithCustomError(body, 'PartOutOfStock');
    });

    it('cannot only mint from factory', async () => {
      await expect(head.connect(buyer).nestMint(sheet.address, 1, 1)).to.be.revertedWithCustomError(
        head,
        'OnlyFactoryCanMint',
      );
      await expect(sheet.connect(buyer).mint(sheet.address, 1)).to.be.revertedWithCustomError(
        sheet,
        'OnlyFactoryCanMint',
      );
    });
  });

  describe('Partners', async () => {
    it('can withdraw raised', async () => {
      await factory.setSalesOpen(true);
      const price1 = priceFromResources(2, 1, 2, 1, 2);
      const price2 = priceFromResources(2, 2, 2, 2, 2);
      await factory.connect(buyer).mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: price1 });
      await factory.connect(buyer).mint(buyer.address, 2, 2, 2, 2, 2, 2, { value: price2 });

      const totalPrice = price1.add(price2);
      const partner1Pay = totalPrice.mul(70).div(100);
      const partner2Pay = totalPrice.mul(30).div(100);
      expect(await factory.partner1Balance()).to.eql(partner1Pay);
      expect(await factory.partner2Balance()).to.eql(partner2Pay);

      const init_balance = await ethers.provider.getBalance(addrs[1].address);
      await factory.connect(partner1).withdrawRaised(addrs[1].address);
      await factory.connect(partner2).withdrawRaised(addrs[2].address);

      expect(await ethers.provider.getBalance(addrs[1].address)).to.eql(
        init_balance.add(partner1Pay),
      );
      expect(await ethers.provider.getBalance(addrs[2].address)).to.eql(
        init_balance.add(partner2Pay),
      );

      expect(await factory.partner1Balance()).to.eql(bn(0));
      expect(await factory.partner2Balance()).to.eql(bn(0));
    });

    it('can withdraw royalties', async () => {
      // Suppose a marketplace is sending royalties:
      const tx = {
        to: factory.address,
        value: bn(10),
      };
      await addrs[0].sendTransaction(tx);

      expect(await factory.partner1Balance()).to.eql(bn(7));
      expect(await factory.partner2Balance()).to.eql(bn(3));

      const init_balance = await ethers.provider.getBalance(addrs[1].address);
      await factory.connect(partner1).withdrawRaised(addrs[1].address);
      await factory.connect(partner2).withdrawRaised(addrs[2].address);

      expect(await ethers.provider.getBalance(addrs[1].address)).to.eql(init_balance.add(bn(7)));
      expect(await ethers.provider.getBalance(addrs[2].address)).to.eql(init_balance.add(bn(3)));

      expect(await factory.partner1Balance()).to.eql(bn(0));
      expect(await factory.partner2Balance()).to.eql(bn(0));
    });

    it('cannot withdraw if not a partner', async () => {
      await factory.setSalesOpen(true);
      await factory
        .connect(buyer)
        .mint(buyer.address, 1, 2, 1, 2, 1, 2, { value: priceFromResources(2, 1, 2, 1, 2) });
      await expect(
        factory.connect(buyer).withdrawRaised(buyer.address),
      ).to.be.revertedWithCustomError(factory, 'OnlyParternsCanWithdraw');
    });

    it('cannot withdraw if there is no balance', async () => {
      await expect(
        factory.connect(partner1).withdrawRaised(addrs[1].address),
      ).to.be.revertedWithCustomError(factory, 'NothingToWithdraw');
    });

    it('cannot update partner if not partner', async () => {
      await expect(
        factory.connect(buyer).updatePartner1(buyer.address),
      ).to.be.revertedWithCustomError(factory, 'OnlyParterCanUpdateItsAddress');
    });

    it('cannot update partner other partners address', async () => {
      await expect(
        factory.connect(partner2).updatePartner1(partner2.address),
      ).to.be.revertedWithCustomError(factory, 'OnlyParterCanUpdateItsAddress');
      await expect(
        factory.connect(partner1).updatePartner2(partner1.address),
      ).to.be.revertedWithCustomError(factory, 'OnlyParterCanUpdateItsAddress');
    });
  });
});

function bn(value: number): BigNumber {
  return BigNumber.from(value);
}

function priceFromResources(
  bodyResId: number,
  headResId: number,
  legsResId: number,
  leftArmResId: number,
  rightArmResId: number,
): BigNumber {
  return PRICES[bodyResId - 1]
    .add(PRICES[headResId - 1])
    .add(PRICES[legsResId - 1])
    .add(PRICES[leftArmResId - 1])
    .add(PRICES[rightArmResId - 1]);
}
