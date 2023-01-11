import { Textarea, TextareaProps, forwardRef } from '@chakra-ui/react';
import FormFieldWrapper, { FormFieldWrapperProps } from './formFieldWrapper';

export type FormTextareaProps = TextareaProps & FormFieldWrapperProps;

const FormTextarea = forwardRef<FormTextareaProps, 'textarea'>(({
  label,
  containerProps = {},
  errors,
  name,
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
    >
      <Textarea data-cy={`form-input-${name}`} {...inputProps} name={name} ref={ref} />
    </FormFieldWrapper>
  );
});

export default FormTextarea;
