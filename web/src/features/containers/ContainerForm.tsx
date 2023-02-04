import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Checkbox, Divider, Flex, FormLabel, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FormInput from '../../components/form/formInput';
import FormSelect, { NamedValue } from '../../components/form/formSelect';
import { RunContainerRequest } from './containers.types';

const restartPolicies = [
  { name: 'No', value: 'no' },
  { name: 'On failure', value: 'on-failure' },
  { name: 'Always', value: 'always' },
  { name: 'Unless stopped', value: 'unless-stopped' },
];

export type ContainerFieldsProps = {
  networkOptions: NamedValue<string>[];
  hideTemplateCheckbox?: boolean;
}

const ContainerFields: React.FC<ContainerFieldsProps> = ({ networkOptions, hideTemplateCheckbox }) => {
  const [showRetryCount, setShowRetryCount] = useState(false);
  const { register, formState: { errors } } = useFormContext<RunContainerRequest>();

  return (
    <>
      <FormInput
        {...register('image')}
        errors={errors}
        label="Image"
        placeholder="postgres:latest"
        required
      />
      <Checkbox {...register('isLocal')}>
          Local image
      </Checkbox>
      <FormInput
        {...register('name')}
        errors={errors}
        label="Name"
        placeholder="postgres instance"
      />
      <FormSelect
        {...register('networkId')}
        data={networkOptions}
        errors={errors}
        label="Network"
        placeholder="Select network (optional)"
      />

      <FormSelect
        {...register('restartPolicy.name', {
          onChange: e => {
            setShowRetryCount(e.target.value === 'on-failure');
          },
        })}
        label="Restart policy"
        data={restartPolicies}
        errors={errors}
      />

      {showRetryCount && (
        <FormInput
          {...register('restartPolicy.maximumRetryCount')}
          label="Retry count"
          errors={errors}
          placeholder="5"
        />
      )}

      <PortFields />

      <MountFields />

      <EnvVarFields />

      {!hideTemplateCheckbox && (
        <Checkbox {...register('saveAsTemplate')}>
          Save as a template
        </Checkbox>
      )}

      <Divider my={2} />
    </>
  );
};

export const PortFields: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'ports' }); 

  return (
    <>
      <FormLabel>Ports</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormInput
            {...register(`ports.${i}.value` as const)}
            errors={errors}
            placeholder="5432:5432"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Port'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
          />
        </Flex>
      ))}
        
      <Button variant="outline" onClick={() => append({ value: '' })}>
          Assign port
      </Button>
    </>
  );
};

export const MountFields: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'mounts' });

  return (
    <>
      <FormLabel>Mounts</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormInput
            {...register(`mounts.${i}.source` as const)}
            errors={errors}
            label="Source"
            placeholder="/path/to/host"
          />
          <FormInput
            {...register(`mounts.${i}.target` as const)}
            errors={errors}
            label="Target"
            placeholder="/path/to/container"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Mount'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
            alignSelf="flex-end"
            mb={2}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ type: 'volume', source: '', target: '' })}>
        Add mount
      </Button>
    </>
  );
};

export const EnvVarFields: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'envVars' });

  return (
    <>
      <FormLabel>Environment Variables</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormInput
            {...register(`envVars.${i}.key` as const)}
            errors={errors}
            label="Key"
            placeholder="POSTGRES_PASSWORD"
          />
          <FormInput
            {...register(`envVars.${i}.value` as const)}
            errors={errors}
            label="Value"
            placeholder="password"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Environment Variable'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
            alignSelf="flex-end"
            mb={2}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ key: '', value: '' })}>
        Add environment variable
      </Button>
    </>
  );
};

export default ContainerFields;
