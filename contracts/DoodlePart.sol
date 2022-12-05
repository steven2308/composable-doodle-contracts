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
    struct AssetConfig {
        uint64 assetId;
        uint64 fullToEquip;
        uint64 maxSupply;
        uint256 pricePerAsset;
    }

    uint256 private constant _MAX_SUPPLY = 1000;
    uint256 private _totalSupply;

    mapping(uint64 => uint256) private _totalSupplyPerAsset;
    mapping(uint64 => uint256) private _maxSupplyPerAsset;
    mapping(uint64 => uint64) private _fullToEquipAsset;
    mapping(uint64 => uint256) private _pricePerAsset;
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
        uint64 assetId
    ) external saleIsOpen onlyFactory returns (uint256) {
        uint256 tokenId = _totalSupply + 1;
        uint64 equipAssetId = _fullToEquipAsset[assetId];

        if (
            _totalSupplyPerAsset[assetId] ==
            _maxSupplyPerAsset[assetId]
        ) revert PartOutOfStock();

        unchecked {
            _totalSupplyPerAsset[assetId] += 1;
            _totalSupply += 1;
        }
        _nestMint(parent, tokenId, destinationId, "");
        _addAssetToToken(tokenId, equipAssetId, uint64(0));
        _addAssetToToken(tokenId, assetId, uint64(0));
        _acceptAsset(tokenId, 1, assetId);
        _acceptAsset(tokenId, 0, equipAssetId);
        return tokenId;
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

    function configureAssetEntries(
        AssetConfig[] memory assetConfigs
    ) external onlyOwner {
        uint256 length = assetConfigs.length;
        for (uint256 i; i < length; ) {
            _pricePerAsset[assetConfigs[i].assetId] = assetConfigs[
                i
            ].pricePerAsset;
            _maxSupplyPerAsset[
                assetConfigs[i].assetId
            ] = assetConfigs[i].maxSupply;
            _fullToEquipAsset[
                assetConfigs[i].assetId
            ] = assetConfigs[i].fullToEquip;
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

    function totalSupply(uint64 assetId) public view returns (uint256) {
        return _totalSupplyPerAsset[assetId];
    }

    function maxSupply(uint64 assetId) public view returns (uint256) {
        return _maxSupplyPerAsset[assetId];
    }

    function pricePerAsset(uint64 assetId) public view returns (uint256) {
        return _pricePerAsset[assetId];
    }

    function fullToEquip(uint64 assetId) public view returns (uint64) {
        return _fullToEquipAsset[assetId];
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

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public pure returns (uint256) {
        return _MAX_SUPPLY;
    }
}
