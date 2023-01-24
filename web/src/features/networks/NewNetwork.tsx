import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import { useDefaultMutation } from '../../hooks';
import { createNetwork } from './networks.api';
import { CreateNetworkRequest, createNetworkScheme } from './networks.types';

const NewNetwork: React.FC = () => {
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(createNetwork, {
    action: 'creating network',
    successMessage: (res) => 'Network created with ID: ' + res,
    onSuccess: () => navigate('/networks'),
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