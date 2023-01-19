import { DeleteIcon } from '@chakra-ui/icons';
import { Text, Flex, Heading, VStack, IconButton, Button } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { connectNetwork, disconnectNetwork, getContainers, getNetwork } from '../api';
import { useDefaultMutation } from '../hooks';
import FieldValue from './FieldValue';
import FormSelect, { NamedValue } from './form/formSelect';

const NetworkDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: network } = useQuery(['network', params.id], () => getNetwork(params.id), {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });
  const { data: containers } = useQuery(['containers'], getContainers);
  const { mutate: disconnect } = useDefaultMutation(disconnectNetwork, {
    action: 'disconnecting container from network',
    invalidateQueries: ['network', params.id],
  });

  const containerOptions = useMemo(() => {
    if (!containers) {
      return [];
    }

    const existingContainers = Object.keys(network?.containers || {});

    return containers
      .filter(container => !existingContainers.includes(container.id))
      .map((container) => ({
        name: container.names[0]?.replace('/', ''),
        value: container.id,
      }));
  }, [containers, network?.containers]);

  if (!network) {
    return null;
  }

  return (
    <VStack align="flex-start">
      <Heading>{network.name}</Heading>

      <FieldValue label="ID" value={network.id} />
      <FieldValue label="Driver" value={network.driver} />
      <FieldValue label="Scope" value={network.scope} />
      <FieldValue label="Created" value={dayjs(network.created).utc().format('YYYY-MM-DD HH:mm:ss')} />
      <FieldValue label="Internal" value={network.internal} />
      <FieldValue label="Attachable" value={network.attachable} />

      <Flex>
        <Text fontWeight="medium" w="200px">Containers</Text>
        <VStack align="flex-start">
          {Object.keys(network.containers).map((containerId) => {
            const container = network.containers[containerId];
            return (
              <Flex key={containerId} px={2} py={1} alignItems="center" _hover={{
                bg: 'purple.900',
                borderRadius: 'md',
              }}>
                <Text w="400px">{container.name}</Text>
                <IconButton
                  aria-label="Remove container from network"
                  icon={<DeleteIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnect({
                    networkId: network.id,
                    containerId: containerId,
                  })}
                />
              </Flex>
            );
          })}

          <ConnectContainer networkId={network.id} containerOptions={containerOptions} />
        </VStack>
      </Flex>
    </VStack>
  );
};

type ConnectContainerProps = {
  networkId: string;
  containerOptions: NamedValue<string>[];
};

const ConnectContainer: React.FC<ConnectContainerProps> = ({ networkId, containerOptions }) => {
  const [containerId, setContainerId] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(false);

  const { mutate: connect } = useDefaultMutation(connectNetwork, {
    action: 'connecting container to network',
    invalidateQueries: ['network', networkId],
    onSuccess: () => {
      setContainerId(null);
      setShowSelection(false);
    },
  });

  if (!showSelection) {
    return (
      <Button onClick={() => setShowSelection(true)}>
        Connect container to network
      </Button>
    );
  }
  
  return (
    <Flex gap={4} justifyContent="stretch" w="450px">
      <FormSelect
        name="containerId"
        data={containerOptions}
        value={containerId || ''}
        onChange={(e) => setContainerId(e.target.value)}
      />
      <Button onClick={() => {
        if (!containerId) return;
        connect({ networkId, containerId });
      }}>
        Connect
      </Button>
      <Button variant="outline" onClick={() => setShowSelection(false)}>
        Cancel
      </Button>
    </Flex>
  );
};


export default NetworkDetails;