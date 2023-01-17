import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Flex, Table, Tbody, Td, Th, Thead, Tr, Link, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { deleteNetwork, getNetworks } from '../api';
import { useDefaultMutation } from '../hooks';
import { Network } from '../types';

const Networks: React.FC = () => {
  const { data: networks } = useQuery(['networks'], getNetworks, {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });

  return (
    <Flex flexDir="column">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/networks/new">
          <Button mr={4}>
            Create network 
          </Button>
        </RouterLink>
      </Flex>
      <Table>
        <Thead>
          <Tr>
            <Th>Network</Th>
            <Th>Driver</Th>
            <Th>Scope</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {networks?.map((network) => (
            <NetworkRow key={network.id} network={network} />
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};

type NetworkRowProps = {
  network: Network;
};

const NetworkRow: React.FC<NetworkRowProps> = ({ network }) => {
  const { mutate: remove } = useDefaultMutation(deleteNetwork, {
    action: 'removing network',
    invalidateQueries: ['networks'],
  });

  return (
    <Tr key={network.id}>
      <Td>
        <Link as={RouterLink} to={`/networks/${network.id}`}>
          {network.name}
        </Link>
      </Td>
      <Td>{network.driver}</Td>
      <Td>{network.scope}</Td>
      <Td>{dayjs(network.created).utc().format('YYYY-MM-DD HH:mm')}</Td>
      <Td>
        <IconButton
          aria-label="Delete network"
          icon={<DeleteIcon />}
          variant="ghost"
          size="sm"
          onClick={() => remove(network.id)}
        />
      </Td>
    </Tr>
  );
};

export default Networks;