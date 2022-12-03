import { HStack, Text } from "@chakra-ui/react";

export const Header = () => {
  return (
    <HStack mt={10} mb="80px" spacing={10}>
      <Text
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
  );
};
