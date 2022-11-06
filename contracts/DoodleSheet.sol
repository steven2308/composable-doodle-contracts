// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKMintingUtils.sol";
import "./IDoodleSheet.sol";

error OnlyFactoryCanMint();

contract DoodleSheet is
    IDoodleSheet,
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    uint64 private constant _BODY_PART_ID = 1;
    uint64 private constant _HEAD_PART_ID = 2;
    uint64 private constant _LEGS_PART_ID = 3;
    uint64 private constant _LEFT_ARM_PART_ID = 4;
    uint64 private constant _RIGHT_ARM_PART_ID = 5;

    address private _factory;
    mapping(uint64 => uint256) private _totalSupplyPerResource;

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    constructor(string memory collectionMetadata_, address royaltyRecipient)
        RMRKMintingUtils(1000, 0)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, 500) // 500 -> 5%
        RMRKEquippable("Composable Doodle Sheet", "CDS")
    {}

    function mint(address to, uint64 resourceId)
        external
        saleIsOpen
        onlyFactory
        returns (uint256)
    {
        uint256 tokenId = _totalSupply + 1;
        unchecked {
            _totalSupply += 1;
            _totalSupplyPerResource[resourceId] += 1;
        }
        _mint(to, tokenId);
        _addResourceToToken(tokenId, resourceId, uint64(0));
        _acceptResource(tokenId, 0);
        return tokenId;
    }

    function totalSupply(uint64 resourceId) public view returns (uint256) {
        return _totalSupplyPerResource[resourceId];
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external onlyOwnerOrContributor {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function addResourceToTokens(
        uint256[] calldata tokenIds,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        uint256 length = tokenIds.length;
        for (uint256 i; i < length; ) {
            _addResourceToToken(tokenIds[i], resourceId, overwrites);
            unchecked {
                ++i;
            }
        }
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 slotPartId
    ) external onlyOwner {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            slotPartId
        );
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
        onlyOwner
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function updateFactory(address factory) external onlyOwner {
        _factory = factory;
    }

    function getFactory() external view returns (address) {
        return _factory;
    }

    function _onlyFactory() private view {
        if (_factory != _msgSender()) revert OnlyFactoryCanMint();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return getResourceMetaForToken(tokenId, 0);
    }

    function acceptChildrenFromFactory(uint256 tokenId) external onlyFactory {
        _acceptChild(tokenId, 4);
        _acceptChild(tokenId, 3);
        _acceptChild(tokenId, 2);
        _acceptChild(tokenId, 1);
        _acceptChild(tokenId, 0);
    }

    function equipFromFactory(
        uint256 tokenId,
        uint64 sheetResId,
        uint64 bodyResId,
        uint64 headResId,
        uint64 legsResId,
        uint64 leftArmResId,
        uint64 rightArmResId
    ) external onlyFactory {
        // Proposed and accepted order:
        // * body
        // * head
        // * legs
        // * rightArm
        // * leftArm

        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 0,
                resourceId: sheetResId,
                slotPartId: _BODY_PART_ID,
                childResourceId: bodyResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 1,
                resourceId: sheetResId,
                slotPartId: _HEAD_PART_ID,
                childResourceId: headResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 2,
                resourceId: sheetResId,
                slotPartId: _LEGS_PART_ID,
                childResourceId: legsResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 3,
                resourceId: sheetResId,
                slotPartId: _RIGHT_ARM_PART_ID,
                childResourceId: rightArmResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 4,
                resourceId: sheetResId,
                slotPartId: _LEFT_ARM_PART_ID,
                childResourceId: leftArmResId
            })
        );
    }
}
