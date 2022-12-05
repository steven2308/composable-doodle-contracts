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
    mapping(uint64 => uint256) private _totalSupplyPerAsset;

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    constructor(
        string memory collectionMetadata_,
        address royaltyRecipient
    )
        RMRKMintingUtils(1000, 0)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, 500) // 500 -> 5%
        RMRKEquippable("Composable Doodle Sheet", "CDS")
    {}

    function mint(
        address to,
        uint64 assetId
    ) external saleIsOpen onlyFactory returns (uint256) {
        uint256 tokenId = _totalSupply + 1;
        unchecked {
            _totalSupply += 1;
            _totalSupplyPerAsset[assetId] += 1;
        }
        _mint(to, tokenId, "");
        _addAssetToToken(tokenId, assetId, uint64(0));
        _acceptAsset(tokenId, 0, assetId);
        return tokenId;
    }

    function totalSupply(uint64 assetId) public view returns (uint256) {
        return _totalSupplyPerAsset[assetId];
    }

    function addAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] calldata partIds
    ) external onlyOwnerOrContributor {
        _addAssetEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            partIds
        );
    }

    function addAssetToTokens(
        uint256[] calldata tokenIds,
        uint64 assetId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        uint256 length = tokenIds.length;
        for (uint256 i; i < length; ) {
            _addAssetToToken(tokenIds[i], assetId, overwrites);
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

    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) external override onlyOwner {
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

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);
        uint64 mainAsset = _activeAssets[tokenId][0];
        return getAssetMetadata(tokenId, mainAsset);
    }

    function acceptChildrenFromFactory(
        uint256 tokenId,
        address body,
        address head,
        address legs,
        address rightArm,
        address leftArm
    ) external onlyFactory {
        // tokenId is the same across all part since they are always minted together
        _acceptChild(tokenId, 4, body, tokenId);
        _acceptChild(tokenId, 3, head, tokenId);
        _acceptChild(tokenId, 2, legs, tokenId);
        _acceptChild(tokenId, 1, rightArm, tokenId);
        _acceptChild(tokenId, 0, leftArm, tokenId);
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
                assetId: sheetResId,
                slotPartId: _BODY_PART_ID,
                childAssetId: bodyResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 1,
                assetId: sheetResId,
                slotPartId: _HEAD_PART_ID,
                childAssetId: headResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 2,
                assetId: sheetResId,
                slotPartId: _LEGS_PART_ID,
                childAssetId: legsResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 3,
                assetId: sheetResId,
                slotPartId: _RIGHT_ARM_PART_ID,
                childAssetId: rightArmResId
            })
        );
        _equip(
            IntakeEquip({
                tokenId: tokenId,
                childIndex: 4,
                assetId: sheetResId,
                slotPartId: _LEFT_ARM_PART_ID,
                childAssetId: leftArmResId
            })
        );
    }
}
