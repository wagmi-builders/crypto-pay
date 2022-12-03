pragma solidity 0.8.17;

import "./lib/GenesisUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICircuitValidator.sol";
import "./verifiers/ZKPVerifier.sol";
import "./Registry.sol";

contract Payment is ZKPVerifier, Registry {

   
    // Functions
    /**
     * @dev submitZKPResponse
     */
    function submitZKPResponse(
        uint64 requestId,
        uint256[] memory inputs,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        bytes memory userInputs     // Added extra parameter
    ) public returns (bool) {
        require(
            requestValidators[requestId] != ICircuitValidator(address(0)),
            "validator is not set for this request id"
        ); // validator exists
        require(
            requestQueries[requestId].schema != 0,
            "query is not set for this request id"
        ); // query exists

        _beforeProofSubmit(requestId, inputs, requestValidators[requestId], userInputs);

        require(
            requestValidators[requestId].verify(
                inputs,
                a,
                b,
                c,
                requestQueries[requestId]
            ),
            "proof response is not valid"
        );

        proofs[msg.sender][requestId] = true; // user provided a valid proof for request

        _afterProofSubmit(requestId, inputs, requestValidators[requestId], userInputs);
        return true;
    }

    // IMPLEMENTATION
    uint64 public constant TRANSFER_REQUEST_ID = 1;

    function submitTransferZKPResponse(
        uint64 requestId,
        uint256[] memory inputs,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        IERC20 token,
        uint256 recipientPhoneNumber,
        uint256 amount
    ) external returns (bool) {
        bytes memory userInputs = abi.encode(token, recipientPhoneNumber, amount);
        return submitZKPResponse(requestId, inputs, a, b, c, userInputs);
    }

    function _beforeProofSubmit(
        uint64, /* requestId */
        uint256[] memory inputs,
        ICircuitValidator validator,
        bytes memory /* userInputs */
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
        uint256[] memory /* inputs */,
        ICircuitValidator /* validator */,
        bytes memory userInputs
    ) internal override {
        require(
            requestId == TRANSFER_REQUEST_ID,
            "!requestId"
        );
        
        (address token, uint256 recipientPhoneNumber, uint256 amount) = abi.decode(
            userInputs, 
            (address, uint256, uint256)
        );
        
        address recipientAddress = phone_to_account[recipientPhoneNumber];

        // execute the transfer
        // Ensure the caller has approved sufficient tokens.
        IERC20(token).transferFrom(_msgSender(), recipientAddress, amount);
    }

}


// Register
// Inputs
// Claims
// Claims will be scanned by the user
// Stored in their polygon wallet
// User wants to send a transaction with X calldata + a ZK proof
// We ask the user to submit a proof as auth
// We create the challenge and show it as a QR code
// The user scans the QR code
// Polygon wallet Id generates the required proof
// Polygon wallet sends the transaction 