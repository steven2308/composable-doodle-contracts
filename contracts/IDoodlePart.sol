// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

interface IDoodlePart {
    function nestMint(
        address parent,
        uint256 destinationId,
        uint64 assetId
    ) external returns (uint256);

    function pricePerAsset(
        uint64 assetId
    ) external view returns (uint256);

    function fullToEquip(uint64 assetId) external view returns (uint64);
}
