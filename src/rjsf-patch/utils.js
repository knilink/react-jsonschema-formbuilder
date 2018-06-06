import React from 'react';
import { Alert } from 'antd';
import ArrayField from './ArrayField';
import BooleanField from './BooleanField';
import StringField from './StringField';
import  { getWidget as _getWidget } from 'react-jsonschema-form/lib/utils';
export * from 'react-jsonschema-form/lib/utils';


function Error(msg) {
  return ()=>(
      <Alert message={msg} type="error" showIcon />
  );
}

export function getWidget(...args) {
  try {
    return _getWidget(...args);
  } catch(e) {
    return Error(e.toString());
  }
}

export function getDefaultRegistry() {
  const fields = {
    ...require("react-jsonschema-form/lib/components/fields").default,
    ArrayField,
    StringField,
    BooleanField,
  };
  return {
    fields,
    widgets: require("react-jsonschema-form/lib/components/widgets").default,
    definitions: {},
    formContext: {},
  };
}
