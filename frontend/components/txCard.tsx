import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  Avatar,
  Image,
  CloseButton,
  Tooltip,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { CURRENCIES } from "../consts";

export const TXCard = ({
  id,
  recepientAddress,
  token,
  amount,
  onCloseClick,
}) => {
  return (
    <Card w="100%">
      <CardHeader>
        <Flex justifyContent="space-between">
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            {/* <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" /> */}

            <Box>
              <Heading size="sm">Phone no.</Heading>
              <Text
                maxWidth="200px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {recepientAddress}
              </Text>
            </Box>

            <Box>
              <Heading size="sm">Token</Heading>
              <Text>
                {BigNumber.from(amount)
                  .div(
                    BigNumber.from(10).pow(
                      BigNumber.from(CURRENCIES[token].decimal)
                    )
                  )
                  .toString()}{" "}
                {CURRENCIES[token].symbol}
              </Text>
            </Box>
          </Flex>

          <Tooltip label="Remove Transaction">
            <CloseButton onClick={() => onCloseClick(id)} />
          </Tooltip>

          {/* <IconButton
            variant="ghost"
            colorScheme="gray"
            aria-label="See menu"
            icon={<BsThreeDotsVertical />}
          /> */}
        </Flex>
      </CardHeader>
    </Card>
  );
};
