import { useQuery } from '@tanstack/react-query';
import { deleteJob, getJobs } from './jobs.api';
import { Button, Flex, HStack, IconButton, Link, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DeleteIcon } from '@chakra-ui/icons';
import { useDefaultMutation } from '../../hooks';
import { Job } from './jobs.types';


const Jobs: React.FC = () => {
  const { data: jobs } = useQuery(['jobs'], () => getJobs());

  return (
    <Flex flexDir="column" w="100%">
      <Flex my={4} w="100%" justifyContent="flex-end">
        <RouterLink to="/jobs/new">
          <Button mr={4}>
            New job
          </Button>
        </RouterLink>
      </Flex>

      <Table>
        <Thead>
          <Tr>
            <Th>Job</Th>
            <Th>Url</Th>
            <Th>Schedule</Th>
            <Th>Enabled</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {jobs?.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
          {jobs?.length === 0 ? (
            <Tr>
              <Td colSpan={5}>No jobs found</Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </Flex>
  );
};

type JobRowProps = {
  job: Job;
};

const JobRow: React.FC<JobRowProps> = ({ job }) => {
  const { mutate: remove } = useDefaultMutation(deleteJob, {
    action: 'deleting job',
    invalidateQueries: ['jobs'],
  });

  return (
    <Tr key={job.id}>
      <Td>
        <Link as={RouterLink} to={`/jobs/${job.id}`}>
          {job.name}
        </Link>
      </Td>
      <Td>{job.url}</Td>
      <Td>{job.schedule}</Td>
      <Td>{job.enabled ? 'Yes' : 'No'}</Td>
      <Td>
        <HStack>
          <IconButton
            aria-label="Delete job"
            icon={<DeleteIcon />}
            onClick={() => window.confirm('Are you sure?') && remove(job.id)}
            variant="ghost"
          />
        </HStack>
      </Td>
    </Tr>
  );
};


export default Jobs;
