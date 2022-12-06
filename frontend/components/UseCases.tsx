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
          title="2FA Wallet"
          description="
          The above flow can be generalized to work with all types of transactions. We would have to add support for
          passing in Generic calldata which will be executed upon aadhar verification. This would work very well with
          Account abstraction as well."
        />
        <UseCaseCard
          image=""
          title="Finance applications"
          description="Once we have identity on-chain we can build more complex financial instruments like credit scores,
          undercollateralizd lending, send salaries on-chain, easier automated taxation etc.
          "
        />
        <UseCaseCard
          image=""
          title="Age Proofs"
          description="We can issue age proofs claims using Aadhar in a permissionless manner. We often hear age proofs
          as a primary example of ZK proofs and this flow along with Aadhaar finally makes it productionizable. Age proofs 
          can be used in DAOs and Defi.
          "
        />
        <UseCaseCard
          image=""
          title="Gated communities"
          description="
          Similar to token gated dapps, we can build claim gated dapps where the user can join the community only if
          the user has a verified aadhar claim in their Polygon ID wallet. For example, India DAO for all Indians
          building in Web3.
          "
        />
      </VStack>
    </>
  );
};


// use meme in presentation.
// immediate usecase
// simple and easy to understand
// web2 flow (understandable flow)
// don't clutter, no bellls and whitsles.
// take a complex protocol and make it easier to use (like gnosis safe, and maker and compound etc.)