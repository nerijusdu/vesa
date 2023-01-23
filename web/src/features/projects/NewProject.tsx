import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, Button, Divider, Flex } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import FormSelect from '../../components/form/formSelect';
import { useDefaultMutation } from '../../hooks';
import { getContainers } from '../containers/containers.api';
import { saveProject } from './projects.api';
import { SaveProjectRequest, saveProjectSchema } from './projects.types';

const NewNetwork: React.FC = () => {
  const { mutate } = useDefaultMutation(saveProject, {
    action: 'creating project',
    successMessage: (res) => 'Project created with ID: ' + res,
  });

  const form = useForm<SaveProjectRequest>({ resolver: zodResolver(saveProjectSchema) });
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(data => mutate({
          ...data,
          containers: data.containers.map(c => c.id),
        }))}
        label="New Project"
        buttonLabel="Create"
      >
        <FormInput
          {...register('name')}
          errors={errors}
          label="Name"
          placeholder="my project"
        />

        <ContainerSelect />

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

export default NewNetwork;