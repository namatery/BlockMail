import { network } from "hardhat";
import { syncToShared } from "./sync-shared.js";

async function main() {
  const { ethers } = await network.connect();

  const mailbox = await ethers.deployContract("BlockMail");
  await mailbox.waitForDeployment();

  const address = await mailbox.getAddress();
  const { chainId } = await ethers.provider.getNetwork();

  console.log("BlockMail deployed to:", address, "chainId:", chainId.toString());

  await syncToShared({
    chainId: Number(chainId),
    mailboxAddress: address,
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
