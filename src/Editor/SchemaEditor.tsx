import * as React from 'react';
import { JSONSchema7 } from 'json-schema';
import { Input, List, Divider, Button, Menu, Dropdown } from 'antd';
import { EditOutlined, CaretDownOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { FormBuilderContext } from '../FormBuilderContext';
import { replaceSchemaNode } from '../utils';

interface ISchemaEditor {
  schema: JSONSchema7;
  onUpdate: (schema: JSONSchema7) => void;
}

const editors: {
  key: string;
  title: string;
  setDefault: (schema: JSONSchema7) => JSONSchema7;
  handleRemove: (schema: JSONSchema7) => JSONSchema7;
  Component: React.FC<ISchemaEditor>;
}[] = [
  {
    key: 'title',
    title: 'Title',
    setDefault: (schema) => ({ ...schema, title: '' }),
    handleRemove: (schema) => {
      const { title, ...rest } = schema;
      return rest;
    },
    Component: ({ schema, onUpdate }) => {
      return <Input value={schema.title} onChange={(e) => onUpdate({ ...schema, title: e.target.value })} />;
    },
  },
  {
    key: 'description',
    title: 'Description',
    setDefault: (schema) => ({ ...schema, description: '' }),
    handleRemove: (schema) => {
      const { description, ...rest } = schema;
      return rest;
    },
    Component: ({ schema, onUpdate }) => {
      return (
        <Input value={schema.description} onChange={(e) => onUpdate({ ...schema, description: e.target.value })} />
      );
    },
  },
];

export const SchemaEditor: React.FC = () => {
  const { selectedSchema, selectedNodePath, schema, setSchema } = React.useContext(FormBuilderContext);

  if (!selectedNodePath || !selectedSchema || typeof selectedSchema === 'boolean') return null;

  const handleUpdate = (newSchemaNode: JSONSchema7) => {
    setSchema(replaceSchemaNode(schema, selectedNodePath, newSchemaNode));
  };

  const activeEditor = editors.filter(({ key }) => Object.hasOwnProperty.call(selectedSchema, key));
  const inactiveEditor = editors
    .filter(({ key }) => !Object.hasOwnProperty.call(selectedSchema, key))
    .map(({ key, title, setDefault }) => (
      <Menu.Item key={key} onClick={() => handleUpdate(setDefault(selectedSchema))}>
        {title}
      </Menu.Item>
    ));

  return (
    <List
      itemLayout="horizontal"
      dataSource={[
        ...activeEditor.map(({ key, Component, title, handleRemove }) => (
          <List.Item
            key={key}
            actions={[
              <Button
                onClick={() => handleUpdate(handleRemove(selectedSchema))}
                size="small"
                shape="circle"
                icon={<CloseOutlined />}
              />,
            ]}
          >
            <List.Item.Meta title={title} description={<Component schema={selectedSchema} onUpdate={handleUpdate} />} />
          </List.Item>
        )),
        <List.Item key={'button'}>
          <Dropdown trigger={['click']} overlay={<Menu>{inactiveEditor}</Menu>}>
            <Button style={{ width: '100%' }} type="primary" icon={<PlusOutlined />} />
          </Dropdown>
        </List.Item>,
      ]}
      renderItem={(a) => a}
    />
  );
};
