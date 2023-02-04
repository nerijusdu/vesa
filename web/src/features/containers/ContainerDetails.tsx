import { Button, Flex, Heading, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteContainer, getContainer, startContainer, stopContainer } from './containers.api';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';
import { createTemplate } from '../templates/templates.api';

const ContainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: container } = useQuery(['container', id], () => getContainer(id));
  const { mutate: createTemp } = useDefaultMutation(createTemplate, {
    action: 'creating template',
    successMessage: (res) => 'Template created with ID: ' + res,
    onSuccess: (res) => navigate(`/templates/${res}`),
  });
  const { mutate: stop } = useDefaultMutation(stopContainer, {
    action: 'stopping container',
    invalidateQueries: ['containers'],
  });
  const { mutate: start } = useDefaultMutation(startContainer, {
    action: 'starting container',
    invalidateQueries: ['containers'],
  });
  const { mutate: remove } = useDefaultMutation(deleteContainer, {
    action: 'deleting container',
    invalidateQueries: ['containers'],
    onSuccess: () => navigate('/containers'),
  });

  if (!container) {
    return null;
  }

  const name = container.name.replace('/', '');

  return (
    <VStack align="flex-start">
      <Heading>{name}</Heading>

      <FieldValue label="ID" value={container.id} />
      <FieldValue label="Image" value={container.config?.image || container.image} />
      <FieldValue label="State" value={container.state} />
      <FieldValue label="Created" value={container.created} />
      <FieldValue label="Platform" value={container.platform} />
      <FieldValue label="Driver" value={container.driver} />
      <FieldValues 
        label="ports" 
        values={Object.keys(container.hostConfig?.portBindings || {}).map(k => {
          const v = container.hostConfig?.portBindings[k][0];
          const prefix = v?.hostIp ? `${v.hostIp}:` : '';
          return `${prefix}${v?.hostPort}:${k}`;
        })} 
      />
      <FieldValues
        label="Env vars"
        values={container.config?.env}
      />
      <FieldValues 
        label="Networks" 
        values={
          Object.keys(container.networkSettings?.networks || {})
            .map(n => ({
              label: n,
              link: `/networks/${container.networkSettings?.networks[n]?.networkId}`,
            }))
        }
      />
      <FieldValues 
        label="Mounts" 
        values={container.mounts?.map(m => `${m.type} - ${m.name || m.source}:${m.target}`)} 
      />


      <Flex gap={2}>
        <Button variant="outline" onClick={() => start(container.id)}>Start</Button>
        <Button variant="outline" onClick={() => stop(container.id)}>Stop</Button>
        <Button variant="outline" onClick={() => remove(container.id)}>Remove</Button>
        <Button variant="outline" onClick={() => createTemp(container.id)}>Create template from container</Button>
      </Flex>
    </VStack>
  );
};

export default ContainerDetails;
