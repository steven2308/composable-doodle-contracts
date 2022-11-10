// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

interface IDoodlePart {
    function nestMint(
        address parent,
        uint256 destinationId,
        uint64 resourceId
    ) external returns (uint256);

    function pricePerResource(
        uint64 resourceId
    ) external view returns (uint256);

    function fullToEquip(uint64 resourceId) external view returns (uint64);
}
