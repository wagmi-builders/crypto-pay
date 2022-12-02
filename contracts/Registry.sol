pragma solidity 0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {

    mapping(uint256 => uint256) aadhar_to_phone;
    mapping(uint256 => address) phone_to_account;

    function registerUser(
        uint256 _aadharNumberHash, 
        uint256 _phoneNumberHash,
        address _userAddress
    ) external onlyOwner {
        aadhar_to_phone[_aadharNumberHash] = _phoneNumberHash;
        phone_to_account[_phoneNumberHash] = _userAddress;
    } 
}

