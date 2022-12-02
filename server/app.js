const express = require('express');
const {auth, resolver, loaders} = require('@iden3/js-iden3-auth')
const { ethers } = require("ethers");
const getRawBody = require('raw-body')

const app = express();
const port = 8080;

app.get("/api/sign-in", (req, res) => {
    console.log('get Auth Request');
    GetAuthRequest(req,res);
});

app.post("/api/callback", (req, res) => {
    console.log('callback');
    Callback(req,res);
});

app.listen(port, () => {
    console.log('server running on port 8080');
});

// const provider = // initialize a provider
const L1_PRIVATE_KEY = ""
const customSigner = new ethers.Wallet(L1_PRIVATE_KEY, provider);
const paymentContractAddress = "";
const paymentContractABI = [
    "function submitTransferZKPResponse(uint64 requestId, uint256[] memory inputs, uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, IERC20 token, uint256 recipientPhoneNumber, uint256 amount)"
];
const paymentContract = new ethers.Contract(paymentContractAddress, paymentContractABI, provider);


// Create a map to store the auth requests and their session IDs
const requestMap = new Map();


// GetAuthRequest returns auth request
async function GetAuthRequest(req,res) {

   
    // Audience is verifier id
    const hostUrl = `http://localhost:${port}/`; 
    const sessionId = 1;
    const callbackURL = "/api/callback"
    const audience = "1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ"

    const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

    // Generate request for basic auth
    // const request = auth.createAuthorizationRequestWithMessage(
    //     'Transfer funds',       // reason
    //     'message to sign',      // Message to sign
    //     audience,               // sender
    //     uri,                    // callback URL
    // );

    const request = auth.createAuthorizationRequest(
        'Transfer funds',       // reason
        audience,               // sender
        uri                     // callback URL
    )

    request.id = '7f38a193-0918-4a48-9fac-36adfdb8b542';        // schema ID
    request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';      // required

    // Add query-based request
    const proofRequest = {
        id: 1,
        circuit_id: 'credentialAtomicQuerySig',
        rules: {
            query: {
            allowedIssuers: ['*'],
            schema: {
                type: 'AadharCredential',
                url: '',        // Schema URL
            },
            req: {
                is_verified: {
                    $eq: true, // is verified should be true
                },
            },
            },
        },
    };

    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, proofRequest];

    // Store zk request in map associated with session ID
    requestMap.set(`${sessionId}`, request);

    return res.status(200).set(
        'Content-Type', 
        'application/json'
    ).send(request);

}


// Callback verifies the proof after sign-in callbacks
async function Callback(req,res) {

    // Unpack the proof
    // 1. Get session ID from request
    const sessionId = req.query.sessionId;

    console.log("Request returned in callback", req);

    // 2. extract proof from the request
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    // fetch authRequest from sessionID
    const authRequest = requestMap.get(`${sessionId}`);

    // receipient, token, amount = authRequest.xxx

    // Send the transaction.
    // calldata = proof + recipient + token + amount

    // await paymentContract.methods.submitTransferZKPResponse(
        // ... 
    // )

}

