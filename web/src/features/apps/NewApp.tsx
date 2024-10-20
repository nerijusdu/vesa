import { Checkbox, FormLabel } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import FormSelect from '../../components/form/formSelect';
import { useDefaultMutation } from '../../hooks';
import { createApp, getApp } from './apps.api';
import { CreateAppRequest, createAppSchema } from './apps.types';


const NewNetwork: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(createApp, {
    action: params.id ? 'updating app' : 'creating app',
    successMessage: (res) => params.id ? 'App saved' : 'App created with ID: ' + res,
    onSuccess: () => navigate('/apps'),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateAppRequest>({
    resolver: zodResolver(createAppSchema),
    defaultValues: async () => {
      if (!params.id) {
        return {
          name: '',
          route: '',
          domain: { host: '', entrypoints: ['http'] },
        };
      }

      const app = await getApp(params.id);
      return app;
    },
  });
  const pathPrefix = watch('domain.pathPrefix');

  return (
    <FormContainer
      onSubmit={handleSubmit(data => mutate(data))}
      label={params.id ? 'Edit app' : 'New app'}
      buttonLabel="Save"
    >
      <FormInput
        label="Name"
        errors={errors}
        {...register('name')}
        placeholder="My App"
      />
      <FormInput
        label="Route to app"
        errors={errors}
        {...register('route')}
        placeholder="http://host.docker.internal:3000"
      />

      <FormLabel>Domain routing setup</FormLabel>
      <FormInput
        {...register('domain.host')}
        errors={errors}
        label="Domain"
        placeholder="example.com"
      />
      <FormInput
        {...register('domain.pathPrefix')}
        errors={errors}
        label="Path prefix (optional)"
        placeholder="/foo"
      />
      <Checkbox
        {...register('domain.stripPath')}
        isDisabled={!pathPrefix}
      >
        Rewrite path
      </Checkbox>

      <FormSelect
        {...register('domain.entrypoints.0')}
        errorField="entrypoint"
        errors={{
          ...errors,
          entrypoint: errors?.domain?.entrypoints?.[0]
            ? { message: 'Select an entrypoint' }
            : undefined as any,
        }}
        label="Entrypoint"
        data={[
          { name: 'http', value: 'web' },
          { name: 'https (with redirect http -> https)', value: 'websecure' },
        ]}
      />

    </FormContainer>
  );
};

export default NewNetwork;
