import { MutationFunction, useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/api';
import useDefaultToast from './useDefaultToast';

const useDefaultMutation = <
    TData = unknown, 
    TError extends ApiError = ApiError, 
    TVariables = void, 
    TContext = unknown,
  >( 
    fn: MutationFunction<TData, TVariables>, 
    opts: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
      invalidateQueries?: (string | undefined)[];
      successMessage?: string | ((data: TData) => string);
      action: string;
    },
  ): UseMutationResult<TData, TError, TVariables, TContext> => {
  const { invalidateQueries, action, successMessage, onSuccess, onError, ...rest } = opts;
  const queryClient = useQueryClient();
  const toast = useDefaultToast();
  
  return useMutation<TData, TError, TVariables, TContext>(fn, {
    ...rest,
    onError: (error, variables, ctx) => {
      const title = error?.description ?  error?.message : `Error ${action}`;
      const description = error?.description || error?.message;

      toast({ title, description, status: 'error' });

      onError?.(error, variables, ctx);
    },
    onSuccess: (data, variables, ctx) => {
      const msg = typeof successMessage === 'function' 
        ? successMessage(data) 
        : successMessage;

      toast({ title: msg || `Success ${action}`, status: 'success' });

      if (invalidateQueries?.length) {
        queryClient.invalidateQueries(invalidateQueries);
      }

      onSuccess?.(data, variables, ctx);
    },
  });
};

export default useDefaultMutation;