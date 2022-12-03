import { ethers } from 'hardhat';

const main = async () => {
    // Main scope circuit identifier supported 
    // - avoid changing as it's currently the only one supported
    const circuitId = "credentialAtomicQuerySig";

    // Main validator address on mumbai - https://mumbai.polygonscan.com/address/0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB#code
    // - do not change for testnet
    const validatorAddress = "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB";

    // CHANGE THESE
    // Contract name when deployed
    const paymentGatewayContract = "PaymentGateway";
    // Schema has provided by the issuer
    // - typically found in https://platform-test.polygonid.com/claiming/created-schemas
    const schemaHash = "0fab546bd9865813144e6bebcca107ed"; // extracted from PID Platform

    // Deployed contract address
    const paymentGatewayAddress = "0x05782c1DB45A3cE232cC82D7726fcb30FB45Dd55";
    const schemaEnd = fromLittleEndian(hexToBytes(schemaHash));
    const query = {
        schema: ethers.BigNumber.from(schemaEnd),
        // slotIndex3 indicates the value stored as Attribute 2 inside the claim
        slotIndex: 3,
        // see - https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/
        // 1 = equals
        // 2 = less-than
        // 3 = greater-than
        // 4 = in
        // 5 = not-in
        operator: 1,
        value: [1, ...new Array(63).fill(0).map(i => 0)], // the value must be 1 = true
        circuitId,
    };

    // Retrieve contract to interact with it
    const paymentGateway = await ethers.getContractAt(paymentGatewayContract, paymentGatewayAddress);

    // Set zkpRequest for contract
    try {
        // Use as a means to keep track in the contract for number of mints a person can perform from a specific wallet address
        const requestId = Number(await paymentGateway.TRANSFER_REQUEST_ID());
        const tx = await paymentGateway.setZKPRequest(
            requestId, // 1
            validatorAddress,
            query
        );

        tx.wait();
        console.log(`Request set at:\nNOTE: May take a little bit to show up\nhttps://mumbai.polygonscan.com/tx/${tx.hash}`);
    } catch (e) {
        console.error("Error: ", e);
    }
};

// Helper Functions
// ========================================================
/**
 * 
 * @param hex 
 * @returns array of bytes
 */
const hexToBytes = (hex: string) => {
    for (var bytes = [], c = 0; c < hex.length; c += 2) {
        /**
         * @dev parseInt 16 = parsed as a hexadecimal number
         */
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
};

/**
 * @dev Little-Endian: https://learnmeabitcoin.com/technical/little-endian
 * "Little-endian" refers to the order in which bytes of information can be processed by a computer.
 * @param bytes array of numbers for bytes 
 * @returns number
 */
const fromLittleEndian = (bytes: number[]) => {
    const n256 = BigInt(256);
    let result = BigInt(0);
    let base = BigInt(1);
    bytes.forEach((byte) => {
        result += base * BigInt(byte);
        base = base * n256;
    });
    return result;
};

// Init
// ========================================================
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
