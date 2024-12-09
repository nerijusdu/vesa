import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Checkbox, Divider, Flex, FormLabel, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Controller, FieldArrayWithId, useFieldArray, useFormContext } from 'react-hook-form';
import FormInput from '../../components/form/formInput';
import FormSelect, { NamedValue } from '../../components/form/formSelect';
import { RunContainerRequest } from './containers.types';

const restartPolicies = [
  { name: 'No', value: 'no' },
  { name: 'On failure', value: 'on-failure' },
  { name: 'Always', value: 'always' },
  { name: 'Unless stopped', value: 'unless-stopped' },
];

const mountTypes = [
  { name: 'Bind (directory)', value: 'bind' },
  { name: 'Volume', value: 'volume' },
];

export type ContainerFieldsProps = {
  networkOptions: NamedValue<string>[] | undefined;
  hideTemplateCheckbox?: boolean;
}

const ContainerFields: React.FC<ContainerFieldsProps> = ({ networkOptions, hideTemplateCheckbox }) => {
  const [showRetryCount, setShowRetryCount] = useState(false);
  const { register, control, formState: { errors } } = useFormContext<RunContainerRequest>();

  return (
    <>
      <FormInput
        {...register('image')}
        errors={errors}
        label="Image"
        placeholder="postgres:latest"
        required
      />
      <Controller
        control={control}
        name='isLocal'
        render={({ field: { onChange, value, ref } }) => (
          <Checkbox
            onChange={onChange}
            ref={ref}
            isChecked={value}
          >
            Local image
          </Checkbox>
        )}
      />
      <FormInput
        {...register('name')}
        errors={errors}
        label="Name"
        placeholder="postgres instance"
      />
      <FormInput
        {...register('command')}
        errors={errors}
        label="Command"
        placeholder="postgres -p 5432"
      />
      <FormSelect
        {...register('restartPolicy.name', {
          onChange: e => {
            setShowRetryCount(e.target.value === 'on-failure');
          },
        })}
        label="Restart policy"
        data={restartPolicies}
        errors={errors}
      />
      {showRetryCount && (
        <FormInput
          {...register('restartPolicy.maximumRetryCount')}
          label="Retry count"
          errors={errors}
          placeholder="5"
        />
      )}


      <Divider my={2} />

      <NetworkFields networkOptions={networkOptions} />

      <Divider my={2} />

      <PortFields />

      <Divider my={2} />

      <MountFields />

      <Divider my={2} />

      <EnvVarFields />

      <Divider my={2} />

      <TraefikFields />

      {!hideTemplateCheckbox && (
        <Checkbox {...register('saveAsTemplate')}>
          Save as a template
        </Checkbox>
      )}

      <Divider my={2} />
    </>
  );
};

export const NetworkFields: React.FC<Pick<ContainerFieldsProps, 'networkOptions'>> = ({ networkOptions }) => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'networks' });
  if (!networkOptions) {
    return null;
  }

  return (
    <>
      <FormLabel>Networks</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormSelect
            {...register(`networks.${i}.networkId` as const)}
            data={networkOptions}
            errors={errors}
            placeholder="Select network"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Network'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ networkId: '', networkName: '' })}>
        Add network
      </Button>
    </>
  );
};

export const PortFields: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'ports' });

  return (
    <>
      <FormLabel>Ports</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormInput
            {...register(`ports.${i}.value` as const)}
            errors={errors}
            placeholder="5432:5432"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Port'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ value: '' })}>
        Assign port
      </Button>
    </>
  );
};

export const MountFields: React.FC = () => {
  const { control } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'mounts' });

  return (
    <>
      <FormLabel>Mounts</FormLabel>
      {fields.map((field, i) => (
        <MountField
          key={field.id}
          field={field}
          i={i}
          onRemove={() => remove(i)}
        />
      ))}

      <Button variant="outline" onClick={() => append({ type: 'bind', source: '', target: '' })}>
        Add mount
      </Button>
    </>
  );
};

type MountFieldProps = {
  field: FieldArrayWithId<RunContainerRequest, 'mounts', 'id'>;
  i: number;
  onRemove: () => void;
}

const MountField = ({ field, i, onRemove }: MountFieldProps) => {
  const { register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const [type, setType] = useState(field.type);

  return (
    <Flex gap={2}>
      <FormSelect
        {...register(`mounts.${i}.type`, {
          onChange: e => {
            setType(e.target.value);
          },
        })}
        data={mountTypes}
        errors={errors}
        label="Type"
      />
      {type === 'bind' && (
        <FormInput
          {...register(`mounts.${i}.source` as const)}
          errors={errors}
          label="Source"
          placeholder="/path/to/host"
        />
      )}
      {type === 'volume' && (
        <FormInput
          {...register(`mounts.${i}.name` as const)}
          errors={errors}
          label="Name"
          placeholder="my-volume"
        />
      )}
      <FormInput
        {...register(`mounts.${i}.target` as const)}
        errors={errors}
        label="Target"
        placeholder="/path/to/container"
      />
      <IconButton
        icon={<DeleteIcon />}
        aria-label='Remove Mount'
        size="md"
        colorScheme="red"
        onClick={onRemove}
        alignSelf="flex-end"
        mb={2}
      />
    </Flex>
  );
};

export const EnvVarFields: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({ control, name: 'envVars' });

  return (
    <>
      <FormLabel>Environment Variables</FormLabel>
      {fields.map((field, i) => (
        <Flex key={field.id} gap={2}>
          <FormInput
            {...register(`envVars.${i}.key` as const)}
            errors={errors}
            label="Key"
            placeholder="POSTGRES_PASSWORD"
          />
          <FormInput
            {...register(`envVars.${i}.value` as const)}
            errors={errors}
            label="Value"
            placeholder="password"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove Environment Variable'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
            alignSelf="flex-end"
            mb={2}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ key: '', value: '' })}>
        Add environment variable
      </Button>
    </>
  );
};

export const TraefikFields: React.FC = () => {
  const { formState: { errors }, control, register } = useFormContext<RunContainerRequest>();
  const { fields, append, remove } = useFieldArray({
    control, name: 'domain.pathPrefixes',
  });
  const { fields: headers, append: appendHeaders, remove: removeHeaders } = useFieldArray({
    control, name: 'domain.headers',
  });

  return (
    <>
      <FormLabel>Domain routing setup</FormLabel>
      <FormInput
        {...register('domain.host')}
        errors={errors}
        label="Domain"
        placeholder="example.com"
      />
      <FormLabel>Path prefix (optional)</FormLabel>
      {fields.map((f, i) => (
        <Flex key={f.id} gap={2}>
          <FormInput
            {...register(`domain.pathPrefixes.${i}.value` as const)}
            errors={errors}
            placeholder="/foo"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove prefix'
            size="md"
            colorScheme="red"
            onClick={() => remove(i)}
          />
        </Flex>
      ))}

      <Button variant="outline" onClick={() => append({ value: '' })}>
        Add prefix
      </Button>

      <Controller
        control={control}
        name='domain.stripPrefix'
        render={({ field: { onChange, value, ref } }) => (
          <Checkbox
            onChange={onChange}
            ref={ref}
            isChecked={value}
            isDisabled={!fields.length}
          >
            Stripe prefix for requests
          </Checkbox>
        )}
      />

      <FormSelect
        {...register('domain.entrypoints.0')}
        errorField="entrypoint"
        errors={{
          ...errors,
          entrypoint: errors?.domain?.entrypoints?.[0]
            ? { message: 'Select an entrypoint' }
            : undefined as any,
        }}
        label="Entrypoint"
        data={[
          { name: 'http', value: 'web' },
          { name: 'https (with redirect http -> https)', value: 'websecure' },
        ]}
      />

      <FormLabel>Custom headers (optional)</FormLabel>
      {headers.map((f, i) => (
        <Flex key={f.id} gap={2}>
          <FormInput
            {...register(`domain.headers.${i}.name` as const)}
            errors={errors}
            placeholder="X-Frame-Options"
          />
          <FormInput
            {...register(`domain.headers.${i}.value` as const)}
            errors={errors}
            placeholder="DENY"
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label='Remove header'
            size="md"
            colorScheme="red"
            onClick={() => removeHeaders(i)}
          />
        </Flex>
      ))}
      <Button variant="outline" onClick={() => appendHeaders({ name: '', value: '' })}>
        Add header
      </Button>
    </>
  );
};

export default ContainerFields;
