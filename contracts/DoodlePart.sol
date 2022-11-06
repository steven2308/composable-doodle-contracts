// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/access/OwnableLock.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "./IDoodlePart.sol";

error OnlyFactoryCanMint();
error PartOutOfStock();

contract DoodlePart is
    IDoodlePart,
    OwnableLock,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    struct ResourceConfig {
        uint64 resourceId;
        uint64 fullToEquip;
        uint64 maxSupply;
        uint256 pricePerResource;
    }

    uint256 private constant _MAX_SUPPLY = 1000;
    uint256 private _totalSupply;

    mapping(uint64 => uint256) private _totalSupplyPerResource;
    mapping(uint64 => uint256) private _maxSupplyPerResource;
    mapping(uint64 => uint64) private _fullToEquipResource;
    mapping(uint64 => uint256) private _pricePerResource;
    address private _factory;

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    modifier saleIsOpen() {
        if (_totalSupply >= _MAX_SUPPLY) revert RMRKMintOverMax();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata_,
        address royaltyRecipient
    )
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

    function configureResourceEntries(ResourceConfig[] memory resourceConfigs)
        external
        onlyOwner
    {
        uint256 length = resourceConfigs.length;
        for (uint256 i; i < length; ) {
            _pricePerResource[resourceConfigs[i].resourceId] = resourceConfigs[
                i
            ].pricePerResource;
            _maxSupplyPerResource[
                resourceConfigs[i].resourceId
            ] = resourceConfigs[i].maxSupply;
            _fullToEquipResource[
                resourceConfigs[i].resourceId
            ] = resourceConfigs[i].fullToEquip;
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

    function totalSupply(uint64 resourceId) public view returns (uint256) {
        return _totalSupplyPerResource[resourceId];
    }

    function maxSupply(uint64 resourceId) public view returns (uint256) {
        return _maxSupplyPerResource[resourceId];
    }

    function pricePerResource(uint64 resourceId) public view returns (uint256) {
        return _pricePerResource[resourceId];
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

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public pure returns (uint256) {
        return _MAX_SUPPLY;
    }
}
