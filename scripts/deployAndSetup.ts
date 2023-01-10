import deployContracts from './deployContracts';
import setupCatalog from './setupCatalog';
import setupParts from './setupParts';
import setupSheet from './setupSheet';
import { sleep } from './constants';

async function main() {
  const { base, sheet, head, body, legs, leftArm, rightArm, factory } = await deployContracts();
  console.log('Catalog deployed to: ', base.address);
  console.log('Sheet deployed to: ', sheet.address);
  console.log('Head deployed to: ', head.address);
  console.log('Body deployed to: ', body.address);
  console.log('Legs deployed to: ', legs.address);
  console.log('LeftArm deployed to: ', leftArm.address);
  console.log('RightArm deployed to: ', rightArm.address);
  console.log('Factory deployed to: ', factory.address);
  await sleep(12);

  await setupCatalog(base, head, body, legs, leftArm, rightArm);
  await sleep(12);
  await setupSheet(factory, base, sheet);
  await sleep(12);
  await setupParts(factory, base, sheet, head, body, legs, leftArm, rightArm);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
