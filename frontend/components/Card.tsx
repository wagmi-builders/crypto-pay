import { Card, CardBody, Heading, Text, Stack, Image } from "@chakra-ui/react";

export const UseCaseCard = ({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) => {
  return (
    <Card maxW="sm">
      <CardBody>
        <Image src={image} alt="" borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">{title}</Heading>
          <Text>{description}</Text>
          {/* <Text color="blue.600" fontSize="2xl"> */}
          {/* $450 */}
          {/* </Text> */}
        </Stack>
      </CardBody>
    </Card>
  );
};
