const express = require("express");
const { auth, resolver, loaders } = require("@iden3/js-iden3-auth");
const { ethers } = require("ethers");
const getRawBody = require("raw-body");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.post("/api/sign-in", (req, res) => {
  console.log("get Auth Request");
  GetAuthRequest(req, res);
});

app.post("/api/callback", (req, res) => {
  console.log("callback");
  Callback(req, res);
});

app.listen(port, () => {
  console.log("server running on port 8080");
});

const provider = ethers.providers.getDefaultProvider(); // initialize a provider

const L1_PRIVATE_KEY =
  "551ba244f16bd77dc1124725f5574823c8ca907a8a92f47039d1f0f574395fc7";

const customSigner = new ethers.Wallet(L1_PRIVATE_KEY, provider);

const paymentContractAddress = "";
const paymentContractABI = [
  "function submitTransferZKPResponse(uint64 requestId, uint256[] memory inputs, uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, IERC20 token, uint256 recipientPhoneNumber, uint256 amount)",
];
const paymentContract = new ethers.Contract(
  paymentContractAddress,
  paymentContractABI,
  provider
);

// Create a map to store the auth requests and their session IDs
const requestMap = new Map();

// GetAuthRequest returns auth request
async function GetAuthRequest(req, res) {
  console.log("req body: ", req.body);

  const SCHEMA_ID = "642881e4-b68c-4721-81a6-98ac3b335869";
  const SCHEMA_URL =
    "https://s3.eu-west-1.amazonaws.com/polygonid-schemas/642881e4-b68c-4721-81a6-98ac3b335869.json-ld";

  // Audience is verifier id
  const hostUrl = `http://192.168.43.21:${port}`;
  const sessionId = 1;
  const callbackURL = "api/callback";
  const audience = "119spRD8gfCvBLesGUKK8yf7wWvr7GUh39vAQSEFC6";

  const uri = `${hostUrl}/${callbackURL}?sessionId=${sessionId}`;

  // Generate request for basic auth
  // const request = auth.createAuthorizationRequestWithMessage(
  //     'Transfer funds',       // reason
  //     'message to sign',      // Message to sign
  //     audience,               // sender
  //     uri,                    // callback URL
  // );

  const request = auth.createAuthorizationRequest(
    "Transfer funds", // reason
    audience, // sender
    uri // callback URL
  );

  request.id = "c811849d-6bfb-4d85-935e-3d9759c7f105"; // schema ID
  //   request.thid = SCHEMA_ID; // required

  // Add query-based request
  const proofRequest = {
    id: 1,
    circuit_id: "credentialAtomicQuerySig",
    rules: {
      query: {
        allowedIssuers: ["*"],
        schema: {
          type: "dAadhaar", // TODO: IDK?
          url: SCHEMA_URL, // Schema URL
        },
        req: {
          verified: {
            $eq: 1, // is verified should be true
          },
        },
      },
    },
  };

  const scope = request.body.scope ?? [];
  request.body.scope = [...scope, proofRequest];

  request.body.data = req.body;

  // Store zk request in map associated with session ID
  requestMap.set(`${sessionId}`, request);

  return res.status(200).set("Content-Type", "application/json").send(request);
}

// Callback verifies the proof after sign-in callbacks
async function Callback(req, res) {
  console.log("request body: ");
  console.log(req);

  //   console.log(req.body, req.query);

  // Unpack the proof
  // 1. Get session ID from request
  const sessionId = req.query.sessionId;

  console.log("Request returned in callback");

  // 2. extract proof from the request
  const raw = await getRawBody(req);
  const tokenStr = raw.toString().trim();

  console.log("tokenStr:", tokenStr);

  // fetch authRequest from sessionID
  const authRequest = requestMap.get(`${sessionId}`);

  const {
    recepientMobileNumber,
    amount,
    token: tokenAddress,
  } = authRequest.body.data;
  console.log("authRequest.body", authRequest.body);

  // receipient, token, amount = authRequest.xxx

  // Send the transaction.
  // calldata = proof + recipient + token + amount

  //   const done = await paymentContract.methods.submitTransferZKPResponse(
  //     sessionId,
  //     inputs,
  //     a,
  //     b,
  //     c,
  //     tokenAddress,
  //     Number(recepientMobileNumber),
  //     Number(amount)
  //   );

  //   console.log("done: ", done);

  // Locate the directory that contains circuit's verification keys
  const verificationKeyloader = new loaders.FSKeyLoader("../keys");
  const sLoader = new loaders.UniversalSchemaLoader("ipfs.io");

  // Add Polygon Mumbai RPC node endpoint - needed to read on-chain state and identity state contract address
  const ethStateResolver = new resolver.EthStateResolver(
    "https://rpc-mumbai.maticvigil.com",
    "0x46Fd04eEa588a3EA7e9F055dd691C688c4148ab3"
  );

  // EXECUTE VERIFICATION
  const verifier = new auth.Verifier(
    verificationKeyloader,
    sLoader,
    ethStateResolver
  );

  try {
    authResponse = await verifier.fullVerify(tokenStr, authRequest);
    console.log("VERIFIED");
  } catch (error) {
    console.log("NOT VERIFIED");
    return res.status(500).send(error);
  }

  return res
    .status(200)
    .set("Content-Type", "application/json")
    .send("user with ID: " + authResponse.from + " Succesfully authenticated");

  //   return res.status(200).set("Content-Type", "application/json").send({
  // message: "done",
  // data: true,
  //   });
}
