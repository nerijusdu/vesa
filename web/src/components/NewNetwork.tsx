import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createNetwork } from '../api';
import { useDefaultMutation } from '../hooks';
import { CreateNetworkRequest, createNetworkScheme } from '../types';
import FormContainer from './form/formContainer';
import FormInput from './form/formInput';

const NewNetwork: React.FC = () => {
  const { mutate } = useDefaultMutation(createNetwork, {
    action: 'creating network',
    successMessage: (res) => 'Network created with ID: ' + res,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateNetworkRequest>({
    resolver: zodResolver(createNetworkScheme),
  });

  return (
    <FormContainer
      onSubmit={handleSubmit(data => mutate(data))}
      label="New Network"
      buttonLabel="Create"
    >
      <FormInput
        {...register('name')}
        errors={errors}
        label="Name"
        placeholder="my network"
      />
      <FormInput
        {...register('driver')}
        errors={errors}
        label="Driver"
        placeholder="bridge"
      />
    </FormContainer>
  );
};

export default NewNetwork;