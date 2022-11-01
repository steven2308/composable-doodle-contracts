// SPDX-License-Identifier: GNU GPLv3

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/access/OwnableLock.sol";
import "./IDoodlePart.sol";
import "./IDoodleSheet.sol";

error MintUnderpriced();
error NothingToWithdraw();
error OnlyParterCanUpdateItsAddres();
error OnlyParternsCanWithdraw();
error SalesNotOpen();

contract RobotFactory is OwnableLock {
    address private _sheet;
    address private _body;
    address private _head;
    address private _legs;
    address private _leftArm;
    address private _rightArm;
    uint256 private _salesOpen;

    address private _partner1;
    address private _partner2;
    uint256 private _partner1Balance;
    uint256 private _partner2Balance;
    uint256 private constant _PARTNER_1_PART = 7000;
    uint256 private constant _BASE_POINTS = 10000;

    event BotBuilt(
        address indexed to,
        uint256 indexed sheetId,
        uint64 sheetResourceId,
        uint64 bodyResourceId,
        uint64 headResourceId,
        uint64 legsResourceId,
        uint64 leftArmResourceId,
        uint64 rightArResourcemId
    );

    constructor(
        address sheet_,
        address body_,
        address head_,
        address legs_,
        address leftArm_,
        address rightArm_,
        address partner1_,
        address partern2_
    ) {
        _sheet = sheet_;
        _body = body_;
        _head = head_;
        _legs = legs_;
        _leftArm = leftArm_;
        _rightArm = rightArm_;

        _partner1 = partner1_;
        _partner2 = partern2_;
    }

    function mint(
        address to,
        uint64 sheetResId,
        uint64 bodyResId,
        uint64 headResId,
        uint64 legsResId,
        uint64 leftArmResId,
        uint64 rightArmResId
    ) external payable notLocked {
        if (_salesOpen == 0) revert SalesNotOpen();
        uint256 sheetId = IDoodleSheet(_sheet).mint(to, sheetResId);

        uint256 totalPrice = IDoodlePart(_leftArm).pricePerMint(leftArmResId) +
            IDoodlePart(_rightArm).pricePerMint(rightArmResId) +
            IDoodlePart(_legs).pricePerMint(legsResId) +
            IDoodlePart(_head).pricePerMint(headResId) +
            IDoodlePart(_body).pricePerMint(bodyResId);
        if (totalPrice != msg.value) revert MintUnderpriced();
        _distributeValue();

        IDoodlePart(_leftArm).nestMint(_sheet, sheetId, leftArmResId);
        IDoodlePart(_rightArm).nestMint(_sheet, sheetId, rightArmResId);
        IDoodlePart(_legs).nestMint(_sheet, sheetId, legsResId);
        IDoodlePart(_head).nestMint(_sheet, sheetId, headResId);
        IDoodlePart(_body).nestMint(_sheet, sheetId, bodyResId);

        IDoodleSheet(_sheet).acceptChildrenFromFactory(sheetId);
        _equipAll(
            sheetId,
            sheetResId,
            bodyResId,
            headResId,
            legsResId,
            leftArmResId,
            rightArmResId
        );
        emit BotBuilt(
            to,
            sheetId,
            sheetResId,
            bodyResId,
            headResId,
            legsResId,
            leftArmResId,
            rightArmResId
        );
    }

    function _distributeValue() private {
        uint256 partner1Part = (msg.value * _PARTNER_1_PART) / _BASE_POINTS;
        uint256 partner2Part = msg.value - partner1Part;
        _partner1Balance += partner1Part;
        _partner2Balance += partner2Part;
    }

    function _equipAll(
        uint256 sheetId,
        uint64 sheetResId,
        uint64 bodyResId,
        uint64 headResId,
        uint64 legsResId,
        uint64 leftArmResId,
        uint64 rightArmResId
    ) private {
        IDoodleSheet(_sheet).equipFromFactory(
            sheetId,
            sheetResId,
            IDoodlePart(_body).fullToEquip(bodyResId),
            IDoodlePart(_head).fullToEquip(headResId),
            IDoodlePart(_legs).fullToEquip(legsResId),
            IDoodlePart(_leftArm).fullToEquip(leftArmResId),
            IDoodlePart(_rightArm).fullToEquip(rightArmResId)
        );
    }

    function sheetAddress() external view returns (address) {
        return _sheet;
    }

    function bodyAddress() external view returns (address) {
        return _body;
    }

    function headAddress() external view returns (address) {
        return _head;
    }

    function legsAddress() external view returns (address) {
        return _legs;
    }

    function leftArmAddress() external view returns (address) {
        return _leftArm;
    }

    function rightArmAddress() external view returns (address) {
        return _rightArm;
    }

    function partner1Balance() external view returns (uint256) {
        return _partner1Balance;
    }

    function partner2Balance() external view returns (uint256) {
        return _partner2Balance;
    }

    function updatePartner1(address newAddress) external {
        if (_partner1 != address(0) && msg.sender != _partner1)
            revert OnlyParterCanUpdateItsAddres();
        _partner1 = newAddress;
    }

    function updatePartner2(address newAddress) external {
        if (_partner2 != address(0) && msg.sender != _partner2)
            revert OnlyParterCanUpdateItsAddres();
        _partner2 = newAddress;
    }

    function setSalesOpen(bool open) external {
        _salesOpen = open ? 1 : 0;
    }

    function withdrawRaised() external {
        if (msg.sender == _partner1) {
            uint256 amount = _partner1Balance;
            _partner1Balance = 0;
            _withdraw(_partner1, amount);
        } else if (msg.sender == _partner2) {
            uint256 amount = _partner2Balance;
            _partner2Balance = 0;
            _withdraw(_partner2, amount);
        } else {
            revert OnlyParternsCanWithdraw();
        }
    }

    function _withdraw(address to, uint256 amount) private {
        if (amount == 0) revert NothingToWithdraw();

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed.");
    }
}
