import { DeleteIcon } from '@chakra-ui/icons';
import { Table, Thead, Tr, Th, Tbody, Td, Link, HStack, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useDefaultMutation } from '../../hooks';
import { getTemplates, deleteTemplate } from './templates.api';
import { Template } from './templates.types';

const Templates: React.FC = () => {
  const { data: templates } = useQuery(['templates'], getTemplates);

  return (
    <>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Image</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates?.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}
        </Tbody>
      </Table>
    </>
  );
};

type TemplateRowProps = {
  template: Template;
};

const TemplateRow: React.FC<TemplateRowProps> = ({ template }) => {
  const { mutate: remove } = useDefaultMutation(deleteTemplate, {
    action: 'deleting template',
    invalidateQueries: ['templates'],
  });

  return (
    <Tr key={template.id}>
      <Td>
        <Link as={RouterLink} to={`/templates/${template.id}`}>
          {template.container.name}
        </Link>
      </Td>
      <Td>{template.container.image}</Td>
      <Td>
        <HStack>
          <IconButton
            aria-label="Delete template"
            icon={<DeleteIcon />}
            onClick={() => remove(template.id)}
            variant="ghost"
          />
        </HStack>
      </Td>
    </Tr>
  );
};

export default Templates;