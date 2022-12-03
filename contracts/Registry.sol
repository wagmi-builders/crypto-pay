pragma solidity 0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {
    mapping(uint256 => uint256) phone_to_aadhar;
    mapping(uint256 => address) aadhar_to_account;
    mapping(uint256 => address) phone_to_account;
    mapping(address => uint256) account_to_aadhar;

    function registerUser(
        uint256 _aadharNumberHash, 
        uint256 _phoneNumberHash,
        address _userAddress
    ) external onlyOwner {
        phone_to_aadhar[_phoneNumberHash] = _aadharNumberHash;
        aadhar_to_account[_aadharNumberHash] = _userAddress;
        phone_to_account[_phoneNumberHash] = _userAddress;
        account_to_aadhar[_userAddress] = _aadharNumberHash;
    } 
}

