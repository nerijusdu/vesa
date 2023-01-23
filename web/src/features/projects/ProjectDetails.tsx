import { Heading, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FieldValue, { FieldValues } from '../../components/FieldValue';
import { getContainers } from '../containers/containers.api';
import { getProject } from './projects.api';


const ProjectDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: project } = useQuery(['project', params.id], () => getProject(params.id));
  const { data: containers } = useQuery(['containers'], () => getContainers());

  const conatinerMap = useMemo(() => {
    const map = new Map<string, string>();
    containers?.forEach(c => map.set(c.id, c.names[0]?.replace('/', '')));
    return map;
  }, [containers]);

  if (!project) {
    return null;
  }

  return (
    <VStack align="flex-start">
      <Heading>{project.name}</Heading>

      <FieldValue label="ID" value={project.id} />
      <FieldValue label="Network" value={{
        label: project.networkName,
        link: `/networks/${project.networkId}`,
      }} />
      <FieldValues 
        label="Containers" 
        values={project.containers.map(x => ({ 
          label: conatinerMap.get(x) || x, 
          link: `/containers/${x}`,
        }))} 
      />
    </VStack>
  );
};

export default ProjectDetails;