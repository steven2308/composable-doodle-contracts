// SPDX-License-Identifier: GNU GPLv3
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKBaseStorageImpl.sol";

contract DoodleBase is RMRKBaseStorageImpl {
    constructor(string memory metadataURI, string memory type_)
        RMRKBaseStorageImpl(metadataURI, type_)
    {}
}
