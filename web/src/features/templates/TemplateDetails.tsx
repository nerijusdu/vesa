import { VStack, Heading, Flex, Button } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';
import { getTemplate, useTemplate } from './templates.api';

const TemplateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: template } = useQuery(['templates', id], () => getTemplate(id));
  const { mutate: use } = useDefaultMutation(useTemplate, { action: 'using template' });

  if (!template) {
    return null;
  }

  return (
    <VStack align="flex-start">
      <Heading>{template.container.name}</Heading>

      <FieldValue label="ID" value={template.id} />
      <FieldValue label="Image" value={template.container.image} />
      <FieldValue label="Network" value={template.container.networkName} />
      <FieldValues
        label="Env vars"
        values={template.container.envVars}
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
    </VStack>
  );
};

export default TemplateDetails;
