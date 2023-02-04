import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import { useDefaultMutation } from '../../hooks';
import ContainerFields from '../containers/ContainerForm';
import { mapContainerToApiRequest } from '../containers/containers.helpers';
import { RunContainerRequest, runContainerSchema } from '../containers/containers.types';
import { getNetworks } from '../networks/networks.api';
import { getTemplate, saveTemplate } from './templates.api';

const NewTemplate: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { mutate } = useDefaultMutation(saveTemplate, {
    action: 'creating template',
    successMessage: (res) => 'Template saved with ID: ' + res,
    onSuccess: (res) => navigate(`/templates/${res}`),
  });
  const form = useForm<RunContainerRequest>({ 
    resolver: zodResolver(runContainerSchema),
    defaultValues: async () => {
      if (!params.id) {
        return { 
          image: '', 
          ports: [], 
          mounts: [], 
          envVars: [], 
          restartPolicy: { name: 'no' }, 
        };
      }

      const t = await getTemplate(params.id);
      return {
        ...t.container,
        ports: t.container.ports?.map(value => ({ value })) || [],
        envVars: t.container.envVars?.map(x => {
          const splits = x.split('=');
          return { key: splits[0], value: splits[1] };
        }) || [],
        restartPolicy: {
          name: t.container.restartPolicy.name || 'no',
          maximumRetryCount: t.container.restartPolicy.maximumRetryCount,
        },
      };
    },

  });
  const { data: networks } = useQuery(['networks'], getNetworks);

  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })) || [], 
    [networks]
  );

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={form.handleSubmit(x => mutate({
          id: params.id,
          container: mapContainerToApiRequest(x, networks),
        }))} 
        label={params.id ? 'Edit template' : 'New template'}
        buttonLabel="Save"
      >
        <ContainerFields
          networkOptions={networkOptions}
          hideTemplateCheckbox
        />
      </FormContainer>
    </FormProvider>
  );
};

export default NewTemplate;
