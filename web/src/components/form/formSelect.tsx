import { Select, SelectProps, forwardRef } from '@chakra-ui/react';
import FormFieldWrapper, { FormFieldWrapperProps } from './formFieldWrapper';

export type NamedValue<TVal = string> = {
  name: string;
  value: TVal;
}

export type FormSelectProps = SelectProps & FormFieldWrapperProps & {
  data: NamedValue<string | number | undefined>[];
}

const FormSelect = forwardRef<FormSelectProps, 'select'>(({
  label,
  containerProps = {},
  errors,
  name,
  helperText,
  alignLabel,
  data,
  errorField,
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
      <Select
        data-cy={`form-select-${name}`}
        {...inputProps}
        defaultValue={inputProps.value}
        name={name}
        label={label}
        ref={ref}
        bg="#1a202c"
      >
        {data.map(x => <option value={x.value} key={x.value}>{x.name}</option>)}
      </Select>
    </FormFieldWrapper>
  );
});

export default FormSelect;
