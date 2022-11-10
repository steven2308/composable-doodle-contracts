// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

interface IDoodleSheet {
    function mint(address to, uint64 resourceId) external returns (uint256);

    function acceptChildrenFromFactory(
        uint256 tokenId,
        address body,
        address head,
        address legs,
        address rightArm,
        address leftArm
    ) external;

    function equipFromFactory(
        uint256 tokenId,
        uint64 sheetResId,
        uint64 bodyResId,
        uint64 headResId,
        uint64 legsResId,
        uint64 leftArmResId,
        uint64 rightArmResId
    ) external;
}
