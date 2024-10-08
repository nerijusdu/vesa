import { DeleteIcon } from '@chakra-ui/icons';
import { Table, Thead, Tr, Th, Tbody, Td, Link, HStack, IconButton, Flex, Button } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useDefaultMutation } from '../../hooks';
import { getTemplates, deleteTemplate } from './templates.api';
import { Template } from './templates.types';

const Templates: React.FC = () => {
  const { data: templates } = useQuery(['templates'], getTemplates);

  const userTemplates = templates?.filter(template => !template.isSystem);
  const systemTemplates = templates?.filter(template => template.isSystem);

  return (
    <>
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/templates/new">
          <Button mr={4}>
            New template
          </Button>
        </RouterLink>
      </Flex>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Image</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {userTemplates?.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}

          <Tr>
            <Td colSpan={3} fontWeight="bold">System templates</Td>
          </Tr>

          {systemTemplates?.map((template) => (
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
            onClick={() => confirm('Are you sure?') && remove(template.id)}
            variant="ghost"
          />
        </HStack>
      </Td>
    </Tr>
  );
};

export default Templates;
