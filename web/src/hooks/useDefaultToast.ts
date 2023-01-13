import { useToast } from '@chakra-ui/react';

const useDefaultToast = () => {
  const toast = useToast({
    position: 'bottom-left',
    duration: 5000,
    isClosable: true,
  });

  return toast;
};

export default useDefaultToast;