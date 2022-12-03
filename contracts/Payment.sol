pragma solidity 0.8.17;

import "./lib/GenesisUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICircuitValidator.sol";
import "./verifiers/ZKPVerifier.sol";
import "./Registry.sol";

contract PaymentGateway is ZKPVerifier, Registry {

    uint64 public constant TRANSFER_REQUEST_ID = 1;
    
    struct PaymentRecord {
        IERC20 token;
        uint256 recipientPhoneNumber;
        uint256 amount;
        bool valid;
    }


    mapping(address => PaymentRecord[]) queuedPayments;

    function queuePayment(        
        IERC20 _token,
        uint256 _recipientPhoneNumber,
        uint256 _amount
    ) external {
        queuedPayments[msg.sender].push(
            PaymentRecord(
                _token,
                _recipientPhoneNumber,
                _amount,
                true
            )
        );
    }

    function removePaymentFromQueue(
        uint256 index
    ) external {
        require(
            queuedPayments[msg.sender][index].recipientPhoneNumber != 0, 
            "Invalid index"
        );
        queuedPayments[msg.sender][index].valid = false;
    }


    function _beforeProofSubmit(
        uint64, /* requestId */
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override view  {
        // check that challenge input of the proof is equal to the msg.sender
        address addr = GenesisUtils.int256ToAddress(
            inputs[validator.getChallengeInputIndex()]
        );
        require(
            _msgSender() == addr,
            "address in proof is not a sender address"
        );
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory, /* inputs */
        ICircuitValidator /* validator */
    ) internal override {
        require(
            requestId == TRANSFER_REQUEST_ID,
            "!requestId"
        );
        
        // We execute the oldest valid payment record
        // Follows FIFO (First in First out) order.
        PaymentRecord[] memory payments = queuedPayments[msg.sender];

        for(uint256 i = 0; i < payments.length; i++) {
            if (payments[i].valid) {
                PaymentRecord memory currPayment = payments[i];
                       
                address recipientAddress = phone_to_account[currPayment.recipientPhoneNumber];

                // execute the transfer
                // Ensure the caller has approved sufficient tokens.
                IERC20(currPayment.token).transferFrom(_msgSender(), recipientAddress, currPayment.amount);

                // Set valid = false in the storage array
                queuedPayments[msg.sender][i].valid = false;
            }
        } 
    }
}
