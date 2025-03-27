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
  networks: data.networks
    ?.filter(x => x.networkId)
    .map(x => ({
      networkId: x.networkId,
      networkName: networks?.find(n => n.id === x.networkId)?.name,
    })) || [],
  domain: data.domain && {
    ...data.domain,
    pathPrefixes: data.domain?.pathPrefixes?.map(x => x.value) || [],
    headers: data.domain?.headers?.filter(x => x.name && x.value) || [],
  },
});

export const mapApiRequestToContainer = (container: RunContainerApiRequest): RunContainerRequest => ({
  ...container,
  ports: container.ports?.map(value => ({ value })) || [],
  envVars: container.envVars?.map(x => {
    const [key, ...rest] = x.split('=');
    return { key, value: rest.join('=') };
  }) || [],
  restartPolicy: {
    name: container.restartPolicy.name || 'no',
    maximumRetryCount: container.restartPolicy.maximumRetryCount,
  },
  domain: container.domain && {
    ...container.domain,
    pathPrefixes: container.domain?.pathPrefixes?.map(x => ({ value: x })) || [],
  },
});
