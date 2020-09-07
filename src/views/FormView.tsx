import * as React from 'react';
import { Form, SubmitButtonWithValidationMw, FieldsetTemplateMw, RowMw } from '@gravel-form/antd';
import { ExtraPropsMw, LocalRefMw, FixedObjectMw, FixedArrayMw } from '@gravel-form/antd/lib/core';
import { FormBuilderContext } from '../FormBuilderContext';
import { FormItemTemplateMw, ColMw } from './InlineEditTemplate';

import { formControlMws } from '@gravel-form/antd/lib/preset';

const mws = [
  SubmitButtonWithValidationMw,
  ExtraPropsMw,
  LocalRefMw,
  ColMw,
  FieldsetTemplateMw,
  RowMw,
  FixedObjectMw,
  FixedArrayMw,
  FormItemTemplateMw,
  ...formControlMws.slice(1),
];

export const FormView: React.FC = () => {
  const { schema, extraProps } = React.useContext(FormBuilderContext);
  return <Form schema={schema} extraProps={extraProps} middlewares={mws} layout="vertical" />;
};
