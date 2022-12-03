import { Heading, Text, VStack } from "@chakra-ui/react";

export const About = () => {
  return (
    <>
      <VStack mt={100}>
        <Heading id="about">About</Heading>
        <Text>Brings privacy first KYC into Blockchain using Polygon ID</Text>
      </VStack>

      <VStack alignItems="center" width="100%" mt={10}></VStack>
    </>
  );
};
