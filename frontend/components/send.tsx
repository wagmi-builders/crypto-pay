import { ethers, BigNumber } from "ethers";
import { useState } from "react";
import { useProvider, useSigner, useAccount } from "wagmi";
import { sha256 } from "js-sha256";

import axios from "axios";
import { erc20ABI } from "wagmi";

import {
  Button,
  FormErrorMessage,
  Heading,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";

import { CustomFormControl, CustomFormLabel, CustomInput } from "./Input";
import { CURRENCIES, SERVER_URL } from "../consts";
import { QRDialog } from "./QRDialog";

import { MAIN_CONTRACT } from "../consts";

import MAIN_CONTRACT_ABI from "../abi/main.json";

export const SendCrypto = () => {
  const toast = useToast();

  const provider = useProvider();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const [loading, setLoading] = useState(false);

  const [qrCodeData, setQRCodeData] = useState("");

  const onFormSignupSubmit = async (data) => {
    if (!signer) {
      console.log("no signer");
      return;
    }

    setLoading(true);

    // send transaction to add payment to queue
    const { mobileNumber, amount, token } = data;
    const [tokenAddress, tokenDecimals] = token.split("-");

    try {
      const contract = new ethers.Contract(
        MAIN_CONTRACT,
        MAIN_CONTRACT_ABI,
        signer
      );

      let amountBigNum = BigNumber.from(amount).mul(
        BigNumber.from(10).pow(BigNumber.from(tokenDecimals))
      );

      console.log(
        tokenAddress,
        tokenDecimals,
        amountBigNum.toString(),
        mobileNumber,
        amount,
        signer
      );

      const hashedPhoneNo = ethers.BigNumber.from(
        "0x" + sha256(mobileNumber.toString())
      ).toString();

      console.log("hashedPhoneNo: ", hashedPhoneNo, mobileNumber);

      const tx = await contract.queuePayment(
        tokenAddress,
        hashedPhoneNo,
        amountBigNum.toString(),
        // signer
        {
          gasPrice: 50000000000,
        }
      );

      // console.log("queued payment..");

      // await signer.signMessage(sha256("abcd"));

      // // toast({
      // // title: "Transaction queued successfully!",
      // // description: "Please scan the QR code to store your claim.",
      // // status: "success",
      // // duration: 3000,
      // // isClosable: true,
      // // });

      // // await tx.wait()
      // const d = await signer?.sendTransaction(tx);
      // console.log("d", d);

      console.log("Sent transaction to Queue payment", tx.hash);

      // after queuing
      const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      const approveTx = await erc20Contract.approve(
        MAIN_CONTRACT,
        amountBigNum,
        {
          gasPrice: 50000000000,
        }
      );

      await tx.wait();
      await approveTx.wait();

      console.log("APPROVE TOKENS TX - tx.hash", tx.hash);

      toast({
        title: "Transaction queued successfully!",
        // description: "Please scan the QR code to store your claim.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <>
      <VStack mt={150}>
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
          token: `${Object.keys(CURRENCIES)[0]}-${
            Object.values(CURRENCIES)[0].decimal
          }`,
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
                    defaultValue={`${Object.keys(CURRENCIES)[0]}-${
                      Object.values(CURRENCIES)[0].decimal
                    }`}
                    {...field}
                  >
                    {Object.keys(CURRENCIES).map((token, i) => {
                      const { symbol, decimal } = CURRENCIES[token];

                      return (
                        <option key={i} value={`${token}-${decimal}`}>
                          {symbol}
                        </option>
                      );
                    })}
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
