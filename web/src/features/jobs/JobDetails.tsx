
import { useQuery } from '@tanstack/react-query';
import { deleteJob, getJob, getJobLogs } from './jobs.api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Divider, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import FieldValue from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';
import { useEffect, useRef } from 'react';

const JobDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job } = useQuery(['job', params.id], () => getJob(params.id!));
  const { data: logs, refetch } = useQuery(['job', params.id, 'logs'], () => getJobLogs(params.id!));
  const { mutate: del } = useDefaultMutation(deleteJob, {
    action: 'deleting job',
    invalidateQueries: ['jobs'],
    onSuccess: () => navigate('/jobs'),
  });

  const logsRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (!logsRef.current) return;

    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logsRef.current, logs]);


  if (!job) {
    return null;
  }

  return (
    <VStack align="flex-start" maxW="100%">
      <Heading display="flex" gap={2}>
        {job.name}
        <Button as={Link} to={`/jobs/${job.id}/edit`} variant="link">
          Edit
        </Button>
        <Button variant="link" colorScheme="red" onClick={() => confirm('Are you sure?') && del(job.id)}>
          Delete
        </Button>
      </Heading>

      <FieldValue label="Endpoint" value={job.url} />
      <FieldValue label="Schedule" value={job.schedule} />
      <FieldValue label="Secret" hidden value={job.secret} />
      <FieldValue label="Enabled" value={job.enabled ? 'Yes' : 'No'} />

      <Heading size="sm">Logs</Heading>

      <Divider w="100%" />

      <Flex
        ref={logsRef as unknown as any}
        flexDir="column"
        as="pre"
        h="500px"
        overflowX="scroll"
        overflowY="scroll"
        w="100%"
        bg="black"
        rounded="lg"
      >
        <Text>{logs}</Text>
      </Flex>
      <HStack w="100%">
        <Button flexGrow={1} variant="outline" width="100%" onClick={() => refetch()}>
          Refresh Logs
        </Button>
        <Button variant="outline" width="100%" onClick={() => null}>
          Clear Logs TODO
        </Button>
      </HStack>
    </VStack>
  );
};

export default JobDetails;
