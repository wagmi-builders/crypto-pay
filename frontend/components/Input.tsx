import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export const CustomInput = (props) => (
  <Input
    size="lg"
    placeholder="--"
    focusBorderColor="orange"
    borderWidth={2}
    textColor="#1D3557"
    {...props}
  />
);

export const CustomFormLabel = (props) => (
  <FormLabel fontSize="sm" {...props} />
);

export const CustomFormControl = (props) => <FormControl {...props} />;
