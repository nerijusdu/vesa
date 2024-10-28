import { Box, Button, Divider, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';
import { createTemplate } from '../templates/templates.api';
import { deleteContainer, getContainer, getContainerLogs, restartContainer, startContainer, stopContainer } from './containers.api';

const ContainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const logsRef = useRef<HTMLPreElement>(null);
  const navigate = useNavigate();
  const { data: container } = useQuery(['container', id], () => getContainer(id));
  const { data: logs, refetch } = useQuery(['container', id, 'logs'], () => getContainerLogs(id));
  const { mutate: createTemp, isLoading: isCreating } = useDefaultMutation(createTemplate, {
    action: 'creating template',
    successMessage: (res) => 'Template created with ID: ' + res,
    onSuccess: (res) => navigate(`/templates/${res}`),
  });
  const { mutate: stop, isLoading: isStopping } = useDefaultMutation(stopContainer, {
    action: 'stopping container',
    invalidateQueries: ['containers'],
  });
  const { mutate: start, isLoading: isStarting } = useDefaultMutation(startContainer, {
    action: 'starting container',
    invalidateQueries: ['containers'],
  });
  const { mutate: restart, isLoading: isRestarting } = useDefaultMutation(restartContainer, {
    action: 'restarting container',
    invalidateQueries: ['containers'],
  });
  const { mutate: remove, isLoading: isRemoving } = useDefaultMutation(deleteContainer, {
    action: 'deleting container',
    invalidateQueries: ['containers'],
    onSuccess: () => navigate('/containers'),
  });

  useEffect(() => {
    if (!logsRef.current) return;

    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logsRef.current, logs]);

  if (!container) {
    return null;
  }

  const name = container.name.replace('/', '');
  const templateId = container.config?.labels?.['template'];

  return (
    <VStack gap={2} align="flex-start" maxW="100%">
      <Heading>{name}</Heading>

      <FieldValue label="ID" value={container.id} />
      <FieldValue label="Image" value={container.config?.image || container.image} />
      <FieldValue label="State" value={container.state} />
      <FieldValue label="Created" value={container.created} />
      <FieldValue label="Platform" value={container.platform} />
      <FieldValue label="Driver" value={container.driver} />
      <FieldValues
        label="Ports"
        values={Object.keys(container.hostConfig?.portBindings || {}).map(k => {
          const v = container.hostConfig?.portBindings[k][0];
          const prefix = v?.hostIp ? `${v.hostIp}:` : '';
          return `${prefix}${v?.hostPort}:${k}`;
        })}
      />
      <FieldValues
        label="Env vars"
        values={container.config?.env}
        hidden
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

      <Divider w="100%" />

      <Flex
        ref={logsRef as unknown as any}
        flexDir="column"
        as="pre"
        h="500px"
        overflowX="scroll"
        overflowY="scroll"
        w="100%"
        bg="black"
        rounded="lg"
      >
        <Text>{logs}</Text>
      </Flex>
      <Box w="100%">
        <Button variant="outline" width="100%" onClick={() => refetch()}>
          Refresh Logs
        </Button>
      </Box>

      <Divider w="100%" />

      <Flex gap={2}>
        <Button variant="outline" isLoading={isStarting} onClick={() => start(container.id)}>Start</Button>
        <Button variant="outline" isLoading={isStopping} onClick={() => stop(container.id)}>Stop</Button>
        <Button variant="outline" isLoading={isRestarting} onClick={() => restart(container.id)}>Restart</Button>
        <Button variant="outline" isLoading={isRemoving} onClick={() => confirm('Are you sure?') && remove(container.id)}>Remove</Button>
        {templateId ? (
          <Button variant="outline" as={Link} to={`/templates/${templateId}`}>Go to template</Button>
        ) : (
          <Button variant="outline" isLoading={isCreating} onClick={() => createTemp(container.id)}>Create template from container</Button>
        )}

      </Flex>
    </VStack >
  );
};

export default ContainerDetails;
