import { UseCaseCard } from "./Card";
import { Heading, VStack } from "@chakra-ui/react";

export const UseCases = () => {
  return (
    <>
      <VStack mt={150} mb="50px">
        <Heading id="use-cases">Use Cases & Ideas</Heading>
      </VStack>

      <VStack spacing="30px">
        <UseCaseCard
          image=""
          title="Safe prev. Gnosis Safe"
          description="
          Stop the vote to get signed & executed by a user until he get 2FA by eAadhaar using Polygon ID.
          So even if the user has comprised the private key, the hacker won't be able to sign until he get's 2FA."
        />
        <UseCaseCard
          image=""
          title="Push"
          description="Do Chat Moderation by checking if the person is eAadhaar verif ied. Also possibly to open channels & chats for only Indian verif ied people."
        />
        <UseCaseCard
          image=""
          title="SDK"
          description="
          Publish an on-chain & off-chain database to store which identities has been verified, and share across all major blockchain systems 
          "
        />
      </VStack>
    </>
  );
};
