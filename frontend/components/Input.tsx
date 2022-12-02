import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export const CustomInput = (props) => (
  <Input
    size="lg"
    placeholder="+11 0123456789"
    // bg="#FFF"
    focusBorderColor="#1D3557"
    errorBorderColor="#A83846"
    borderRadius="0"
    borderWidth={2}
    textColor="#1D3557"
    {...props}
  />
);

export const CustomFormLabel = (props) => (
  <FormLabel fontSize="sm" {...props} />
);

export const CustomFormControl = (props) => <FormControl {...props} />;
