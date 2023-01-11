import { Button, Flex, Heading } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RunContainerRequest, runContainerSchema } from '../types';
import FormInput from './form/formInput';
import { useMutation } from '@tanstack/react-query';
import { runContainer } from '../api';

const NewContainer: React.FC = () => {
  const { mutate } = useMutation(runContainer); 
  const { register, handleSubmit, formState: { errors } } = useForm<RunContainerRequest>({ resolver: zodResolver(runContainerSchema) });

  return (
    <Flex 
      as="form" 
      onSubmit={handleSubmit(data => mutate(data))} 
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
      <Button colorScheme="purple" type="submit">
        Run
      </Button>
    </Flex>
  );
};

export default NewContainer;