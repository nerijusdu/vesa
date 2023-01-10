import { ArrowRightIcon, DeleteIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { deleteContainer, getContainers, stopContainer, startContainer } from '../api';
import { Container } from '../types';

const Containers: React.FC = () => {
  const { data: containers } = useQuery(['containers'], getContainers, {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });

  return (
    <Flex flexDir="column">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <Link to="/containers/new">
          <Button colorScheme="purple" mr={4}>
          New container
          </Button>
        </Link>
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
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutationParams = (action: string) => ({
    onError: (error: Error) => {
      toast({
        title: `Error ${action}`,
        description: error?.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: `Success ${action}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(['containers']);
    },
  });

  const { mutate: stop } = useMutation(stopContainer, mutationParams('stopping container'));
  const { mutate: start } = useMutation(startContainer, mutationParams('starting container'));
  const { mutate: remove } = useMutation(deleteContainer, mutationParams('deleting container'));

  return (
    <Tr key={container.id}>
      <Td>{name}</Td>
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