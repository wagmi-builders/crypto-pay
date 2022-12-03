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
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

import { CustomFormControl, CustomFormLabel, CustomInput } from "./Input";
import { useENS } from "../hooks/useENS";
import { isAddress, isENSName, isLensHandle } from "../utils/helpers";
import { ethers } from "ethers";
import { REGISTRY_CONTRACT_ADDRESS } from "../consts";

import REGISTRY_CONTRACT_ABI from "../../artifacts/contracts/Registry.sol/Registry.json";

export const WhosVerified = () => {
  const provider = useProvider();
  const signer = useSigner();

  const [loading, setLoading] = useState(false);

  const [globalInput, setGlobalInput] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const { address: ensAddress } = useENS(globalInput);

  const onFormSubmit = async (data) => {
    setLoading(true);

    try {
      // could
      let { input } = data;
      setGlobalInput(input);

      if (isAddress(input) || isENSName(input)) {
        input = ensAddress;
      }

      if (isLensHandle(`${input}`)) {
        const res = await axios.request({
          method: "post",
          url: "https://api.lens.dev/",
          headers: {
            "content-type": "application/json",
          },
          data: {
            query: `
                query Profile {
                    profile(request: { handle: "${input}" }) {
                      id
                      name
                      ownedBy
                    }
                }
                `,
          },
        });

        console.log("lens.dev res: ", res);

        input = res.data.data.profile.ownedBy;
      }

      // TODO: fetch isVerified from Contract
      // ---------
      // ---------

      const contract = new ethers.Contract(
        REGISTRY_CONTRACT_ADDRESS,
        REGISTRY_CONTRACT_ABI.abi,
        provider
      );

      const value = contract.methods.account_to_aadhar[input];

      console.log("value: ", value);
    } catch (error) {
      console.log("Unable to send Transaction: ", error);
    }

    setLoading(false);
  };

  return (
    <>
      <VStack mt={100}>
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
        <Alert status="error">
          <AlertIcon />
          Na pal, looks like this address ain&abpos; E-Aadhaar verified
        </Alert>
      ) : null}

      {isVerified === true ? (
        <Alert status="success">
          <AlertIcon />
          Lit, looks like this address is verified with E-Aadhaar verified
        </Alert>
      ) : null}
    </>
  );
};

const IsThisPhoneVerified = () => {
  const [loading, setLoading] = useState(false);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const onFormSubmit = async (data) => {
    setLoading(true);

    try {
      // could
      let { input } = data;
      // setGlobalInput(input);

      // setIsVerified(true)

      // TODO: fetch isVerified from Contract
      // ---------
      // ---------
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
        <Alert status="error">
          <AlertIcon />
          Na pal, looks like this phone no. ain&abpos; E-Aadhaar verified
        </Alert>
      ) : null}

      {isVerified === true ? (
        <Alert status="success">
          <AlertIcon />
          Lit, looks like this phone no. is verified with E-Aadhaar verified
        </Alert>
      ) : null}
    </>
  );
};
