import { Input, InputProps, forwardRef } from '@chakra-ui/react';
import FormFieldWrapper, { FormFieldWrapperProps } from './formFieldWrapper';

export type FormInputProps = InputProps & FormFieldWrapperProps;

const FormInput = forwardRef<FormInputProps, 'input'>(({
  label,
  containerProps = {},
  errors,
  name,
  errorField,
  helperText,
  alignLabel,
  ...inputProps
}, ref) => {

  return (
    <FormFieldWrapper
      label={label}
      containerProps={containerProps}
      name={name}
      errors={errors}
      helperText={helperText}
      alignLabel={alignLabel}
      errorField={errorField}
    >
      <Input data-cy={`form-input-${name}`} {...inputProps} name={name} ref={ref} />
    </FormFieldWrapper>
  );
});

export default FormInput;
