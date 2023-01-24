import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, Button, Divider, Flex } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import FormSelect from '../../components/form/formSelect';
import { useDefaultMutation } from '../../hooks';
import { getContainers } from '../containers/containers.api';
import { getNetworks } from '../networks/networks.api';
import { getProject, saveProject } from './projects.api';
import { SaveProjectRequest, saveProjectSchema } from './projects.types';

const NewNetwork: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(saveProject, {
    action: params.id ? 'updating project' : 'creating project',
    successMessage: (res) => params.id ? 'Project saved' : 'Project created with ID: ' + res,
    onSuccess: () => navigate('/projects'),
  });

  const form = useForm<SaveProjectRequest>({ 
    resolver: zodResolver(saveProjectSchema), 
    defaultValues: async () => {
      if (!params.id) {
        return { containers: [], name: '' };
      }

      const proj = await getProject(params.id);
      return {
        ...proj,
        containers: proj.containers.map(x => ({ id: x })),
      };
    },
  });
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(data => mutate({
          ...data,
          containers: data.containers.map(c => c.id),
        }))}
        label={params.id ? 'Edit project' : 'New project'}
        buttonLabel="Save"
      >
        <FormInput
          {...register('name')}
          errors={errors}
          label="Name"
          placeholder="my project"
        />

        <ContainerSelect />

        <NetworkSelect />

        <Divider my={2} />
      </FormContainer>
    </FormProvider>
  );
};

const ContainerSelect: React.FC = () => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'containers',
  });
  const { data: containers } = useQuery(
    ['containersOptions'], 
    () => getContainers().then(res => res.map(x => ({ value: x.id, name: x.names[0]?.replace('/', '') })))
  );

  return (
    <>
      {fields.map((field, index) => (
        <Flex key={field.id} gap={2}>
          <FormSelect
            {...register(`containers.${index}.id` as const)}
            data={containers || []}
            label="Container"
          />
          <IconButton
            aria-label="Remove"
            icon={<DeleteIcon />}
            colorScheme="red"
            onClick={() => remove(index)}
            alignSelf="flex-end"
            mb={2}
          />
        </Flex>
      ))}
      <Button variant="outline" onClick={() => append({ id: '' })}>
        Add container
      </Button>
    </>
  );
};

const NetworkSelect: React.FC = () => {
  const [isNew, setIsNew] = useState(false);
  const { register, setValue } = useFormContext<SaveProjectRequest>();
  const { data: networks } = useQuery(
    ['networksOptions'],
    () => getNetworks().then(res => res.map(x => ({ value: x.id, name: x.name })))
  );

  return (
    <Flex flexDir="column">
      {isNew && (
        <FormInput
          {...register('networkName')}
          label="Network"
          placeholder="New network name"
        />
      )}
      {!isNew && (
        <FormSelect
          {...register('networkId')}
          data={networks || []}
          label="Network"
        />
      )}
      <Button variant="outline" onClick={() => {
        if (isNew) setValue('networkName', '');
        else setValue('networkId', '');
        
        setIsNew(!isNew);
      }}>
        {isNew ? 'Or select an existing network' : 'Or create a new network'}
      </Button>
    </Flex>
  );
};

export default NewNetwork;