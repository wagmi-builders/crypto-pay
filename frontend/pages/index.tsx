import "react-phone-number-input/style.css";

import Head from "next/head";

import { ethers, BigNumber } from "ethers";
import { SequencerProvider } from "starknet";
import { useState } from "react";
import { useProvider } from "wagmi";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

import {
  CustomFormControl,
  CustomFormLabel,
  CustomInput,
} from "../components/Input";

import { XMLParser } from "fast-xml-parser";
import { FileUploader } from "react-drag-drop-files";
import PhoneInput from "react-phone-number-input";
import axios from "axios";
import {
  ISSUER_ID,
  POLYGON_API_BASE_URL,
  SCHEMA_HASH_VERIFIED,
} from "../consts";
import { QRCodeSVG } from "qrcode.react";
import { sha256 } from "js-sha256";

const fileTypes = ["XML"];

export default function Home() {
  const provider = useProvider();

  const [loading, setLoading] = useState(false);

  // data
  const [fileContent, setFileContent] = useState(); // eAadaar content
  const [qrCodeData, setQRCodeData] = useState("");

  const handleChange = (files: File[]) => {
    // 1) drop file & read file content
    const handleFileLoad = (event: any) => {
      console.log(event);
      setFileContent(event.target.result);
    };

    // console.log("file", file);

    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(files[0]);

    // setFile(file);
  };

  const onFormSubmit = async (data) => {
    setLoading(true);

    const { mobileNumber, aadhaarLastDigitsNumber } = data;

    let dateOfBirth: number | string;
    let age: number;
    let aadhaarHashedDigest; // in number

    let OFFER_ID: string;

    try {
      // 2) parse data from XML doc
      if (!fileContent) return;

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
        aadhaarObj["OfflinePaperlessKyc"]["Signature"]["SignedInfo"][
          "Reference"
        ]["DigestValue"];

      // digestValue = "abc12"; // TODO: update

      // hash with sha256
      const hashedDigest = sha256(digestValue);
      console.log("hashedDigest", hashedDigest);

      aadhaarHashedDigest = Number(
        ethers.BigNumber.from("0x" + hashedDigest).toString()
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
      const tokenRes = await axios.get("/api/token");
      token = tokenRes.data.token;

      console.log("tokenRes: ", tokenRes);
      console.log("token: ", token);

      // active org
      const activeTokenRes = await axios({
        method: "post",
        url: `${POLYGON_API_BASE_URL}/v1/orgs/account-management/activate`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      token = activeTokenRes.data.token || "";
      console.log("active token: ", token);

      console.log(dateOfBirth, aadhaarHashedDigest);

      // generate offer
      const offerRes = await axios({
        method: "post",
        url: `${POLYGON_API_BASE_URL}/v1/issuers/${ISSUER_ID}/schemas/${SCHEMA_HASH_VERIFIED}/offers`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          attributes: [
            {
              attributeKey: "dateOfBirth",
              attributeValue: dateOfBirth,
            },
            {
              attributeKey: "aadhaarNumber",
              attributeValue: aadhaarHashedDigest, // is actually hashed DigestValue
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
      if (!OFFER_ID) return;

      // get offer QR data
      // try {
      const offerQRRes = await axios.post(
        `${POLYGON_API_BASE_URL}/v1/offers-qrcode/${OFFER_ID}`
      );

      console.log("offer res data: ", offerQRRes.data);

      setQRCodeData(JSON.stringify(offerQRRes.data.qrcode));
      // } catch (err) {
      // console.log("err generating QR code, err: ", err);
      // alert("error generating QR code");
      // }
    } catch (error) {
      console.log("Unable to generate Proof in signup: ", error);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>eAadhaar</title>
        <link rel="icon" href="/favicon.ico" />

        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Center
        width={450}
        height="100vh"
        display="flex"
        flexDirection="column"
        mx="auto"
      >
        <HStack mt={20} mb={10} spacing={10}>
          <Link href="/">Claim</Link>
          <Link href="/about">Verify</Link>

          {/* <Link href="/about">Send</Link> */}
        </HStack>

        <VStack mb="30" alignItems="center">
          <Heading>eAadhaar</Heading>
          <Text>
            Verify your Aadhaar on Blockchain with ZK technology using Polygon
            ID
          </Text>
        </VStack>

        <FileUploader
          multiple={true}
          handleChange={handleChange}
          name="file"
          types={fileTypes}
        />

        <Formik
          initialValues={{
            mobileNumber: "",
            aadhaarLastDigitsNumber: "",
          }}
          onSubmit={onFormSubmit}
        >
          <Form
            style={{
              width: "100%",
            }}
          >
            <Field name="mobileNumber">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>Mobile Number</CustomFormLabel>
                  <CustomInput
                    {...field}
                    type="number"
                    placeholder="1234567890"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </CustomFormControl>
              )}
            </Field>

            <Field name="aadhaarLastDigitsNumber">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>
                    Last Digit of Aadhaar Number
                  </CustomFormLabel>
                  <CustomInput {...field} type="number" placeholder="-" />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </CustomFormControl>
              )}
            </Field>

            <Button
              colorScheme="blue"
              type="submit"
              mt={50}
              width="100%"
              bg="#457B9D"
              isLoading={loading}
            >
              Prove and Claim
            </Button>
          </Form>
        </Formik>
      </Center>
    </>
  );
}

function calculateAge(birthday: Date) {
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs);

  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
