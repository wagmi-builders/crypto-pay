import { HStack, Text } from "@chakra-ui/react";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

export const Header = () => {
  return (
    <>
      <Alert status="warning" mt="20px">
        <AlertIcon />
        {/* <AlertTitle>Warning</AlertTitle> */}
        <AlertDescription>
          This project is a test so do NOT upload any private information
        </AlertDescription>
      </Alert>

      <HStack mt={5} mb="40px" spacing={10} justifyContent="center">
        <Text
          fontWeight={500}
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => {
            document.querySelector("#claim")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          Claim
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => {
            document.querySelector("#who-verified")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          Verify
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => {
            document.querySelector("#send")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          Send Crypto
        </Text>
        <Text
          // href="/#about"
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => {
            document.querySelector("#about")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          About
        </Text>

        {/* <Link href="/about">Send</Link> */}
      </HStack>
    </>
  );
};
