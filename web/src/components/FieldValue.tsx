import { Text, Flex, VStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export type FieldValueProps = {
  label: string;
  value?: string | number | boolean | null;
};

const FieldValue: React.FC<FieldValueProps> = ({ label, value }) => {
  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  return (
    <Flex minW="400px">
      <Text w="200px" fontWeight="medium">{label}</Text>
      <Text fontFamily="mono">{value}</Text>
    </Flex>
  );
};

export type LinkedValue = {
  label: string;
  link: string;
}

export type FieldValuesProps = {
  label: string;
  values?: string[] | number[] | boolean[] | LinkedValue[] | null;
}

export const FieldValues: React.FC<FieldValuesProps> = ({ label, values }) => {
  if (!values) {
    return null;
  }

  return (
    <Flex minW="400px">
      <Text w="200px" fontWeight="medium">{label}</Text>
      <VStack align="flex-start">
        {values.map((value) => {
          if (value === true || value === false) {
            value = value ? 'true' : 'false';
          }

          if (typeof value === 'object') {
            return (
              <Link 
                as={RouterLink} 
                to={value.link} 
                key={value.label} 
                fontFamily="mono"
              >
                {value.label}
              </Link>
            );
          }

          return (
            <Text key={value} fontFamily="mono">{value}</Text>
          );
        })}
      </VStack>
    </Flex>
  );
};

export default FieldValue;
