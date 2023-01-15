import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useDefaultMutation } from '../hooks';
import { LoginRequest, loginSchema } from '../types';
import FormContainer from './form/formContainer';
import FormInput from './form/formInput';

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(login, {
    action: 'logging in',
    onSuccess: (data) => {
      localStorage.setItem('auth', JSON.stringify({
        ...data,
        expires_at: dayjs().add(data.expires_in, 'seconds').toISOString(),
      }));

      navigate('/');
    },
  });

  return (
    <FormContainer
      label="Login"
      buttonLabel="Login"
      onSubmit={handleSubmit((data) => mutate(data))}
    >
      <FormInput
        {...register('user')}
        label="Username"
        placeholder="Username"
        errors={errors}
      />
      <FormInput
        {...register('passwd')}
        label="Password"
        placeholder="Password"
        type="password"
        errors={errors}
      />
    </FormContainer>
  );
};

export default Login;