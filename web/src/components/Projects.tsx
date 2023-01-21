import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Flex, Table, Tbody, Td, Th, Thead, Tr, Link, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { deleteProject, getProjects } from '../api';
import { useDefaultMutation } from '../hooks';
import { Project } from '../types';

const Projects: React.FC = () => {
  const { data: projects } = useQuery(['projects'], getProjects, {
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });

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
          size="sm"
          onClick={() => remove(project.id)}
        />
      </Td>
    </Tr>
  );
};

export default Projects;