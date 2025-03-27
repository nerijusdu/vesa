import { FormControl, FormControlProps, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export type FormFieldWrapperProps = {
  label?: string;
  name: string;
  errorField?: string;
  containerProps?: FormControlProps;
  errors?: {
    [key: string]: {
      message?: string;
      type?: string;
    }
  };
  helperText?: string;
  alignLabel?: 'right' | 'left' | 'inherit' | '-moz-initial' | 'initial' | 'revert' | 'unset' | 'center' | 'end' | 'justify' | 'match-parent' | 'start';
  required?: boolean;
}

const errorMessages: Record<string, string> = {
  'required': 'This field is required',
};

const getNestedError = (name: string, errors: any): any => {
  return name.split('.').reduce((acc, part) => acc && acc[part], errors);
};

const FormFieldWrapper: React.FC<PropsWithChildren<FormFieldWrapperProps>> = ({
  label,
  containerProps = {},
  errors,
  name,
  errorField,
  helperText,
  alignLabel,
  children,
  required,
}) => {
  const isInvalid = Boolean(name && errors && getNestedError(errorField || name, errors));
  const error = getNestedError(errorField || name, errors);
  const errorMsg = error?.message || errorMessages[error?.type ?? ''];

  return (
    <FormControl isRequired={required} {...containerProps} isInvalid={isInvalid} pb={2}>
      {label && <FormLabel textAlign={alignLabel}>{label}</FormLabel>}
      {children}
      {isInvalid && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormFieldWrapper;
