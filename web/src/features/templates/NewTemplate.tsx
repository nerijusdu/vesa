import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import FormContainer from '../../components/form/formContainer';
import { useDefaultMutation, useDefaultToast } from '../../hooks';
import ContainerFields from '../containers/ContainerForm';
import { mapApiRequestToContainer, mapContainerToApiRequest } from '../containers/containers.helpers';
import { RunContainerRequest, runContainerSchema } from '../containers/containers.types';
import { getNetworks } from '../networks/networks.api';
import { getTemplate, saveTemplate } from './templates.api';
import { Button, Textarea } from '@chakra-ui/react';

const NewTemplate: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { mutate, isLoading } = useDefaultMutation(saveTemplate, {
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
          networks: [],
          restartPolicy: { name: 'no' },
        };
      }

      const t = await getTemplate(params.id);
      return mapApiRequestToContainer(t.container);
    },
  });
  const { data: networks } = useQuery(['networks'], getNetworks);
  const toast = useDefaultToast();
  const [isJson, setIsJson] = useState(false);
  const [jsonTemplate, setJsonTemplate] = useState('');

  const networkOptions = useMemo(
    () => networks?.map(x => ({ value: x.id, name: x.name })),
    [networks]
  );
  const setFormFromJson = () => {
    try {
      const values = mapApiRequestToContainer(JSON.parse(jsonTemplate));
      form.reset(values);
      return true;
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'Invalid JSON',
        description: e.message,
      });
      return false;
    }
  };

  return (
    <FormProvider {...form}>
      <FormContainer
        onSubmit={(e) => {
          if (isJson && !setFormFromJson()) {
            e.preventDefault();
            return false;
          }

          return form.handleSubmit(x => mutate({
            id: params.id,
            container: mapContainerToApiRequest(x, networks),
          }), (err) => console.error(err))(e);
        }}
        label={(
          <>
            {params.id ? 'Edit template' : 'New template'}
            <Button
              onClick={() => {
                if (isJson) {
                  setFormFromJson();
                } else {
                  setJsonTemplate(JSON.stringify(
                    mapContainerToApiRequest(form.getValues(), networks),
                    null,
                    2
                  ));
                }
                setIsJson(!isJson);
              }}
              size="sm"
              variant="ghost"
            >
              Edit as {isJson ? 'form' : 'JSON'}
            </Button>
          </>
        )}
        buttonLabel="Save"
        isLoading={isLoading}
      >
        {isJson ? (
          <Textarea
            rows={30}
            value={jsonTemplate}
            onChange={(e) => setJsonTemplate(e.target.value)}
          />
        ) : (<ContainerFields
          networkOptions={networkOptions}
          hideTemplateCheckbox
        />)}
      </FormContainer>
    </FormProvider>
  );
};

export default NewTemplate;
