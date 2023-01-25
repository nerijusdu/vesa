import { RunContainerApiRequest } from '../containers/containers.types';

export type Template = {
  id: string;
  container: RunContainerApiRequest;
}