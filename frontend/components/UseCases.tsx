import { UseCaseCard } from "./Card";
import { Heading, VStack } from "@chakra-ui/react";

export const UseCases = () => {
  return (
    <>
      <VStack mt={100} mb="50px">
        <Heading id="use-cases">Use Cases</Heading>
        {/* <Text>Brings privacy first KYC into Blockchain using Polygon ID</Text> */}
      </VStack>

      <VStack spacing="30px">
        <UseCaseCard
          image=""
          title="Safe"
          description="A lot of people lose their private key and that’s game over for a DAO, we can possibly attach some data to an eth address that an eth address is Aadhaar verified & maybe somehow lower the risk of losing funds through 2FA using Aadhaar."
        />
        <UseCaseCard
          image=""
          title="Push"
          description="Do Chat Moderation by checking if the person is eAadhaar verified."
        />
        <UseCaseCard
          image=""
          title="SDK"
          description="A lot of people lose their private key and that’s game over for a DAO, we can possibly attach some data to an eth address that an eth address is Aadhaar verified & maybe somehow lower the risk of losing funds through 2FA using Aadhaar."
        />
      </VStack>
    </>
  );
};
