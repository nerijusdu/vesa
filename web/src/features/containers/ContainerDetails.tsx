import { Heading, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getContainer } from './containers.api';
import FieldValue, { FieldValues } from '../../components/FieldValue';

const ContainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: container } = useQuery(['container', id], () => getContainer(id));

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
    </VStack>
  );
};

export default ContainerDetails;
