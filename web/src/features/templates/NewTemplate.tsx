import { Checkbox, Divider } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import FormSelect from '../../components/form/formSelect';
import { useDefaultMutation } from '../../hooks';
import { RunContainerRequest, runContainerSchema } from '../containers/containers.types';
import { EnvVarFields, MountFields, PortFields } from '../containers/NewContainer';
import { getNetworks } from '../networks/networks.api';
import { getTemplate, saveTemplate } from './templates.api';

const restartPolicies = [
  { name: 'No', value: 'no' },
  { name: 'On failure', value: 'on-failure' },
  { name: 'Always', value: 'always' },
  { name: 'Unless stopped', value: 'unless-stopped' },
];

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
        ports: t.container.ports.map(value => ({ value })),
        envVars: t.container.envVars.map(x => {
          const splits = x.split('=');
          return { key: splits[0], value: splits[1] };
        }),
        restartPolicy: {
          name: t.container.restartPolicy.name || 'no',
          maximumRetryCount: t.container.restartPolicy.maximumRetryCount,
        },
      };
    },

  });
  const { register, handleSubmit, formState: { errors } } = form;
  const { data: networks } = useQuery(['networks'], getNetworks);
  const [showRetryCount, setShowRetryCount] = useState(false);

  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })) || [], 
    [networks]
  );

  // TODO: move out container form and reuse here
  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(({ envVars, ports, ...data }) => mutate({
          id: params.id,
          container: {
            ...data,
            ports: (ports || []).map(x => x.value).filter(Boolean) as string[],
            envVars: (envVars || []).map(x => `${x.key}=${x.value}`).filter(Boolean) as string[],
            networkName: data.networkId
              ? networks?.find(x => x.id === data.networkId)?.name
              : undefined,
          },
        }))} 
        label={params.id ? 'Edit template' : 'New template'}
        buttonLabel="Save"
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

        <Divider my={2} />

      </FormContainer>
    </FormProvider>
  );
};

export default NewTemplate;
