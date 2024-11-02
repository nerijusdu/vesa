import { Checkbox } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import FormInput from '../../components/form/formInput';
import { useDefaultMutation } from '../../hooks';
import { createJob, getJob } from './jobs.api';
import { CreateJobRequest, createJobSchema } from './jobs.types';
import { parseExpression } from 'cron-parser';


const NewJob: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useDefaultMutation(createJob, {
    action: params.id ? 'updating job' : 'creating job',
    successMessage: (res) => params.id ? 'Job saved' : 'Job created with ID: ' + res,
    onSuccess: () => navigate('/jobs'),
  });

  const form = useForm<CreateJobRequest>({
    resolver: zodResolver(createJobSchema),
    defaultValues: async () => {
      if (!params.id) {
        return {
          name: '',
          url: '',
          schedule: '',
          secret: '',
          enabled: true,
        };
      }

      const job = await getJob(params.id);
      return job;
    },
  });
  const { register, watch, handleSubmit, formState: { errors } } = form;
  const schedule = watch('schedule');
  let parsed = 'Invalid schedule';
  try {
    parsed = parseExpression(schedule).next().toString();
  } catch { }

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={handleSubmit(data => mutate(data))}
        label={params.id ? 'Edit job' : 'New job'}
        buttonLabel="Save"
      >
        <FormInput
          label="Name"
          errors={errors}
          {...register('name')}
          placeholder="My Job"
        />
        <FormInput
          label="Endpoint to call"
          errors={errors}
          {...register('url')}
          placeholder="https://example.com/cron/job1"
        />
        <FormInput
          label="Schedule"
          errors={errors}
          {...register('schedule')}
          placeholder="0 0 * * *"
          helperText={schedule ? `Next run: ${parsed}` : undefined}
        />
        <FormInput
          label="Secret"
          errors={errors}
          {...register('secret')}
          placeholder="secret"
        />
        <Controller
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <Checkbox
              isChecked={field.value}
              onChange={field.onChange}
              ref={field.ref}
            >
              Enabled
            </Checkbox>
          )}
        />

      </FormContainer>
    </FormProvider>
  );
};


export default NewJob;
