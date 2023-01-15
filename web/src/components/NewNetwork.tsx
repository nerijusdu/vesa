import { Button, Flex, Heading } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createNetwork } from '../api';
import { useDefaultMutation } from '../hooks';
import { CreateNetworkRequest, createNetworkScheme } from '../types';
import FormInput from './form/formInput';

const NewNetwork: React.FC = () => {
  const { mutate } = useDefaultMutation(createNetwork, {
    action: 'creating network',
    successMessage: (res) => 'Network created with ID: ' + res,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateNetworkRequest>({
    resolver: zodResolver(createNetworkScheme),
  });

  return (
    <Flex
      as="form"
      onSubmit={handleSubmit(data => mutate(data))}
      flexDir="column"
      maxW="400px"
      gap={2}
    >
      <Heading size="md">New Network</Heading>

      <FormInput
        {...register('name')}
        errors={errors}
        label="Name"
        placeholder="my network"
      />
      <FormInput
        {...register('driver')}
        errors={errors}
        label="Driver"
        placeholder="bridge"
      />
      
      <Button type="submit">Create</Button>
    </Flex>
  );
};

export default NewNetwork;