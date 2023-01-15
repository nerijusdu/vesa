import { Text, Flex, Heading, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams } from 'react-router';
import { getNetwork } from '../api';

const NetworkDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: network } = useQuery(['network', params.id], () => getNetwork(params.id), {
    refetchOnWindowFocus: false,
    retryOnMount: false,
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
          {Object.values(network.containers).map((container) => (
            <Text key={container.name}>{container.name}</Text>
          ))}
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