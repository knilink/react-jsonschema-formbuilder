import React from 'react';
import { JSONSchema7 } from 'json-schema';
import { FormBuilderContext } from '../FormBuilderContext';
import JsonEditor from '../JsonEditor';

export const SchemaView: React.FC<{}> = () => {
  const { schema, setSchema } = React.useContext(FormBuilderContext);
  return <JsonEditor value={schema} onChange={(value) => setSchema(value as JSONSchema7)} autoSize />;
};
