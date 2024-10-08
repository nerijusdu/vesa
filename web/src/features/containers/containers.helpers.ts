import { Network } from '../networks/networks.types';
import { RunContainerApiRequest, RunContainerRequest } from './containers.types';

export const mapContainerToApiRequest = ({
  envVars,
  ports,
  mounts,
  ...data
}: RunContainerRequest, networks?: Network[]): RunContainerApiRequest => ({
  ...data,
  mounts: mounts.map(x => ({
    ...x,
    source: (x.type === 'volume' ? x.name : null) || x.source,
  })),
  ports: (ports || []).map(x => x.value).filter(Boolean) as string[],
  envVars: (envVars || []).map(x => `${x.key}=${x.value}`).filter(Boolean) as string[],
  networkName: data.networkId
    ? networks?.find(x => x.id === data.networkId)?.name
    : undefined,
});

export const mapApiRequestToContainer = (container: RunContainerApiRequest): RunContainerRequest => ({
  ...container,
  ports: container.ports?.map(value => ({ value })) || [],
  envVars: container.envVars?.map(x => {
    const splits = x.split('=');
    return { key: splits[0], value: splits[1] };
  }) || [],
  restartPolicy: {
    name: container.restartPolicy.name || 'no',
    maximumRetryCount: container.restartPolicy.maximumRetryCount,
  },
});
