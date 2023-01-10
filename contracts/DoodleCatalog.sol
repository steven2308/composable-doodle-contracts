// SPDX-License-Identifier: GNU GPLv3
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKCatalogImpl.sol";

contract DoodleCatalog is RMRKCatalogImpl {
    constructor(
        string memory metadataURI,
        string memory type_
    ) RMRKCatalogImpl(metadataURI, type_) {}
}
