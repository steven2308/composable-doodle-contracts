import deployContracts from '../scripts/deployContracts';
import setupBase from '../scripts/setupBase';
import setupParts from '../scripts/setupParts';
import setupSheet from '../scripts/setupSheet';

async function main() {
  const { base, sheet, head, body, legs, leftArm, rightArm, factory } = await deployContracts();
  console.log('Base deployed to: ', base.address);
  console.log('Sheet deployed to: ', sheet.address);
  console.log('Head deployed to: ', head.address);
  console.log('Body deployed to: ', body.address);
  console.log('Legs deployed to: ', legs.address);
  console.log('LeftArm deployed to: ', leftArm.address);
  console.log('RightArm deployed to: ', rightArm.address);
  console.log('Factory deployed to: ', factory.address);

  await setupBase(base, head, body, legs, leftArm, rightArm);
  await setupSheet(factory, base, sheet);
  await setupParts(factory, base, sheet, head, body, legs, leftArm, rightArm);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
