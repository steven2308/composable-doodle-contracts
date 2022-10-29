// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKMintingUtils.sol";
import "./IPart.sol";

error OnlyFactoryCanMint();
error PartOutOfStock();

contract Part is
    IPart,
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    mapping(uint64 => uint256) private _pricePerMintPerResource;
    mapping(uint64 => uint256) private _totalSupplyPerResource;
    mapping(uint64 => uint256) private _maxSupplyPerResource;
    mapping(uint64 => uint64) private _fullToEquipResource;
    address private _factory;

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata_,
        uint256 pricePerMint_,
        address royaltyRecipient
    )
        RMRKMintingUtils(1000, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, 500) // 500 -> 5%
        RMRKEquippable(name, symbol)
    {}

    function nestMint(
        address parent,
        uint256 destinationId,
        uint64 resourceId
    ) external saleIsOpen onlyFactory returns (uint256) {
        uint256 tokenId = _totalSupply + 1;
        uint64 equipResourceId = _fullToEquipResource[resourceId];

        if (
            _totalSupplyPerResource[resourceId] ==
            _maxSupplyPerResource[resourceId]
        ) revert PartOutOfStock();

        unchecked {
            _totalSupplyPerResource[resourceId] += 1;
            _totalSupply += 1;
        }
        _nestMint(parent, tokenId, destinationId);
        _addResourceToToken(tokenId, equipResourceId, uint64(0));
        _addResourceToToken(tokenId, resourceId, uint64(0));
        _acceptResource(tokenId, 1);
        _acceptResource(tokenId, 0);
        return tokenId;
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

    function configureResourceEntry(
        uint64 resourceId,
        uint64 fullToEquip,
        uint256 pricePerMint_,
        uint256 totalSupply_,
        uint256 maxSupply_
    ) external onlyOwner {
        _pricePerMintPerResource[resourceId] = pricePerMint_;
        _totalSupplyPerResource[resourceId] = totalSupply_;
        _maxSupplyPerResource[resourceId] = maxSupply_;
        _fullToEquipResource[resourceId] = fullToEquip;
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

    function totalSupply(uint64 resourceId) public view returns (uint256) {
        return _totalSupplyPerResource[resourceId];
    }

    function maxSupply(uint64 resourceId) public view returns (uint256) {
        return _maxSupplyPerResource[resourceId];
    }

    function pricePerMint(uint64 resourceId) public view returns (uint256) {
        return _pricePerMintPerResource[resourceId];
    }

    function fullToEquip(uint64 resourceId) public view returns (uint64) {
        return _fullToEquipResource[resourceId];
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
}
