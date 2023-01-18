import { Button, Checkbox, Divider, Flex, FormLabel, IconButton } from '@chakra-ui/react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RunContainerRequest, runContainerSchema } from '../types';
import FormInput from './form/formInput';
import { getNetworks, runContainer } from '../api';
import { useDefaultMutation } from '../hooks';
import { DeleteIcon } from '@chakra-ui/icons';
import FormSelect from './form/formSelect';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import FormContainer from './form/formContainer';

const NewContainer: React.FC = () => {
  const { mutate } = useDefaultMutation(runContainer, {
    action: 'creating container',
    successMessage: (res) => 'Container created with ID: ' + res,
  });
  const form = useForm<RunContainerRequest>({ resolver: zodResolver(runContainerSchema) });
  const { register, handleSubmit, formState: { errors } } = form;
  const { data: networks } = useQuery(['networks'], getNetworks);

  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })) || [], 
    [networks]
  );

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(({ envVars, ports, ...data }) => mutate({
          ...data,
          ports: (ports || []).map(x => x.value).filter(Boolean) as string[],
          envVars: (envVars || []).map(x => `${x.key}=${x.value}`).filter(Boolean) as string[],
          networkName: data.networkId
            ? networks?.find(x => x.id === data.networkId)?.name
            : undefined,
        }))} 
        label="New Container"
        buttonLabel="Run"
      >
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

        <PortFields />

        <MountFields />

        <EnvVarFields />

        <Divider my={2} />

      </FormContainer>
    </FormProvider>
  );
};

const PortFields: React.FC = () => {
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

const MountFields: React.FC = () => {
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

      <Button variant="outline" onClick={() => append({ type: 'bind', source: '', target: '' })}>
        Add mount
      </Button>
    </>
  );
};

const EnvVarFields: React.FC = () => {
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

export default NewContainer;