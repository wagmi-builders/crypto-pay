import { ethers, BigNumber } from "ethers";
import { SequencerProvider } from "starknet";
import { useState } from "react";
import { useProvider, useSigner } from "wagmi";

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

export const SendCrypto = () => {
  const provider = useProvider();
  const signer = useSigner();

  const [loading, setLoading] = useState(false);

  const onFormSignupSubmit = async (data) => {
    setLoading(true);

    const { mobileNumber, amount, tokens } = data;

    try {
    } catch (error) {
      console.log("Unable to send Transaction: ", error);
    }
    setLoading(false);
  };

  return (
    <>
      <VStack mt={100}>
        <Heading id="send">Send Crypto</Heading>
        <Text>
          Send crypto to eAadhaar verified address using their Phone Number
        </Text>
        <Text>Phone number is hashed for security & privacy</Text>
      </VStack>

      <Formik
        initialValues={{
          mobileNumber: "",
          amount: 0,
        }}
        onSubmit={onFormSignupSubmit}
      >
        <Form
          style={{
            width: "100%",
          }}
        >
          <VStack spacing={18} alignItems="stretch">
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

            <Field component="select" name="token">
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
            colorScheme="blue"
            type="submit"
            mt={50}
            width="100%"
            bg="#457B9D"
            isLoading={loading}
          >
            Send
          </Button>
        </Form>
      </Formik>
    </>
  );
};
