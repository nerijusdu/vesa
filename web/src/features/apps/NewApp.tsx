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

        <FormLabel>Domain routing setup</FormLabel>
        <FormInput
          {...register('domain.host')}
          errors={errors}
          label="Domain"
          placeholder="example.com"
        />

        <PathPrefixFields />

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
    </FormProvider>
  );
};

const PathPrefixFields: React.FC = () => {
  const { formState: { errors }, control, register } = useFormContext<CreateAppRequest>();
  const { fields, append, remove } = useFieldArray({
    control, name: 'domain.pathPrefixes',
  });

  return (
    <>
      <FormLabel>Path prefix (optional)</FormLabel>
      {fields.map((f, i) => (
        <Flex key={f.id} gap={2}>
          <FormInput
            {...register(`domain.pathPrefixes.${i}.value` as const)}
            errors={errors}
            placeholder="/foo"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove prefix'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ value: '' })}>
        Add prefix
      </Button>


      <Controller
        control={control}
        name='domain.stripPath'
        render={({ field: { onChange, value, ref } }) => (
          <Checkbox
            onChange={onChange}
            ref={ref}
            isChecked={value}
            isDisabled={!fields.length}
          >
            Rewrite path
          </Checkbox>
        )}
      />
    </>
  );
};



export default NewApp;
