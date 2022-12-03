import { ethers } from "ethers";

export const isAddress = (address: string): boolean => {
  try {
    ethers.utils.getAddress(address);
  } catch (error) {
    return false;
  }
  return true;
};

export const isENSName = (name: string): boolean => {
  const isEnsName = name.endsWith(".eth");
  return isEnsName;
};

export const isLensHandle = (name: string): boolean => {
  const isEnsName = name.trimEnd().endsWith(".lens");
  return isEnsName;
};
