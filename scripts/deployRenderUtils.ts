import { ethers } from 'hardhat';
import { RMRKEquipRenderUtils, RMRKMultiResourceRenderUtils } from '../typechain-types';

async function main() {
  const renderUtilsEquipFactory = await ethers.getContractFactory("RMRKEquipRenderUtils");
  const renderUtilsEquip: RMRKEquipRenderUtils = await renderUtilsEquipFactory.deploy();
  console.log('Render Utils (Equippable) deployed at ', renderUtilsEquip.address);

  const renderUtilsFactory = await ethers.getContractFactory("RMRKMultiResourceRenderUtils");
  const renderUtils: RMRKMultiResourceRenderUtils = await renderUtilsFactory.deploy();
  console.log('Render Utils (Multiresource) deployed at ', renderUtils.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
