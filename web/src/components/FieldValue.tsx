import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Text, Flex, VStack, Link, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type FieldValueProps = {
  label: string;
  value?: Value;
  hidden?: boolean;
};

export type LinkedValue = {
  label: string;
  link: string;
}

export type FieldValuesProps = {
  hidden?: boolean;
  label: string;
  values?: string[] | number[] | boolean[] | LinkedValue[] | null;
}

type Value = string | number | boolean | LinkedValue | null;

const FieldValue: React.FC<FieldValueProps> = ({ hidden, label, value }) => {
  const [isHidden, setIsHidden] = useState(hidden || false);
  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  if (!value) {
    return null;
  }

  return (
    <Flex minW="400px">
      <Flex w="200px" gap={2}>
        <Text fontWeight="medium" mt={0.5}>{label}</Text>
        {hidden && (
          <IconButton
            icon={isHidden ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setIsHidden(x => !x)}
            aria-label="Hide/Show"
            size="sm"
            variant="ghost"
            mr={2}
          />
        )}
      </Flex>
      <Value value={value} hidden={isHidden} />
    </Flex>
  );
};

export const FieldValues: React.FC<FieldValuesProps> = ({ hidden, label, values }) => {
  const [isHidden, setIsHidden] = useState(hidden || false);
  if (!values?.length) {
    return null;
  }

  const displayValues = isHidden ? ['******'] : values;

  return (
    <Flex minW="400px">
      <Flex w="200px" gap={2}>
        <Text fontWeight="medium" mt={0.5}>{label}</Text>
        {hidden && (
          <IconButton
            icon={isHidden ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setIsHidden(x => !x)}
            aria-label="Hide/Show"
            size="sm"
            variant="ghost"
            mr={2}
          />
        )}
      </Flex>
      <VStack align="flex-start" maxW="70%">
        {displayValues.map((value, i) => (
          <Value key={i} value={value} hidden={isHidden} />
        ))}
      </VStack>
    </Flex>
  );
};

const Value: React.FC<{ value?: Value; hidden: boolean }> = ({ value, hidden }) => {
  if (value === null) {
    return null;
  }

  if (value === true || value === false) {
    value = value ? 'true' : 'false';
  }

  if (hidden) {
    value = '******';
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
