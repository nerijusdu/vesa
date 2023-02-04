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
