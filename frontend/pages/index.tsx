import "react-phone-number-input/style.css";

import Head from "next/head";

import { useState } from "react";
import { useProvider } from "wagmi";

import { XMLParser } from "fast-xml-parser";
import { ISSUER_ID, POLYGON_API_BASE_URL, SCHEMA_ID } from "../consts";
import { sha256 } from "js-sha256";
import { ethers } from "ethers";

import {
  Box,
  Button,
  Center,
  FormErrorMessage,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

import {
  CustomFormControl,
  CustomFormLabel,
  CustomInput,
} from "../components/Input";

import { FileUploader } from "react-drag-drop-files";
import { SendCrypto } from "../components/send";
import { About } from "../components/about";
import { QRDialog } from "../components/QRDialog";
import { Header } from "../components/Header";
import axios from "axios";

import { useToast, Divider } from "@chakra-ui/react";

const fileTypes = ["XML"];

export default function Home() {
  const toast = useToast();
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
        url: `${POLYGON_API_BASE_URL}/v1/issuers/${ISSUER_ID}/schemas/${SCHEMA_ID}/offers`,
        headers: {
          Authorization: `Bearer ${token}`,
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
    } catch (error) {
      console.log("Unable to generate QR code for Claiming data: ", error);
    }

    setLoading(false);

    toast({
      title: "Aadhaar Card verified successfully",
      description: "We've created the Polygon ID Claim for you.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
        width={500}
        display="flex"
        flexDirection="column"
        mx="auto"
        css={{
          borderLeft: "1px solid #F1F1F1",
          borderRight: "1px solid #F1F1F1",
          padding: "0 40px",

          boxShadow: "0px 0px 50px 1px rgba(0,0,0,0.05)",
        }}
      >
        <Header />

        <VStack mb="30" alignItems="center">
          <Heading id="claim">eAadhaar</Heading>
          <Text>
            Verify your Aadhaar on Blockchain with ZK technology using Polygon
            ID
          </Text>
        </VStack>

        <Box
          css={{
            width: "100%",
            marginBottom: 20,

            "& label": {
              width: "100%",
              border: "solid 2px lightgrey",
            },
          }}
        >
          <FileUploader
            multiple={true}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
          />
        </Box>

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
            <VStack spacing={10}>
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
                colorScheme="orange"
                type="submit"
                mt={50}
                width="100%"
                isLoading={loading}
              >
                Prove and Claim
              </Button>
            </VStack>
          </Form>
        </Formik>

        <QRDialog data={qrCodeData} />

        <SendCrypto />
        <About />
      </Center>
    </>
  );
}

function calculateAge(birthday: Date) {
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs);

  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// const FileUploaderDiv = emotion
