import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Button, Flex, Table, Tbody, Td, Th, Thead, Tr, Link, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { deleteProject, getProjects } from './projects.api';
import { useDefaultMutation } from '../../hooks';
import { Project } from './projects.types';

const Projects: React.FC = () => {
  const { data: projects } = useQuery(['projects'], getProjects);

  return (
    <Flex flexDir="column">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/projects/new">
          <Button mr={4}>
            Create project
          </Button>
        </RouterLink>
      </Flex>
      <Table>
        <Thead>
          <Tr>
            <Th>Project</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {projects?.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};

type ProjectRowProps = {
  project: Project;
};

const ProjectRow: React.FC<ProjectRowProps> = ({ project }) => {
  const { mutate: remove } = useDefaultMutation(deleteProject, {
    action: 'removing project',
    invalidateQueries: ['projects'],
  });

  return (
    <Tr key={project.id}>
      <Td>
        <Link as={RouterLink} to={`/projects/${project.id}`}>
          {project.name}
        </Link>
      </Td>
      <Td>
        <IconButton
          aria-label="Delete project"
          icon={<DeleteIcon />}
          variant="ghost"
          onClick={() => confirm('Are you sure?') && remove(project.id)}
          ml={2}
        />
        <RouterLink to={`/projects/${project.id}/edit`}>
          <IconButton
            aria-label="Edit project"
            icon={<EditIcon />}
            variant="ghost"
          />
        </RouterLink>
      </Td>
    </Tr>
  );
};

export default Projects;
