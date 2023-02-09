import { Container, ContainerDetails, RunContainerApiRequest } from './containers.types';
import { authRequest, buildQuery } from '../../api/api';

export const getContainers = async (data: { label?: string }): Promise<Container[]> => {
  const response = await authRequest(`/api/containers${buildQuery(data)}`);
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

export const getContainerLogs = (id: string | undefined, onData: (data: string) => void): AbortController => {
  const abortSignal = new AbortController();

  authRequest(`/api/containers/${id}/logs`, {
    signal: abortSignal.signal,
  }).then(res => {
    const reader = res.body
      ?.pipeThrough(new TextDecoderStream())
      ?.getReader();

    setTimeout(async () => {
      while(true) {
        try{
          const v = await reader?.read();

          if (!v) {
            reader?.cancel();
            break;
          }

          onData(v.value || '');
          if (v.done) {
            break;
          }
        } catch(err) {
          break;
        }
      }
    }, 0);

  });

  return abortSignal;
};
