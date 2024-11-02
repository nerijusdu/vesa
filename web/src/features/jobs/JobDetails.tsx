
import { useQuery } from '@tanstack/react-query';
import { deleteJob, getJob } from './jobs.api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Heading, VStack } from '@chakra-ui/react';
import FieldValue from '../../components/FieldValue';
import { useDefaultMutation } from '../../hooks';

const JobDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job } = useQuery(['job', params.id], () => getJob(params.id!));
  const { mutate: del } = useDefaultMutation(deleteJob, {
    action: 'deleting job',
    invalidateQueries: ['jobs'],
    onSuccess: () => navigate('/jobs'),
  });

  if (!job) {
    return null;
  }

  return (
    <VStack align="flex-start">
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
      <FieldValue label="Secret" value={job.secret} />
      <FieldValue label="Enabled" value={job.enabled ? 'Yes' : 'No'} />
    </VStack>
  );
};

export default JobDetails;
