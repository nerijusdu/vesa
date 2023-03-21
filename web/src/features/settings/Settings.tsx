import { CheckCircleIcon } from '@chakra-ui/icons';
import { Button, Divider, Flex, Heading } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/form/formInput';
import { useDefaultMutation } from '../../hooks';
import { getAuths, saveAuth } from './settings.api';
import { AuthRequest } from './settings.models';

const Settings = () => {
  const { data: auths } = useQuery(['auths'], getAuths);

  return (
    <Flex flexDir="column" gap={4}>
      <Heading size="sm">Registry authentication</Heading>
      {auths?.map(a => (
        <Flex key={a.serverAddress} gap={2} align="center">
          {a.serverAddress}
          <CheckCircleIcon color="green.500"/>
        </Flex>
      ))}
      <AddAuth />

      <Divider />
    </Flex>
  );
};

const AddAuth = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const { register, reset, formState: { errors }, handleSubmit } = useForm<AuthRequest>();
  const { mutate } = useDefaultMutation(saveAuth, {
    invalidateQueries: ['auths'],
    action: 'authenticating',
    onSuccess: () => {
      setFormVisible(false);
      reset();
    },
  });

  const onClick = () => {
    if (!isFormVisible) {
      setFormVisible(true);
      return;
    }
  };

  return (
    <Flex
      as="form"
      onSubmit={handleSubmit(x => mutate(x))}
      flexDir="column" 
      gap={2} 
      maxW="300px"
    >
      {isFormVisible && (
        <>
          <FormInput
            {...register('username')}
            errors={errors}
            label="Username"
            placeholder="username"
          />
          <FormInput
            {...register('password')}
            errors={errors}
            label="Password"
            type="password"
            placeholder="********"
          />
          <FormInput
            {...register('serverAddress')}
            errors={errors}
            label="Server address"
            placeholder="registry.example.com"
          />
          <Button type="submit">
            Add authentication
          </Button>
        </>
      )}

      {!isFormVisible && (
        <Button
          type="button"
          variant="outline"
          onClick={onClick}
        >
        Add authentication
        </Button>
      )}
    </Flex>
  );
};

export default Settings;
