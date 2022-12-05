import { ethers } from 'hardhat';
import { RMRKEquipRenderUtils, RMRKMultiAssetRenderUtils } from '../typechain-types';

async function main() {
  const renderUtilsEquipFactory = await ethers.getContractFactory("RMRKEquipRenderUtils");
  const renderUtilsEquip: RMRKEquipRenderUtils = await renderUtilsEquipFactory.deploy();
  console.log('Render Utils (Equippable) deployed at ', renderUtilsEquip.address);

  const renderUtilsFactory = await ethers.getContractFactory("RMRKMultiAssetRenderUtils");
  const renderUtils: RMRKMultiAssetRenderUtils = await renderUtilsFactory.deploy();
  console.log('Render Utils (Multiasset) deployed at ', renderUtils.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
