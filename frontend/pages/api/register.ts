// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { ISSUER_ID, POLYGON_API_BASE_URL, SCHEMA_ID } from "../../consts";
import { sha256 } from "js-sha256";
import { ethers } from "ethers";
import { generateTokenFunc } from "./token";

export default async function generateClaim(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileContent } = req.body;

  let dateOfBirth: number | string;
  let age: number;
  let aadhaarHashedDigest; // in number

  let OFFER_ID: string;

  // try {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
  });
  let aadhaarObj = xmlParser.parse(fileContent);
  console.log('data" ', aadhaarObj);

  const poiData = aadhaarObj["OfflinePaperlessKyc"]["UidData"]["Poi"];
  const dob: string = poiData["@_dob"];

  console.log("dateOfBirth: ", dob);

  // PARSE DOB: DD-MM-YYYY to YYYYMMDD
  const [d, m, y] = dob.split("-");
  const numDOB = Number(`${y}${m}${d}`);

  dateOfBirth = numDOB;
  age = 18; // TODO: update later

  // aadhaar digest
  let digestValue =
    aadhaarObj["OfflinePaperlessKyc"]["Signature"]["SignedInfo"]["Reference"][
      "DigestValue"
    ];

  // digestValue = "abc12"; // TODO: update

  // hash with sha256
  const hashedDigest = sha256(digestValue);
  console.log("hashedDigest", hashedDigest);

  aadhaarHashedDigest = Number(
    // ethers.BigNumber.from("0x" + "6def8c7db01870f0e504707032d2e2093d0f339d").toString(),
    ethers.BigNumber.from("0x" + "abcd328479234").toString()
    // ethers.BigNumber.from("0x" + hashedDigest).toString()
  );

  // } catch (err) {
  // console.log("Failed parsing XML data, err: ", err);
  // alert("Failed parsing XML data");
  // }

  // create claim offer
  // const generateClaimOffer = async (dateOfBirth: number, age: number) => {
  let token = "";

  // try {aadhaarHashedDigest
  // get org token
  token = await generateTokenFunc();
  console.log("token: ", token);
  //   token = tokenRes.data.token;

  //   console.log("tokenRes: ", tokenRes);

  // active org
  const activeTokenRes = await axios({
    method: "post",
    url: `${POLYGON_API_BASE_URL}/v1/orgs/account-management/activate`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  });

  console.log("----------------------------", activeTokenRes.json());

  token = activeTokenRes.data.token || "";
  console.log("active token: ", activeTokenRes, token);

  console.log(dateOfBirth, aadhaarHashedDigest);

  // generate offer
  const offerRes = await axios({
    method: "post",
    url: `${POLYGON_API_BASE_URL}/v1/issuers/${ISSUER_ID}/schemas/${SCHEMA_ID}/offers`,
    headers: {
      Authorization: `Bearer ${token}`,
      //   Accept: "application/json",

      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
    data: {
      attributes: [
        {
          attributeKey: "aadhaarNumber",
          attributeValue: aadhaarHashedDigest, // is actually hashed DigestValue
        },
        {
          attributeKey: "verified",
          attributeValue: 1,
        },
      ],
      limitedClaims: 1,
    },
  });

  console.log("data:", offerRes);

  const offerIdString = offerRes.data.id;
  OFFER_ID = offerIdString;
  // } catch (err) {
  // console.log("Failed generating claims, err: ", err);
  // alert("Failed generating claims");
  // }

  // generate QR code
  //   if (!OFFER_ID) return;

  // get offer QR data
  // try {
  const offerQRRes = await axios({
    method: "POST",
    baseURL: `${POLYGON_API_BASE_URL}/v1/offers-qrcode/${OFFER_ID}`,

    headers: {
      Authorization: `Bearer ${token}`,
      //   Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });

  console.log("offer res data: ", offerQRRes);

  return res.status(200).json({ qrCodeData: offerQRRes.data.qrcode });
}
