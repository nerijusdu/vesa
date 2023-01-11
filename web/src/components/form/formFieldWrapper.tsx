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
}

const errorMessages: Record<string, string> = {
  'required': 'This field is required',
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
}) => {
  const isInvalid = Boolean(name && errors && errors[errorField || name]);
  const error = errors?.[errorField || name];
  const errorMsg = error?.message || errorMessages[error?.type ?? ''];

  return (
    <FormControl {...containerProps} isInvalid={isInvalid} pb={2}>
      {label && <FormLabel textAlign={alignLabel}>{label}</FormLabel>}
      {children}
      {isInvalid && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormFieldWrapper;
