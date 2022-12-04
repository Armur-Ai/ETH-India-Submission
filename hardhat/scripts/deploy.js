// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  let freelance = await hre.ethers.getContractFactory("NFTFreelance");
  freelance = await freelance.deploy("0x54fc29154Dc49D36d58A18A8fD035182EB3BB3a1");

  await freelance.deployed();

  console.log(
    ` deployed to ${freelance.address}`
  );

  await sleep(120);

  await hre.run("verify:verify", {
    address: freelance.address,
    constructorArguments: [
      "0x54fc29154Dc49D36d58A18A8fD035182EB3BB3a1",
    ],
  });
}

function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
