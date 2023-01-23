import { Text, Flex, VStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export type FieldValueProps = {
  label: string;
  value?: Value;
};

export type LinkedValue = {
  label: string;
  link: string;
}

export type FieldValuesProps = {
  label: string;
  values?: string[] | number[] | boolean[] | LinkedValue[] | null;
}

type Value = string | number | boolean | LinkedValue | null;

const FieldValue: React.FC<FieldValueProps> = ({ label, value }) => {
  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  return (
    <Flex minW="400px">
      <Text w="200px" fontWeight="medium">{label}</Text>
      <Value value={value} />
    </Flex>
  );
};

export const FieldValues: React.FC<FieldValuesProps> = ({ label, values }) => {
  if (!values) {
    return null;
  }

  return (
    <Flex minW="400px">
      <Text w="200px" fontWeight="medium">{label}</Text>
      <VStack align="flex-start">
        {values.map((value, i) => (
          <Value key={i} value={value} />
        ))}
      </VStack>
    </Flex>
  );
};

const Value: React.FC<{ value?: Value }> = ({ value }) => {
  if (value === null) {
    return null;
  }

  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  if (typeof value === 'object') {
    return (
      <Link 
        as={RouterLink} 
        to={value.link} 
        fontFamily="mono"
      >
        {value.label}
      </Link>
    );
  }

  return (
    <Text fontFamily="mono">{value}</Text>
  );
};

export default FieldValue;
