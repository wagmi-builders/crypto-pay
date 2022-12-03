import { useState, useEffect } from "react";
import {useProvider} from "wagmi";
import {ethers, BigNumber} from "ethers";
import { Heading, Text, VStack } from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";

// import { QRCode } from 'react-qr-svg';
// import proofRequest from '../../proofRequest';
import { MAIN_CONTRACT } from "../consts";

import MAIN_CONTRACT_ABI from "../abi/main.json";


export const executeTransaction = () => {
 
  let qrProofRequestJson: any = { ...proofRequest };
  qrProofRequestJson.body.transaction_data.contract_address = MAIN_CONTRACT;
  qrProofRequestJson.body.scope[0].rules.query.req = {
    // NOTE: this value needs to match the Attribute name in https://platform-test.polygonid.com
    "verified": {
      "$eq": 1
    }
  };
  // NOTE1: if you change this you need to resubmit the erc10|erc721ZKPRequest
  // NOTE2: type is case-sensitive
  qrProofRequestJson.body.scope[0].rules.query.schema = {
    "url": "https://s3.eu-west-1.amazonaws.com/polygonid-schemas/642881e4-b68c-4721-81a6-98ac3b335869.json-ld",
    "type": "dAadhaar"
  };

  // show the above QR code.
  // const App = () => {

  //   return (
  //     <div className="App p-10">
  //       <QRCode
  //         level="Q"
  //         style={{ width: 256 }}
  //         value={JSON.stringify(qrProofRequestJson)}
  //       />
  //     </div>
  //   )
  // };
}

export const PendingTransactions = () => {
  const provider = useProvider();

  const [loading, setLoading] = useState(false);
  const [noOfTxs, setNoOfTxs] = useState(0);
  
  const contract = new ethers.Contract(
    MAIN_CONTRACT,
    MAIN_CONTRACT_ABI,
    provider
  );

  // // fetch queued payments
  // const userAddress = '0x87ef4726e87a685f882861c3f14d397e293a1a5f';
  // const index = 0;
  // const pendingTransactionsForUser = await contract.queuedPayments(
  //   userAddress,
  //   index
  // )
  // console.log('pendingTransactionsForUser', pendingTransactionsForUser)

  // // remove queued payments
  // const L1_PRIVATE_KEY = ''
  // const signer = new ethers.Wallet(
  //   L1_PRIVATE_KEY,
  //   provider
  // )
  // const tx = await contract.removePaymentFromQueue(
  //   index,
  //   signer
  // )
  
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
