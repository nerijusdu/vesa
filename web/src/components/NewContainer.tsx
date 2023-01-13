import { Button, Divider, Flex, FormLabel, Heading, IconButton } from '@chakra-ui/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RunContainerRequest, runContainerSchema } from '../types';
import FormInput from './form/formInput';
import { useMutation } from '@tanstack/react-query';
import { runContainer } from '../api';
import { useDefaultToast } from '../hooks';
import { DeleteIcon } from '@chakra-ui/icons';

const NewContainer: React.FC = () => {
  const toast = useDefaultToast();
  const { mutate } = useMutation(runContainer, {
    onSuccess: (res) => {
      toast({
        title: 'Container created with ID: ' + res,
        status: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Error creating container',
        description: err.message,
        status: 'error',
      });
    },
  }); 
  const { control, register, handleSubmit, formState: { errors } } = useForm<RunContainerRequest>({ 
    resolver: zodResolver(runContainerSchema),
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'ports' }); 

  return (
    <Flex 
      as="form" 
      onSubmit={handleSubmit(data => mutate({
        ...data,
        ports: (data.ports || []).map(x => x.value).filter(Boolean) as string[],
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
      <FormInput
        {...register('name')}
        errors={errors}
        label="Name"
        placeholder="postgres instance"
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