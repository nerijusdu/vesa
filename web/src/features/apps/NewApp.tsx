import { Button, Checkbox, Flex, FormLabel, IconButton } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import FormSelect from '../../components/form/formSelect';
import { useDefaultMutation } from '../../hooks';
import { createApp, getApp } from './apps.api';
import { CreateAppRequest, createAppSchema } from './apps.types';
import { DeleteIcon } from '@chakra-ui/icons';
import { TraefikFields } from '../containers/ContainerForm';


const NewApp: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(createApp, {
    action: params.id ? 'updating app' : 'creating app',
    successMessage: (res) => params.id ? 'App saved' : 'App created with ID: ' + res,
    onSuccess: () => navigate('/apps'),
  });

  const form = useForm<CreateAppRequest>({
    resolver: zodResolver(createAppSchema),
    defaultValues: async () => {
      if (!params.id) {
        return {
          name: '',
          route: '',
          domain: { host: '', entrypoints: ['http'], pathPrefixes: [] },
        };
      }

      const app = await getApp(params.id);
      return {
        ...app,
        domain: {
          ...app.domain,
          pathPrefixes: app.domain.pathPrefixes?.map(x => ({ value: x })) || [],
        },
      };
    },
  });
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(data => mutate({
          ...data,
          domain: {
            ...data.domain,
            pathPrefixes: data.domain.pathPrefixes
              ?.map(x => x.value?.trim())
              .filter(Boolean),
          },
        }))}
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

        <TraefikFields />
      </FormContainer>
    </FormProvider>
  );
};

export default NewApp;
