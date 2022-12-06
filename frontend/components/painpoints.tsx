import { Heading, Text, VStack } from "@chakra-ui/react";

export const PainPoints = () => {
  return (
    <>
      <VStack mt={150} alignContent="flex-start" justifyContent="flex-start">
        <Heading id="pain-points">Improvements</Heading>
        <Text>
          - rather than forcing the user to download XML file from another
          website, we should have single place to dom that and so having a
          better UX
        </Text>

        <Text>- Metamask flow is not convinient</Text>

        {/* <Text> */}
        {/* - Currently you have to upload this XML file which you get from a */}
        {/* another website, it is completely possible to skip this part. */}
        {/* </Text> */}
      </VStack>

      <VStack alignItems="center" width="100%" mt={10}></VStack>
    </>
  );
};
