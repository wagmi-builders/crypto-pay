import { Text, VStack } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <>
      <VStack mt={150} pb={100}>
        <Text>
          Build by{" "}
          <b>
            <a target="_blank" href="https://denosaurabh.me" rel="noreferrer">
              @denosaurabh
            </a>
          </b>{" "}
          and
          <b>
            <a
              target="_blank"
              href="https://github.com/0xSachinK"
              rel="noreferrer"
            >
              {" "}
              0xSachinK
            </a>
          </b>
        </Text>
      </VStack>
    </>
  );
};
