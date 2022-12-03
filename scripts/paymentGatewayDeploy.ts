import { ethers, network, run } from "hardhat";

const main = async () => {

  const paymentGatewayContract = "PaymentGateway";

  const PaymentGateway = await ethers.getContractFactory(paymentGatewayContract);
  const paymentGateway = await PaymentGateway.deploy();
  await paymentGateway.deployed();

  console.log(`PaymentGateway deployed to ${paymentGateway.address}`);

  await run(`verify:verify`, {
    address: paymentGateway.address,
    constructorArguments: [],
  });
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
