import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { PRICES } from '../scripts/constants';

function priceFromAssets(
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

async function main() {
  const factoryFactory = await ethers.getContractFactory('RobotFactory');
  const factory = factoryFactory.attach('0x570bc32916aBD507055c3C5B3AF1cbFc9cD25987');
  // const renderUtilsFactory = await ethers.getContractFactory("RMRKEquipRenderUtils");
  // const renderUtils = renderUtilsFactory.attach('0x4e15a52E475c11C14cb339e872bcac8B0EAf087E');
  // const compose = await renderUtils.composeEquippables('0xF81451b44cd9F6347FC573330c53912555c63fC4', 3, 1);
  // console.log(compose);
  const tx = await factory.mint('0xA6cc9397d29b631b69782e5F7fB9801224C8FA90', 1, 1, 1, 1, 1, 1, {
    value: priceFromAssets(1, 1, 1, 1, 1),
  });
  console.log(tx.hash);
  await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
