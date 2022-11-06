import { ethers } from 'hardhat';

async function main() {
  const factoryFactory = await ethers.getContractFactory('RobotFactory');
  const factory = factoryFactory.attach('0x852C006e2033b5cDAB1667fD6fCc657e51582Aa3');
  const tx = await factory.mint('0xA6cc9397d29b631b69782e5F7fB9801224C8FA90', 1, 1, 1, 1, 1, 1, {
    value: 50,
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
