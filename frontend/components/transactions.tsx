import { useState, useEffect } from "react";
import { Heading, Text, VStack } from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";

export const PendingTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [noOfTxs, setNoOfTxs] = useState(0);

  useEffect(() => {
    setInterval(() => {
      // setNoOfTxs()
    }, 3000);
  }, []);

  return (
    <>
      <VStack mt={100}>
        <Heading id="about">Pending Transactions</Heading>
        <Text>2FA - Your Pending Transactions</Text>
      </VStack>

      <VStack alignItems="center" width="100%" mt={10}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          // height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            You have {noOfTxs} Pending Transactions
          </AlertTitle>
          {}
          <AlertDescription maxWidth="sm">
            Prove your Identity to execute pending transactions
          </AlertDescription>

          {noOfTxs ? (
            <Button
              colorScheme="blue"
              type="submit"
              mt={20}
              width="100%"
              isLoading={loading}
            >
              Prove & Execute
            </Button>
          ) : null}
        </Alert>
      </VStack>
    </>
  );
};
