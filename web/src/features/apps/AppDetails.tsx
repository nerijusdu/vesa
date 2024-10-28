import { useQuery } from '@tanstack/react-query';
import { deleteApp, getApp } from './apps.api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Heading, VStack } from '@chakra-ui/react';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';

const entrypointMap: Record<string, string> = {
  web: 'http',
  websecure: 'https',
};

const AppDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: app } = useQuery(['app', params.id], () => getApp(params.id!));
  const { mutate: del } = useDefaultMutation(deleteApp, {
    action: 'deleting app',
    invalidateQueries: ['apps'],
    onSuccess: () => navigate('/apps'),
  });

  if (!app) {
    return null;
  }

  return (
    <VStack align="flex-start">
      <Heading display="flex" gap={2}>
        {app.name}
        <Button as={Link} to={`/apps/${app.id}/edit`} variant="link">
          Edit
        </Button>
        <Button variant="link" colorScheme="red" onClick={() => confirm('Are you sure?') && del(app.id)}>
          Delete
        </Button>
      </Heading>

      <FieldValue label="Route to app" value={app.route} />
      <FieldValue label="Domain host" value={app.domain.host} />
      <FieldValues label="Path prefixes" values={app.domain.pathPrefixes} />
      <FieldValue label="Domain entrypoint" value={entrypointMap[app.domain.entrypoints[0] || ''] || '-'} />
    </VStack>
  );
};

export default AppDetails;
