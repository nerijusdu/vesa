import { ArrowRightIcon, DeleteIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr, Link } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { deleteContainer, getContainers, stopContainer, startContainer } from './containers.api';
import { useDefaultMutation } from '../../hooks';
import { Container } from './containers.types';

export type ContainersProps = {
  label?: string;
  listOnly?: boolean;
}

const Containers: React.FC<ContainersProps> = ({ label, listOnly }) => {
  const { data: containers } = useQuery(['containers', label], () => getContainers({ label }));

  return (
    <Flex flexDir="column" w="100%">
      {!listOnly && (
        <Flex my={4} w="100%" justifyContent="flex-end">
          <RouterLink to="/containers/new">
            <Button mr={4}>
              New container
            </Button>
          </RouterLink>
        </Flex>
      )}
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
          {containers?.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No containers found</Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </Flex>
  );
};

type ContainerRowProps = {
  container: Container;
};

const ContainerRow: React.FC<ContainerRowProps> = ({ container }) => {
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
            />
          ) : (
            <IconButton
              aria-label="Start container"
              icon={<ArrowRightIcon />}
              onClick={() => start(container.id)}
              variant="ghost"
            />
          )}
          <IconButton
            aria-label="Delete container"
            icon={<DeleteIcon />}
            onClick={() => window.confirm('Are you sure?') && remove(container.id)}
            variant="ghost"
          />
        </HStack>
      </Td>
    </Tr>
  );
};

export default Containers;
