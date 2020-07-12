import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import get from 'lodash/get';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { MiddlewareProps } from '@gravel-form/antd';
import { SchemaPath, getSchemaByPath } from './utils';

interface ISettings {
  formWidth: number;
  leftSiderWidth: number;
  rightSiderWidth: number;
  isInlineMode: boolean;
  isLiveValidate: boolean;
  subViews: ('schema' | 'extraProps' | 'formData')[];
}

export interface SettingsContext {
  settings: ISettings;
  setSettings: Dispatch<SetStateAction<ISettings>>;
}

export interface IFormBuilderContext {
  schema: JSONSchema7;
  selectedSchema: JSONSchema7Definition | null;
  setSchema: Dispatch<SetStateAction<JSONSchema7>>;
  extraProps: any;
  selectedExtraProps: any;
  setExtraProps: Dispatch<SetStateAction<any>>;
  selectedNodePath: SchemaPath | null;
  setSelectedNodePath: Dispatch<SetStateAction<SchemaPath | null>>;
}

export const FormBuilderContext = React.createContext<IFormBuilderContext>({
  schema: {},
  selectedSchema: null,
  setSchema: () => {},
  extraProps: {},
  selectedExtraProps: {},
  setExtraProps: () => {},
  selectedNodePath: null,
  setSelectedNodePath: () => {},
});

const defaultSettings: ISettings = {
  leftSiderWidth: 300,
  rightSiderWidth: 360,
  formWidth: 600,
  isInlineMode: true,
  subViews: ['schema', 'extraProps', 'formData'],
  isLiveValidate: false,
};

export const SettingsContext = React.createContext<SettingsContext>({
  settings: defaultSettings,
  setSettings: () => {},
});

export const Provider: React.FC<{ defaultSchema: JSONSchema7; defaultExtraProps: any }> = ({
  defaultSchema,
  defaultExtraProps,
  children,
}) => {
  const [schema, setSchema] = React.useState(defaultSchema);
  const [extraProps, setExtraProps] = React.useState(defaultExtraProps);
  const [settings, setSettings] = React.useState(defaultSettings);
  const [selectedNodePath, setSelectedNodePath] = React.useState<SchemaPath | null>(['properties', 'bio']);
  const selectedSchema = React.useMemo(() => (selectedNodePath && getSchemaByPath(schema, selectedNodePath)) || null, [
    schema,
    selectedNodePath,
  ]);

  const selectedExtraProps = React.useMemo(() => (selectedNodePath && get(extraProps, selectedNodePath)) || null, [
    extraProps,
    selectedNodePath,
  ]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <FormBuilderContext.Provider
        value={{
          schema,
          setSchema,
          extraProps,
          setExtraProps,
          selectedNodePath,
          setSelectedNodePath,
          selectedSchema,
          selectedExtraProps,
        }}
      >
        {children}
      </FormBuilderContext.Provider>
    </SettingsContext.Provider>
  );
};
