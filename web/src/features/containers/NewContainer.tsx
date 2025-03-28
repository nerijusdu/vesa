import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import { useDefaultMutation } from '../../hooks';
import { getNetworks } from '../networks/networks.api';
import ContainerFields from './ContainerForm';
import { runContainer } from './containers.api';
import { mapContainerToApiRequest } from './containers.helpers';
import { RunContainerRequest, runContainerSchema } from './containers.types';

const NewContainer: React.FC = () => {
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(runContainer, {
    action: 'creating container',
    successMessage: (res) => 'Container created with ID: ' + res,
    onSuccess: () => navigate('/containers'),
  });
  const form = useForm<RunContainerRequest>({ resolver: zodResolver(runContainerSchema) });
  const { data: networks } = useQuery(['networks'], getNetworks);
  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })),
    [networks]
  );

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={form.handleSubmit(x => mutate(mapContainerToApiRequest(x, networks)))}
        label="New Container"
        buttonLabel="Run"
      >
        <ContainerFields networkOptions={networkOptions} />
      </FormContainer>
    </FormProvider>
  );
};

export default NewContainer;
