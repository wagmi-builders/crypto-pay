import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isAddress, isENSName } from "../utils/helpers";

type UseENS = {
  address?: string;
  name?: string;
  avatar?: string;
  loading?: boolean;
};

export const useENS = (addressOrEnsName: string): UseENS => {
  const isaddress = isAddress(addressOrEnsName);
  const isName = isENSName(addressOrEnsName);

  const { data: address, isLoading: addressLoading } = useEnsAddress({
    name: addressOrEnsName,
    chainId: 1,
  });

  const { data: avatar, isLoading: avatarLoading } = useEnsAvatar({
    // addressOrName: addressOrEnsName,
    address: addressOrEnsName,
    chainId: 1,
  });

  const { data: name, isLoading: nameLoading } = useEnsName({
    address: addressOrEnsName,
    chainId: 1,
  });

  return {
    address: isaddress ? addressOrEnsName : address?.toString(),
    name: isName ? addressOrEnsName : name?.toString(),
    avatar: avatar?.toString(),
    loading: addressLoading || avatarLoading || nameLoading,
  };
};
