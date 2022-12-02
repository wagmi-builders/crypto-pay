// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { POLYGON_API_BASE_URL } from "../../consts";
import { auth } from "@iden3/js-iden3-auth";

export default async function generateProof(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let hostUrl = "<YOUR REMOTE NGROK HOST>";

  if (process.env.NODE_ENV === "development") {
    hostUrl = "http://localhost:3000";
  } else if (process.env.NODE_ENV === "production") {
    hostUrl = `${process.env.NODE_URL}`;
  }

  const sessionId = 1;
  const callbackURL = "/api/callback";

  // Audience is verifier id
  const audience = "1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ";

  const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

  // Generate request for basic auth
  const request = auth.createAuthorizationRequest(
    "eAadhaar verify",
    audience,
    uri
  );

  // request.id = "7f38a193-0918-4a48-9fac-36adfdb8b542";
  // request.thid = "7f38a193-0918-4a48-9fac-36adfdb8b542";

  // Add query-based request
  const proofRequest = {
    id: 1,
    circuit_id: "credentialAtomicQuerySig",
    rules: {
      query: {
        allowedIssuers: ["*"],
        schema: {
          type: "cAadhaar",
          url: "https://s3.eu-west-1.amazonaws.com/polygonid-schemas/00ab6ebc-874d-4206-8640-3ff796a4c888.json-ld",
        },
        req: {
          dateOfBirth: {
            $lt: 20100101, // dateOfBirth field less then 2000/01/01
          },
        },
      },
    },
  };

  const scope = request.body.scope ?? [];
  request.body.scope = [...scope, proofRequest];

  // Store zk request in map associated with session ID
  // requestMap.set(`${sessionId}`, request);

  return res.status(200).json({ request });
}
