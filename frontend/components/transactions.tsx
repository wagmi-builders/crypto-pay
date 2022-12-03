import { useState, useEffect } from "react";
import { useProvider, useAccount } from "wagmi";
import { ethers } from "ethers";
import { Heading, Text, VStack } from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
} from "@chakra-ui/react";

// import { QRCode } from 'react-qr-svg';
import proofRequest from "../proofOfRequest";
import { MAIN_CONTRACT, SCHEMA_NAME, SCHEMA_URL } from "../consts";

import MAIN_CONTRACT_ABI from "../abi/main.json";
import { TXCard } from "./txCard";
import { QRDialog } from "./QRDialog";

export const createProofRequest = () => {
  let qrProofRequestJson: any = { ...proofRequest };

  qrProofRequestJson.body.transaction_data.contract_address = MAIN_CONTRACT;
  qrProofRequestJson.body.scope[0].rules.query.req = {
    // NOTE: this value needs to match the Attribute name in https://platform-test.polygonid.com
    verified: {
      $eq: 1,
    },
  };
  // NOTE1: if you change this you need to resubmit the erc10|erc721ZKPRequest
  // NOTE2: type is case-sensitive
  qrProofRequestJson.body.scope[0].rules.query.schema = {
    url: SCHEMA_URL,
    type: SCHEMA_NAME,
  };

  qrProofRequestJson.body.reason = "2FA Verification";

  return JSON.stringify(qrProofRequestJson);
};

export const PendingTransactions = () => {
  const toast = useToast();

  const provider = useProvider();
  const { isConnected, address } = useAccount();

  const [loading, setLoading] = useState(false);
  const [txs, setTXS] = useState([]);

  const [qrCodeData, setQRCodeData] = useState("");

  const filteredTxs = txs.filter((tx) => tx?.valid) || [];

  const proveAndExecuteTx = async () => {
    setQRCodeData("");

    const qrData = await createProofRequest();
    setQRCodeData(qrData);
  };

  // // fetch queued payments
  const fetchPendingTxs = async () => {
    setLoading(true);

    const contract = new ethers.Contract(
      MAIN_CONTRACT,
      MAIN_CONTRACT_ABI,
      provider
    );

    const pendingTransactionsForUser = await contract.getQueuedPayments(
      address
      // index
    );

    console.log("pendingTransactionsForUser", pendingTransactionsForUser);

    setTXS(pendingTransactionsForUser);
    setLoading(false);
  };

  useEffect(() => {
    if (!isConnected) return;

    fetchPendingTxs();
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
            You have {filteredTxs.length} Pending Transactions
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Prove your Identity to execute pending transactions
          </AlertDescription>

          <VStack w="100%">
            <Button
              colorScheme="green"
              type="Reload"
              mt={20}
              width="100%"
              isLoading={loading}
              // leftIcon={<}
              onClick={async () => {
                await fetchPendingTxs();

                toast({
                  title: "Fetched Latest pending transactions",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Reload
            </Button>

            {filteredTxs.length ? (
              <Button
                colorScheme="blue"
                type="submit"
                mt={20}
                width="100%"
                // isLoading={loading}
                onClick={proveAndExecuteTx}
                disabled={loading}
              >
                Prove & Execute
              </Button>
            ) : null}
          </VStack>
        </Alert>
      </VStack>

      <VStack spacing="10px" mt="20px">
        {filteredTxs.map((tx, i) => {
          const {
            amount: amountBG,
            recipientPhoneNumber: recepientPhoneNumberBG,
            token,
          } = tx;

          const recepientPhoneNumber = ethers.BigNumber.from(
            recepientPhoneNumberBG
          ).toString();

          const amount = ethers.BigNumber.from(amountBG).toString();

          return (
            <TXCard
              key={i}
              id={i}
              recepientAddress={recepientPhoneNumber}
              token={`${token}`}
              amount={amount}
              onCloseClick={(id) => {
                console.log("remove: ", id);
              }}
            />
          );
        })}
      </VStack>

      <QRDialog data={qrCodeData} />
    </>
  );
};
