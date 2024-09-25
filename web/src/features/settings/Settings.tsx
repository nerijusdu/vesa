import { CheckCircleIcon, CopyIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { Button, Divider, Flex, Heading, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/form/formInput';
import { useDefaultMutation, useDefaultToast } from '../../hooks';
import { deleteClient, getAuths, getClients, saveAuth, saveClient } from './settings.api';
import { AuthRequest, ClientRequest } from './settings.models';

const Settings = () => {
  const { data: auths } = useQuery(['auths'], getAuths);
  const { data: clients } = useQuery(['clients'], getClients);
  const { mutate: removeClient } = useDefaultMutation(deleteClient, {
    invalidateQueries: ['clients'],
    action: 'deleting client',
  })

  return (
    <Flex flexDir="column" gap={4}>
      <Heading size="sm">Registry authentication</Heading>
      <p>Manage authentication for Docker registries</p>
      {auths?.map(a => (
        <Flex key={a.serverAddress} gap={2} align="center">
          {a.serverAddress}
          <CheckCircleIcon color="green.500" />
        </Flex>
      ))}
      <AddAuth />

      <Divider />

      <Heading size="sm">Client authentication</Heading>
      <p>Manage API keys for external clients</p>
      {clients?.map(c => (
        <Flex key={c} gap={2} align="center">
          {c}
          <IconButton
            aria-label="Delete"
            icon={<DeleteIcon />}
            variant="ghost"
            onClick={() => confirm('Are you sure?') && removeClient(c)}
          />
        </Flex>
      ))}
      <AddClient />
    </Flex>
  );
};

const AddClient = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const { register, reset, setValue, getValues, formState: { errors }, handleSubmit } = useForm<ClientRequest>();
  const toast = useDefaultToast();

  const { mutate } = useDefaultMutation(saveClient, {
    invalidateQueries: ['clients'],
    action: 'creating client',
    onSuccess: () => {
      setFormVisible(false);
      reset();
    },
  });

  const onClick = () => {
    if (!isFormVisible) {
      setFormVisible(true);
      generateSecret();
      return;
    }
  };

  const generateSecret = () => {
    const newSecret = Math.random().toString(36).substring(2)
      + Math.random().toString(36).substring(2);
    setValue('clientSecret', newSecret);
  };

  return (
    <Flex
      as="form"
      onSubmit={handleSubmit(x => mutate(x))}
      flexDir="column"
      gap={2}
      maxW="500px"
    >
      {isFormVisible && (
        <>
          <FormInput
            {...register('clientId')}
            errors={errors}
            label="Client ID"
            placeholder="github"
          />
          <Flex align="flex-end" gap={1}>
            <FormInput
              {...register('clientSecret')}
              errors={errors}
              label="API secret"
              helperText="Copy it now as it won't be shown again"
              disabled
            />
            <IconButton
              aria-label="Copy"
              icon={<CopyIcon />}
              mb={8}
              variant="outline"
              onClick={() => {
                const { clientSecret } = getValues();
                window.navigator.clipboard.writeText(clientSecret);
                toast({
                  title: 'API secret copied to clipboard',
                  status: 'success',
                });
              }}
            />
            <IconButton
              aria-label="Regenerate secret"
              icon={<RepeatIcon />}
              mb={8}
              variant="outline"
              onClick={generateSecret}
            />
          </Flex>
          <Button type="submit">
            Add client
          </Button>
        </>
      )}

      {!isFormVisible && (
        <Button
          type="button"
          variant="outline"
          onClick={onClick}
        >
          Add client
        </Button>
      )}
    </Flex>
  )
}

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
      maxW="500px"
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
