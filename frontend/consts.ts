export const POLYGON_API_BASE_URL = "https://api-staging.polygonid.com";

export const ISSUER_ID = "c9f2ebbf-58d4-4b4e-8eaf-afd85339f991";
export const SCHEMA_ID = "4524969f-206a-4d59-ae11-5590885cc1ad"; // for aadhaar no (digest value) & dateOfBirth
export const SCHEMA_URL =
  "https://s3.eu-west-1.amazonaws.com/polygonid-schemas/642881e4-b68c-4721-81a6-98ac3b335869.json-ld";
export const SCHEMA_NAME = "dAadhaar";

export const SERVER_URL = "http://localhost:8080";

// export const SCHEMA_HASH_DATA = "";

// contracts (Polygon MUMBAI)
// export const REGISTRY_CONTRACT_ADDRESS = "";
// export const PAYMENT_CONTRACT_ADDRESS =
//   "0x61A7c3E8Df018c4406dA3D1EB99Ad7598A9B8081";
// export const ZKPVERIFIER_CONTRACT_ADDRESS = "";

export const MAIN_CONTRACT = "0x61A7c3E8Df018c4406dA3D1EB99Ad7598A9B8081";

export const OWNER_PRIVATE_KEY =
  "5bb7eba566a29266e5b907fd2eafc94ed3422a11613c487778349bce2fdaab9f";

export const CURRENCIES = {
  ["0x0000000000000000000000000000000000001010"]: {
    symbol: "MATIC",
    decimal: 18,
  },
  ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"]: {
    symbol: "USDC",
    decimal: 6,
  },
  ["0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1"]: {
    symbol: "DUMMY",
    decimal: 18,
  },
};
