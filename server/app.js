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
  //   console.log("request body: ");
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

  const done = await paymentContract.methods.submitTransferZKPResponse(
    sessionId,
    inputs,
    a,
    b,
    c,
    tokenAddress,
    Number(recepientMobileNumber),
    Number(amount)
  );

  console.log("done: ", done);

  return res.status(200).set("Content-Type", "application/json").send({
    message: "done",
    data: done,
  });
}

// NOTE: Failed to generate proof here.

// Request returned in callback <ref *2> IncomingMessage {
//   _readableState: ReadableState {
//     objectMode: false,
//     highWaterMark: 16384,
//     buffer: BufferList { head: null, tail: null, length: 0 },
//     length: 0,
//     pipes: [],
//     flowing: null,
//     ended: false,
//     endEmitted: false,
//     reading: false,
//     constructed: true,
//     sync: true,
//     needReadable: false,
//     emittedReadable: false,
//     readableListening: false,
//     resumeScheduled: false,
//     errorEmitted: false,
//     emitClose: true,
//     autoDestroy: true,
//     destroyed: false,
//     errored: null,
//     closed: false,
//     closeEmitted: false,
//     defaultEncoding: 'utf8',
//     awaitDrainWriters: null,
//     multiAwaitDrain: false,
//     readingMore: true,
//     dataEmitted: false,
//     decoder: null,
//     encoding: null,
//     [Symbol(kPaused)]: null
//   },
//   _events: [Object: null prototype] {},
//   _eventsCount: 0,
//   _maxListeners: undefined,
//   socket: <ref *1> Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _closeAfterHandlingError: false,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: [],
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: true,
//       constructed: true,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: true,
//       destroyed: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       defaultEncoding: 'utf8',
//       awaitDrainWriters: null,
//       multiAwaitDrain: false,
//       readingMore: false,
//       dataEmitted: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     _events: [Object: null prototype] {
//       end: [Array],
//       timeout: [Function: socketOnTimeout],
//       data: [Function: bound socketOnData],
//       error: [Function: socketOnError],
//       close: [Array],
//       drain: [Function: bound socketOnDrain],
//       resume: [Function: onSocketResume],
//       pause: [Function: onSocketPause]
//     },
//     _eventsCount: 8,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       buffered: [],
//       bufferedIndex: 0,
//       allBuffers: true,
//       allNoop: true,
//       pendingcb: 0,
//       constructed: true,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: true,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       [Symbol(kOnFinished)]: []
//     },
//     allowHalfOpen: true,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       requestTimeout: 300000,
//       headersTimeout: 60000,
//       keepAliveTimeout: 5000,
//       connectionsCheckingInterval: 30000,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: true,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       _connectionKey: '6::::8080',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 1157,
//       [Symbol(http.server.connections)]: ConnectionsList {},
//       [Symbol(http.server.connectionsCheckingInterval)]: Timeout {
//         _idleTimeout: 30000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 31638,
//         _onTimeout: [Function: bound checkConnections],
//         _timerArgs: undefined,
//         _repeat: 30000,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 1156,
//         [Symbol(triggerId)]: 1
//       },
//       [Symbol(kUniqueHeaders)]: null
//     },
//     _server: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       requestTimeout: 300000,
//       headersTimeout: 60000,
//       keepAliveTimeout: 5000,
//       connectionsCheckingInterval: 30000,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: true,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       _connectionKey: '6::::8080',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 1157,
//       [Symbol(http.server.connections)]: ConnectionsList {},
//       [Symbol(http.server.connectionsCheckingInterval)]: Timeout {
//         _idleTimeout: 30000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 31638,
//         _onTimeout: [Function: bound checkConnections],
//         _timerArgs: undefined,
//         _repeat: 30000,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 1156,
//         [Symbol(triggerId)]: 1
//       },
//       [Symbol(kUniqueHeaders)]: null
//     },
//     parser: HTTPParser {
//       '0': null,
//       '1': [Function: parserOnHeaders],
//       '2': [Function: parserOnHeadersComplete],
//       '3': [Function: parserOnBody],
//       '4': [Function: parserOnMessageComplete],
//       '5': [Function: bound onParserExecute],
//       '6': [Function: bound onParserTimeout],
//       _headers: [],
//       _url: '',
//       socket: [Circular *1],
//       incoming: [Circular *2],
//       outgoing: null,
//       maxHeaderPairs: 2000,
//       _consumed: true,
//       onIncoming: [Function: bound parserOnIncoming],
//       [Symbol(resource_symbol)]: [HTTPServerAsyncResource]
//     },
//     on: [Function: socketListenerWrap],
//     addListener: [Function: socketListenerWrap],
//     prependListener: [Function: socketListenerWrap],
//     setEncoding: [Function: socketSetEncoding],
//     _paused: false,
//     _httpMessage: ServerResponse {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       destroyed: false,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       maxRequestsOnConnectionReached: false,
//       _defaultKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       strictContentLength: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       _closed: false,
//       socket: [Circular *1],
//       _header: null,
//       _keepAliveTimeout: 5000,
//       _onPendingData: [Function: bound updateOutgoingData],
//       req: [Circular *2],
//       _sent100: false,
//       _expect_continue: false,
//       _maxRequestsPerSocket: 0,
//       locals: [Object: null prototype] {},
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesWritten)]: 0,
//       [Symbol(kEndCalled)]: false,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype],
//       [Symbol(kUniqueHeaders)]: null
//     },
//     [Symbol(async_id_symbol)]: 1190,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       _consumed: true,
//       [Symbol(owner_symbol)]: [Circular *1]
//     },
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: null,
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kSetNoDelay)]: true,
//     [Symbol(kSetKeepAlive)]: false,
//     [Symbol(kSetKeepAliveInitialDelay)]: 0,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   },
//   httpVersionMajor: 1,
//   httpVersionMinor: 1,
//   httpVersion: '1.1',
//   complete: false,
//   rawHeaders: [
//     'user-agent',
//     'Dart/2.18 (dart:io)',
//     'content-type',
//     'text/plain; charset=utf-8',
//     'accept',
//     '*/*',
//     'accept-encoding',
//     'gzip',
//     'content-length',
//     '5275',
//     'host',
//     '192.168.43.232:8080'
//   ],
//   rawTrailers: [],
//   aborted: false,
//   upgrade: false,
//   url: '/api/callback?sessionId=1',
//   method: 'POST',
//   statusCode: null,
//   statusMessage: null,
//   client: <ref *1> Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _closeAfterHandlingError: false,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: [],
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: true,
//       constructed: true,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: true,
//       destroyed: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       defaultEncoding: 'utf8',
//       awaitDrainWriters: null,
//       multiAwaitDrain: false,
//       readingMore: false,
//       dataEmitted: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     _events: [Object: null prototype] {
//       end: [Array],
//       timeout: [Function: socketOnTimeout],
//       data: [Function: bound socketOnData],
//       error: [Function: socketOnError],
//       close: [Array],
//       drain: [Function: bound socketOnDrain],
//       resume: [Function: onSocketResume],
//       pause: [Function: onSocketPause]
//     },
//     _eventsCount: 8,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       buffered: [],
//       bufferedIndex: 0,
//       allBuffers: true,
//       allNoop: true,
//       pendingcb: 0,
//       constructed: true,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: true,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       [Symbol(kOnFinished)]: []
//     },
//     allowHalfOpen: true,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       requestTimeout: 300000,
//       headersTimeout: 60000,
//       keepAliveTimeout: 5000,
//       connectionsCheckingInterval: 30000,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: true,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       _connectionKey: '6::::8080',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 1157,
//       [Symbol(http.server.connections)]: ConnectionsList {},
//       [Symbol(http.server.connectionsCheckingInterval)]: Timeout {
//         _idleTimeout: 30000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 31638,
//         _onTimeout: [Function: bound checkConnections],
//         _timerArgs: undefined,
//         _repeat: 30000,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 1156,
//         [Symbol(triggerId)]: 1
//       },
//       [Symbol(kUniqueHeaders)]: null
//     },
//     _server: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       requestTimeout: 300000,
//       headersTimeout: 60000,
//       keepAliveTimeout: 5000,
//       connectionsCheckingInterval: 30000,
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: true,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       _connectionKey: '6::::8080',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 1157,
//       [Symbol(http.server.connections)]: ConnectionsList {},
//       [Symbol(http.server.connectionsCheckingInterval)]: Timeout {
//         _idleTimeout: 30000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 31638,
//         _onTimeout: [Function: bound checkConnections],
//         _timerArgs: undefined,
//         _repeat: 30000,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 1156,
//         [Symbol(triggerId)]: 1
//       },
//       [Symbol(kUniqueHeaders)]: null
//     },
//     parser: HTTPParser {
//       '0': null,
//       '1': [Function: parserOnHeaders],
//       '2': [Function: parserOnHeadersComplete],
//       '3': [Function: parserOnBody],
//       '4': [Function: parserOnMessageComplete],
//       '5': [Function: bound onParserExecute],
//       '6': [Function: bound onParserTimeout],
//       _headers: [],
//       _url: '',
//       socket: [Circular *1],
//       incoming: [Circular *2],
//       outgoing: null,
//       maxHeaderPairs: 2000,
//       _consumed: true,
//       onIncoming: [Function: bound parserOnIncoming],
//       [Symbol(resource_symbol)]: [HTTPServerAsyncResource]
//     },
//     on: [Function: socketListenerWrap],
//     addListener: [Function: socketListenerWrap],
//     prependListener: [Function: socketListenerWrap],
//     setEncoding: [Function: socketSetEncoding],
//     _paused: false,
//     _httpMessage: ServerResponse {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       destroyed: false,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       maxRequestsOnConnectionReached: false,
//       _defaultKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       strictContentLength: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       _closed: false,
//       socket: [Circular *1],
//       _header: null,
//       _keepAliveTimeout: 5000,
//       _onPendingData: [Function: bound updateOutgoingData],
//       req: [Circular *2],
//       _sent100: false,
//       _expect_continue: false,
//       _maxRequestsPerSocket: 0,
//       locals: [Object: null prototype] {},
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesWritten)]: 0,
//       [Symbol(kEndCalled)]: false,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype],
//       [Symbol(kUniqueHeaders)]: null
//     },
//     [Symbol(async_id_symbol)]: 1190,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       _consumed: true,
//       [Symbol(owner_symbol)]: [Circular *1]
//     },
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: null,
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kSetNoDelay)]: true,
//     [Symbol(kSetKeepAlive)]: false,
//     [Symbol(kSetKeepAliveInitialDelay)]: 0,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   },
//   _consuming: false,
//   _dumped: false,
//   next: [Function: next],
//   baseUrl: '',
//   originalUrl: '/api/callback?sessionId=1',
//   _parsedUrl: Url {
//     protocol: null,
//     slashes: null,
//     auth: null,
//     host: null,
//     port: null,
//     hostname: null,
//     hash: null,
//     search: '?sessionId=1',
//     query: 'sessionId=1',
//     pathname: '/api/callback',
//     path: '/api/callback?sessionId=1',
//     href: '/api/callback?sessionId=1',
//     _raw: '/api/callback?sessionId=1'
//   },
//   params: {},
//   query: { sessionId: '1' },
//   res: <ref *3> ServerResponse {
//     _events: [Object: null prototype] { finish: [Function: bound resOnFinish] },
//     _eventsCount: 1,
//     _maxListeners: undefined,
//     outputData: [],
//     outputSize: 0,
//     writable: true,
//     destroyed: false,
//     _last: false,
//     chunkedEncoding: false,
//     shouldKeepAlive: true,
//     maxRequestsOnConnectionReached: false,
//     _defaultKeepAlive: true,
//     useChunkedEncodingByDefault: true,
//     sendDate: true,
//     _removedConnection: false,
//     _removedContLen: false,
//     _removedTE: false,
//     strictContentLength: false,
//     _contentLength: null,
//     _hasBody: true,
//     _trailer: '',
//     finished: false,
//     _headerSent: false,
//     _closed: false,
//     socket: <ref *1> Socket {
//       connecting: false,
//       _hadError: false,
//       _parent: null,
//       _host: null,
//       _closeAfterHandlingError: false,
//       _readableState: [ReadableState],
//       _events: [Object: null prototype],
//       _eventsCount: 8,
//       _maxListeners: undefined,
//       _writableState: [WritableState],
//       allowHalfOpen: true,
//       _sockname: null,
//       _pendingData: null,
//       _pendingEncoding: '',
//       server: [Server],
//       _server: [Server],
//       parser: [HTTPParser],
//       on: [Function: socketListenerWrap],
//       addListener: [Function: socketListenerWrap],
//       prependListener: [Function: socketListenerWrap],
//       setEncoding: [Function: socketSetEncoding],
//       _paused: false,
//       _httpMessage: [Circular *3],
//       [Symbol(async_id_symbol)]: 1190,
//       [Symbol(kHandle)]: [TCP],
//       [Symbol(lastWriteQueueSize)]: 0,
//       [Symbol(timeout)]: null,
//       [Symbol(kBuffer)]: null,
//       [Symbol(kBufferCb)]: null,
//       [Symbol(kBufferGen)]: null,
//       [Symbol(kCapture)]: false,
//       [Symbol(kSetNoDelay)]: true,
//       [Symbol(kSetKeepAlive)]: false,
//       [Symbol(kSetKeepAliveInitialDelay)]: 0,
//       [Symbol(kBytesRead)]: 0,
//       [Symbol(kBytesWritten)]: 0
//     },
//     _header: null,
//     _keepAliveTimeout: 5000,
//     _onPendingData: [Function: bound updateOutgoingData],
//     req: [Circular *2],
//     _sent100: false,
//     _expect_continue: false,
//     _maxRequestsPerSocket: 0,
//     locals: [Object: null prototype] {},
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesWritten)]: 0,
//     [Symbol(kEndCalled)]: false,
//     [Symbol(kNeedDrain)]: false,
//     [Symbol(corked)]: 0,
//     [Symbol(kOutHeaders)]: [Object: null prototype] {
//       'x-powered-by': [Array],
//       'access-control-allow-origin': [Array]
//     },
//     [Symbol(kUniqueHeaders)]: null
//   },
//   route: Route {
//     path: '/api/callback',
//     stack: [ [Layer] ],
//     methods: { post: true }
//   },
//   [Symbol(kCapture)]: false,
//   [Symbol(kHeaders)]: {
//     'user-agent': 'Dart/2.18 (dart:io)',
//     'content-type': 'text/plain; charset=utf-8',
//     accept: '*/*',
//     'accept-encoding': 'gzip',
//     'content-length': '5275',
//     host: '192.168.43.232:8080'
//   },
//   [Symbol(kHeadersCount)]: 12,
//   [Symbol(kTrailers)]: null,
//   [Symbol(kTrailersCount)]: 0
// */
