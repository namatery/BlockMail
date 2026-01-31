import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlockMailModule", (m) => {
  const mail = m.contract("BlockMail");
  return { mail };
});