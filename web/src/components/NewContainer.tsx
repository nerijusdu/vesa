import { Button, Checkbox, Divider, Flex, FormLabel, Heading, IconButton } from '@chakra-ui/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RunContainerRequest, runContainerSchema } from '../types';
import FormInput from './form/formInput';
import { getNetworks, runContainer } from '../api';
import { useDefaultMutation } from '../hooks';
import { DeleteIcon } from '@chakra-ui/icons';
import FormSelect from './form/formSelect';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const NewContainer: React.FC = () => {
  const { mutate } = useDefaultMutation(runContainer, {
    action: 'creating container',
    successMessage: (res) => 'Container created with ID: ' + res,
  });
  const { control, register, handleSubmit, formState: { errors } } = useForm<RunContainerRequest>({ 
    resolver: zodResolver(runContainerSchema),
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'ports' }); 
  const { data: networks } = useQuery(['networks'], getNetworks);

  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })) || [], 
    [networks]
  );

  return (
    <Flex 
      as="form" 
      onSubmit={handleSubmit(data => mutate({
        ...data,
        ports: (data.ports || []).map(x => x.value).filter(Boolean) as string[],
        networkName: data.networkId
          ? networks?.find(x => x.id === data.networkId)?.name
          : undefined,
      }))} 
      flexDir="column" 
      maxW="400px" 
      gap={2}
    >
      <Heading size="md">New Container</Heading>
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

      <Divider my={2} />

      <Button type="submit">
        Run
      </Button>
    </Flex>
  );
};

export default NewContainer;