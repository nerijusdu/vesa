import { VStack, Heading, Flex, Button } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import FormInput from '../../components/form/formInput';
import { useDefaultMutation } from '../../hooks';
import Containers from '../containers/Containers';
import { deleteTemplate, getTemplate, updateTemplateContainers, useTemplate } from './templates.api';

const TemplateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template } = useQuery(['templates', id], () => getTemplate(id));
  const { mutate: use, isLoading: isUsing } = useDefaultMutation(useTemplate, {
    action: 'using template',
    invalidateQueries: ['containers'],
  });
  const { mutate: deleteTempl } = useDefaultMutation(deleteTemplate, {
    action: 'deleting template',
    invalidateQueries: ['templates'],
    onSuccess: () => navigate('/templates'),
  });

  if (!template) {
    return null;
  }

  return (
    <VStack align="flex-start" maxW="100%">
      <Heading display="flex" gap={2}>
        {template.container.name}

        {!template.isSystem && (
          <>
            <Button as={Link} to={`/templates/${template.id}/edit`} variant="link">
              Edit
            </Button>
            <Button variant="link" colorScheme="red" onClick={() => confirm('Are you sure?') && deleteTempl(template.id)}>
              Delete
            </Button>
          </>
        )}
      </Heading>

      <FieldValue label="ID" value={template.id} />
      <FieldValue label="Image" value={template.container.image} />
      <FieldValue label="Network" value={template.container.networkName} />
      <FieldValues
        label="Ports"
        values={template.container.ports}
      />
      <FieldValues
        label="Env vars"
        values={template.container.envVars}
        hidden
      />
      <FieldValues
        label="Mounts"
        values={template.container.mounts.map(m => `${m.type} - ${m.source}:${m.target}`)}
      />

      <Flex gap={2}>
        <Button variant="outline" isLoading={isUsing} onClick={() => use(template.id)}>
          Create container from template
        </Button>
      </Flex>

      <Containers listOnly label={`template=${template.id}`} />

      {!template.isSystem && <UpdateButton id={template.id} />}
    </VStack>
  );
};

const UpdateButton = ({ id }: { id: string }) => {
  const [isOpen, setOpen] = useState(false);
  const [tag, setTag] = useState('latest');

  const { mutate, isLoading } = useDefaultMutation(updateTemplateContainers, {
    action: 'updating containers',
    invalidateQueries: ['containers'],
    onSuccess: () => setOpen(false),
  });

  if (!isOpen) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        Update containers with latest image
      </Button>
    );
  }

  return (
    <Flex gap={2} m={4} align="flex-end">
      <FormInput
        containerProps={{ w: '150px' }}
        onChange={e => setTag(e.target.value)}
        value={tag}
        name="tag"
        label="Tag"
      />
      <Button
        onClick={() => mutate(id)}
        isLoading={isLoading}
        mb={2}
      >
        Update
      </Button>
    </Flex>
  );
};

export default TemplateDetails;
