import { useState } from "react";
import { useProvider, useSigner } from "wagmi";
import { Alert, AlertIcon } from "@chakra-ui/react";
import axios from "axios";
import {
  Button,
  FormErrorMessage,
  Heading,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { sha256 } from "js-sha256";

import { CustomFormControl, CustomFormLabel, CustomInput } from "./Input";
import { useENS } from "../hooks/useENS";
import { BigNumber, constants, ethers } from "ethers";
import { MAIN_CONTRACT } from "../consts";

import MAIN_CONTRACT_ABI from "../abi/main.json";

export const WhosVerified = () => {
  const toast = useToast();

  const provider = useProvider();
  // const signer = useSigner();

  const [loading, setLoading] = useState(false);

  const [globalInput, setGlobalInput] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // const { address: ensAddress } = useENS(globalInput);

  const onFormSubmit = async (data) => {
    setLoading(true);
    setIsVerified(null);

    try {
      // could
      let { input } = data;
      // setGlobalInput(input);

      // if (isAddress(input) || isENSName(input)) {
      // console.log("IsAddress");
      // input = ensAddress;
      // }

      // if (isLensHandle(`${input}`)) {
      //   const res = await axios.request({
      //     method: "post",
      //     url: "https://api.lens.dev/",
      //     headers: {
      //       "content-type": "application/json",
      //     },
      //     data: {
      //       query: `
      //           query Profile {
      //               profile(request: { handle: "${input}" }) {
      //                 id
      //                 name
      //                 ownedBy
      //               }
      //           }
      //           `,
      //     },
      //   });

      //   console.log("lens.dev res: ", res);

      //   input = res.data.data.profile.ownedBy;
      // }

      const contract = new ethers.Contract(
        MAIN_CONTRACT,
        MAIN_CONTRACT_ABI,
        provider
      );

      // const hashedNo = ethers.BigNumber.from("0x" + sha256(input)).toString();
      // console.log("hashedNo: ", hashedNo);

      const exists = await contract.account_to_aadhar(input);

      console.log("exists: ", exists);

      // console.log(constants.Zero, constants.AddressZero)

      if (ethers.BigNumber.from(exists).eq(constants.Zero)) {
        setIsVerified(false);
      } else {
        setIsVerified(true);
      }
    } catch (error) {
      console.log("Unable to send Transaction: ", error);
    }

    // setIsVerified(null);
    setLoading(false);
  };

  return (
    <>
      <VStack mt={150}>
        <Heading id="who-verified">Who&apos;s Verif ied</Heading>
        <Text>
          Check who&apos;s verif ied, type ETH Address, ENS or Lens handle
        </Text>
      </VStack>

      <IsThisPhoneVerified />

      <Formik
        initialValues={{
          input: "",
        }}
        onSubmit={onFormSubmit}
      >
        <Form
          style={{
            width: "100%",
          }}
        >
          <VStack spacing={18} mt={10} alignItems="stretch">
            <Field name="input">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>
                    Eth address, Ens or Lens handle
                  </CustomFormLabel>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="eth address, ens or lens name"
                  />
                  {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
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
              Check ETH Address
            </Button>
          </VStack>
        </Form>
      </Formik>

      {isVerified === false ? (
        <Alert status="error" mt="10px">
          <AlertIcon />
          Na pal, looks like this address aint E-Aadhaar verif ied
        </Alert>
      ) : null}

      {isVerified === true ? (
        <Alert status="success" mt="10px">
          <AlertIcon />
          Lit, looks like this address is verified with E-Aadhaar!
        </Alert>
      ) : null}
    </>
  );
};

const IsThisPhoneVerified = () => {
  const provider = useProvider();
  const [loading, setLoading] = useState(false);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const onFormSubmit = async (data) => {
    setLoading(true);
    setIsVerified(null);

    try {
      // could
      let { input } = data;
      // setGlobalInput(input);

      // setIsVerified(true)

      // TODO: fetch isVerified from Contract
      // ---------
      // ---------

      const contract = new ethers.Contract(
        MAIN_CONTRACT,
        MAIN_CONTRACT_ABI,
        provider
      );

      console.log("input:", input, sha256(input));

      const hashedPhoneNo = ethers.BigNumber.from(
        "0x" + sha256(input)
      ).toString();
      console.log("hashedPhoneNo: ", hashedPhoneNo);

      const account = await contract.phone_to_account(hashedPhoneNo);
      console.log("account: ", account);

      if (ethers.BigNumber.from(account).eq(constants.Zero)) {
        setIsVerified(false);
      } else {
        setIsVerified(true);
      }
    } catch (error) {
      console.log("Unable to send Transaction: ", error);
      setIsVerified(false);
    }

    setLoading(false);
  };

  return (
    <>
      <Formik
        initialValues={{
          input: "",
        }}
        onSubmit={onFormSubmit}
      >
        <Form
          style={{
            width: "100%",
          }}
        >
          <VStack spacing={18} mt={10} alignItems="stretch">
            <Field name="input">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>Phone Number</CustomFormLabel>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="1234567890"
                  />
                  {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
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
              Check Phone No.
            </Button>
          </VStack>
        </Form>
      </Formik>

      {isVerified === false ? (
        <Alert status="error" mt="10px">
          <AlertIcon />
          Na pal, looks like this phone no. aint E-Aadhaar verified!
        </Alert>
      ) : null}

      {isVerified === true ? (
        <Alert status="success" mt="10px">
          <AlertIcon />
          Lit, looks like this phone no. is verified with E-Aadhaar!
        </Alert>
      ) : null}
    </>
  );
};
