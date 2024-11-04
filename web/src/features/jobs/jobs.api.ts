import { authRequest } from '../../api/api';
import { Job } from './jobs.types';

export const getJobs = async (): Promise<Job[]> => {
  const response = await authRequest('/api/jobs');
  return response.json();
};

export const getJob = async (id: string): Promise<Job> => {
  const response = await authRequest(`/api/jobs/${id}`);
  return response.json();
};

export const getJobLogs = async (id: string): Promise<string[]> => {
  const response = await authRequest(`/api/jobs/${id}/logs`);
  return response.json();
};

export const createJob = async (job: Omit<Job, 'id'> & { id?: string }): Promise<string> => {
  const response = await authRequest('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });
  const result = await response.json();
  return result.id;
};

export const deleteJob = async (id: string) => {
  await authRequest(`/api/jobs/${id}`, { method: 'DELETE' });
};
