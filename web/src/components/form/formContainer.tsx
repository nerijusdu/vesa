import { Button, Flex, Heading } from '@chakra-ui/react';
import { FormEventHandler } from 'react';

export type FormContainerProps = {
  children: React.ReactNode;
  label: string;
  buttonLabel: string;
  onSubmit?: FormEventHandler<HTMLDivElement> | undefined;
};

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  label,
  buttonLabel,
  onSubmit,
}) => {
  return (
    <Flex
      as="form"
      onSubmit={onSubmit}
      flexDir="column"
      w="400px"
      gap={2}
    >
      <Heading size="md">{label}</Heading>

      {children}

      <Button type="submit">
        {buttonLabel}
      </Button>
    </Flex>
  );
};

export default FormContainer;