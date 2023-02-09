import { VStack, Heading, Flex, Button } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';
import Containers from '../containers/Containers';
import { deleteTemplate, getTemplate, useTemplate } from './templates.api';

const TemplateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template } = useQuery(['templates', id], () => getTemplate(id));
  const { mutate: use } = useDefaultMutation(useTemplate, { 
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
    <VStack align="flex-start">
      <Heading display="flex" gap={2}>
        {template.container.name}
        
        <Button as={Link} to={`/templates/${template.id}/edit`} variant="link">
          Edit
        </Button>
        <Button variant="link" colorScheme="red" onClick={() => deleteTempl(template.id)}>
          Delete
        </Button>
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
        <Button variant="outline" onClick={() => use(template.id)}>
          Create container from template
        </Button>
      </Flex>

      <Containers listOnly label={`template=${template.id}`} />
    </VStack>
  );
};

export default TemplateDetails;
