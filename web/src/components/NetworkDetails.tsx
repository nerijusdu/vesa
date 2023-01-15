import { DeleteIcon } from '@chakra-ui/icons';
import { Text, Flex, Heading, VStack, IconButton } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams } from 'react-router';
import { disconnectNetwork, getNetwork } from '../api';
import { useDefaultMutation } from '../hooks';

const NetworkDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: network } = useQuery(['network', params.id], () => getNetwork(params.id), {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });
  const { mutate: disconnect } = useDefaultMutation(disconnectNetwork, {
    action: 'disconnecting container from network',
    invalidateQueries: ['network', params.id],
  });

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
                cursor: 'pointer',
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
        </VStack>
      </Flex>
    </VStack>
  );
};

type FieldValueProps = {
  label: string;
  value?: string | number | boolean | null;
};

const FieldValue: React.FC<FieldValueProps> = ({ label, value }) => {
  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  return (
    <Flex minW="400px">
      <Text w="200px" fontWeight="medium">{label}</Text>
      <Text>{value}</Text>
    </Flex>
  );
};


export default NetworkDetails;