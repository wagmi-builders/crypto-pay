import { ethers, BigNumber } from "ethers";
import { useState } from "react";
import { useProvider, useSigner } from "wagmi";


import axios from "axios";
import {
  Button,
  FormErrorMessage,
  Heading,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

import { CustomFormControl, CustomFormLabel, CustomInput } from "./Input";
import { SERVER_URL } from "../consts";
import { QRDialog } from "./QRDialog";

import { MAIN_CONTRACT } from "../consts";

import MAIN_CONTRACT_ABI from "../abi/main.json";

export const SendCrypto = () => {
  const provider = useProvider();
  const signer = useSigner();

  const [loading, setLoading] = useState(false);

  const [qrCodeData, setQRCodeData] = useState("");

  const onFormSignupSubmit = async (data) => {
    setLoading(true);

    // send transaction to add payment to queue
    const { mobileNumber, amount, tokenData } = data;
    const [tokenAddress, tokenDecimals] = tokenData.split("-")
    console.log('here')

    const contract = new ethers.Contract(
      MAIN_CONTRACT,
      MAIN_CONTRACT_ABI,
      provider
    );
    const L1_PRIVATE_KEY = '5bb7eba566a29266e5b907fd2eafc94ed3422a11613c487778349bce2fdaab9f'
    const signer = new ethers.Wallet(
      L1_PRIVATE_KEY,
      provider
    )

    let amountBigNum = BigNumber.from(amount).mul(BigNumber.from(10).pow(BigNumber.from(tokenDecimals)))
    console.log(
      tokenAddress,
      tokenDecimals,
      amountBigNum.toString(),
      mobileNumber,
      amount,
      signer,
    )
    const tx = await contract.queuePayment(
      tokenAddress,
      mobileNumber,
      amountBigNum.toString(),
      signer,
      {
        gasLimit: "100000000000"  // 100 gwei
      }
    )
    console.log("Sent transaction to Queue payment", tx.hash);

    setLoading(false);
  };

  return (
    <>
      <VStack mt={100}>
        <Heading id="send">Send Crypto</Heading>
        <Text>
          Send crypto to eAadhaar verified address using their Phone Number
          <br />
          Phone number is hashed for security & privacy
        </Text>
      </VStack>

      <Formik
        initialValues={{
          mobileNumber: "",
          amount: 0,
          token: "0x0000000000000000000000000000000000001010-18",
        }}
        onSubmit={onFormSignupSubmit}
      >
        <Form
          style={{
            width: "100%",
          }}
        >
          <VStack spacing={18} mt={10} alignItems="stretch">
            <Field name="mobileNumber">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>Recepient Mobile Number</CustomFormLabel>
                  <CustomInput
                    {...field}
                    type="number"
                    placeholder="1234567890"
                  />
                  {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </CustomFormControl>
              )}
            </Field>

            <Field name="amount">
              {({ field, form }) => (
                <CustomFormControl isRequired>
                  <CustomFormLabel>Amount</CustomFormLabel>
                  <CustomInput {...field} type="number" />
                  {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </CustomFormControl>
              )}
            </Field>

            <Field component="select" name="token" id="token" multiple={false}>
              {({ field, form }) => (
                <>
                  <Select
                    placeholder="Select Token"
                    size="lg"
                    bg="#FFF"
                    defaultValue="0x0000000000000000000000000000000000001010-18" // USDC
                    {...field}
                  >
                    <option value="0x0000000000000000000000000000000000001010-18">
                      MATIC
                    </option>
                    <option value="0x2791bca1f2de4661ed88a30c99a7a9449aa84174-6">
                      USDC
                    </option>
                  </Select>
                  {form.errors.name}
                </>
              )}
            </Field>
          </VStack>

          <Button
            colorScheme="orange"
            type="submit"
            mt={50}
            width="100%"
            isLoading={loading}
          >
            Send
          </Button>
        </Form>
      </Formik>

      <QRDialog data={qrCodeData} />
    </>
  );
};
