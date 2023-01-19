import { ArrowRightIcon, DeleteIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr, Link } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { deleteContainer, getContainers, stopContainer, startContainer } from '../api';
import { useDefaultMutation } from '../hooks';
import { Container } from '../types';

const Containers: React.FC = () => {
  const { data: containers } = useQuery(['containers'], getContainers, {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });

  return (
    <Flex flexDir="column">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/containers/new">
          <Button mr={4}>
            New container
          </Button>
        </RouterLink>
      </Flex>
      <Table>
        <Thead>
          <Tr>
            <Th>Containers</Th>
            <Th>Image</Th>
            <Th>State</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {containers?.map((container) => (
            <ContainerRow key={container.id} container={container} />
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};

type ContainerProps = {
  container: Container;
};

const ContainerRow: React.FC<ContainerProps> = ({ container }) => {
  const name = container.names[0].replace('/', '');

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
  });

  return (
    <Tr key={container.id}>
      <Td>
        <Link as={RouterLink} to={`/containers/${container.id}`}>
          {name}
        </Link>
      </Td>
      <Td>{container.image}</Td>
      <Td>{container.state}</Td>
      <Td>
        <HStack>
          {container.state === 'running' ? (
            <IconButton
              aria-label="Stop container"
              icon={<NotAllowedIcon />}
              onClick={() => stop(container.id)}
              variant="ghost"
              size="sm"
            />
          ) : (
            <IconButton
              aria-label="Start container"
              icon={<ArrowRightIcon />}
              onClick={() => start(container.id)}
              variant="ghost"
              size="sm"
            />
          )}
          <IconButton
            aria-label="Delete container"
            icon={<DeleteIcon />}
            onClick={() => remove(container.id)}
            variant="ghost"
            size="sm"
          />
        </HStack>
      </Td>
    </Tr>
  );
};

export default Containers;