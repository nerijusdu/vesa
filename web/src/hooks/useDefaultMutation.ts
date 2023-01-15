import { MutationFunction, useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import useDefaultToast from './useDefaultToast';

const useDefaultMutation = <
    TData = unknown, 
    TError extends Error = Error, 
    TVariables = void, 
    TContext = unknown,
  >( 
    fn: MutationFunction<TData, TVariables>, 
    opts: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
      invalidateQueries?: (string | undefined)[];
      action: string;
    },
  ): UseMutationResult<TData, TError, TVariables, TContext> => {
  const { invalidateQueries, action, ...rest } = opts;
  const queryClient = useQueryClient();
  const toast = useDefaultToast();
  
  return useMutation<TData, TError, TVariables, TContext>(fn, {
    ...rest,
    onError: (error: TError) => {
      toast({
        title: `Error ${action}`,
        description: error?.message,
        status: 'error',
      });
    },
    onSuccess: () => {
      toast({
        title: `Success ${action}`,
        status: 'success',
      });
      if (invalidateQueries?.length) {
        queryClient.invalidateQueries(invalidateQueries);
      }
    },
  });
};

export default useDefaultMutation;