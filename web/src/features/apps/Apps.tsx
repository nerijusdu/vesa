import { useQuery } from '@tanstack/react-query';
import {  deleteApp, getApps } from './apps.api';
import { Button, Flex, HStack, IconButton, Link, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DeleteIcon } from '@chakra-ui/icons';
import { useDefaultMutation } from '../../hooks';
import { App } from './apps.types';


const Apps: React.FC = () => {
  const { data: apps } = useQuery(['apps'], () => getApps());

  return (
    <Flex flexDir="column" w="100%">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/apps/new">
          <Button mr={4}>
            New app
          </Button>
        </RouterLink>
      </Flex>

      <Table>
        <Thead>
          <Tr>
            <Th>App</Th>
            <Th>Domain</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {apps?.map((app) => (
            <AppRow key={app.id} app={app} />
          ))}
          {apps?.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No apps found</Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </Flex>
  );
};

type AppRowProps = {
  app: App;
};

const AppRow: React.FC<AppRowProps> = ({ app }) => {
  const { mutate: remove } = useDefaultMutation(deleteApp, {
    action: 'deleting app',
    invalidateQueries: ['apps'],
  });

  return (
    <Tr key={app.id}>
      <Td>
        <Link as={RouterLink} to={`/apps/${app.id}`}>
          {app.name}
        </Link>
      </Td>
      <Td>{app.domain.host}</Td>
      <Td>
        <HStack>
          <IconButton
            aria-label="Delete apps"
            icon={<DeleteIcon />}
            onClick={() => window.confirm('Are you sure?') && remove(app.id)}
            variant="ghost"
          />
        </HStack>
      </Td>
    </Tr>
  );
};


export default Apps;
