import { Button, Flex, Heading } from '@chakra-ui/react';
import { FormEventHandler } from 'react';

export type FormContainerProps = {
  children: React.ReactNode;
  label: string;
  buttonLabel: string;
  onSubmit?: FormEventHandler<HTMLDivElement> | undefined;
  isLoading?: boolean;
};

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  label,
  buttonLabel,
  onSubmit,
  isLoading
}) => {
  return (
    <Flex
      as="form"
      onSubmit={onSubmit}
      flexDir="column"
      w="500px"
      gap={2}
    >
      <Heading size="md">{label}</Heading>

      {children}

      <Button isLoading={isLoading} type="submit">
        {buttonLabel}
      </Button>
    </Flex>
  );
};

export default FormContainer;
