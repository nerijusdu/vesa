import { Container, ContainerDetails, RunContainerApiRequest } from './containers.types';
import { authRequest } from '../../api/api';

export const getContainers = async (): Promise<Container[]> => {
  const response = await authRequest('/api/containers');
  return response.json();
};

export const runContainer = async (req: RunContainerApiRequest): Promise<string> => {
  const response = await authRequest('/api/containers', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const result = await response.json();
  return result.id;
};

export const getContainer = async (id?: string): Promise<ContainerDetails> => {
  const response = await authRequest(`/api/containers/${id}`);
  return response.json();
};

export const deleteContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}`, { method: 'DELETE' });
};

export const stopContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}/stop`, { method: 'POST' });
};

export const startContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}/start`, { method: 'POST' });
};

export const getContainerLogs = async (id: string | undefined, onData: (data: string) => void): Promise<() => void> => {
  const res = await authRequest(`/api/containers/${id}/logs`);
  const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();
  let cancelFunc: () => void = () => null;
  const abortPromise = new Promise<'abort'>((r) => {
    cancelFunc = () => r('abort');
  });
  setTimeout(async () => {
    while(true) {
      const v = await Promise.any([
        reader?.read(),
        abortPromise,
      ]);

      if (!v || v === 'abort') {
        reader?.cancel();
        console.log('aborting');
        break;
      }

      onData(v.value || '');
      if (v.done) {
        break;
      }
    }
  }, 0);

  return cancelFunc;
};
