export type Network = {
  name: string;
  id: string;
  created: string;
  scope: string;
  driver: string;
  internal: boolean;
  attachable: boolean;
  containers: Record<string, NetworkContainer>;
};

export type NetworkContainer = {
  name: string;
  endpointId: string;
  macAddress: string;
  ipv4Address: string;
  ipv6Address: string;
};