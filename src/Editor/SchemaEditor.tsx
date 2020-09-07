import * as React from 'react';
import isNil from 'lodash/isNil';
import toString from 'lodash/toString';
import { JSONSchema7 } from 'json-schema';
import { Input, List, Divider, Button, Menu, Dropdown, Row, Col } from 'antd';
import { EditOutlined, CaretDownOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { FormBuilderContext } from '../FormBuilderContext';
import { replaceSchemaNode } from '../utils';

import {
  Form,
  presetMws,
  SubmitButtonWithValidationMw,
  FieldsetTemplateMw,
  RowMw,
  MiddlewareProps,
} from '@gravel-form/antd';

import { ExtraPropsMw, LocalRefMw, FixedObjectMw, FixedArrayMw } from '@gravel-form/antd/lib/core';
import { formControlMws } from '@gravel-form/antd/lib/preset';

const FormControlTemplate: React.ComponentType<MiddlewareProps> = (props) => {
  const { schema, schemaPath, next, data } = props;
  if (typeof schema === 'boolean') return next(props);
  const title = schema.title || schemaPath[schemaPath.length - 1];

  return (
    <Row gutter={[16, 16]}>
      <Col span={8} style={{ textAlign: 'right' }}>
        {title}:
      </Col>
      <Col span={16}>
        <div style={{ background: '#f0f0f0', width: '100%' }}>{isNil(data) ? <>&#8203;</> : toString(data)}</div>
      </Col>
    </Row>
  );
};

const mws = [ExtraPropsMw, FieldsetTemplateMw, FixedObjectMw, FixedArrayMw, FormControlTemplate];

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
  {
    key: 'length',
    title: 'Length',
    setDefault: (schema) => ({ ...schema, length: undefined }),
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
export const SchemaEditor_: React.FC = () => {
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

const Foo = () => {
  const { schema, selectedSchema, selectedNodePath, setSchema } = React.useContext(FormBuilderContext);
  if (!selectedNodePath || !selectedSchema || typeof selectedSchema === 'boolean') return null;
  const handleUpdate = (newSchemaNode: JSONSchema7) => {
    setSchema(replaceSchemaNode(schema, selectedNodePath, newSchemaNode));
  };
  return (
    <Form
      size="small"
      labelCol={{
        xs: { span: 24 },
        sm: { span: 6 },
      }}
      schema={{
        type: 'object',
        properties: {
          title: { type: 'string', title: 'Title' },
          description: { type: 'string', title: 'Description' },
        },
      }}
      extraProps={{
        properties: {
          description: {
            component: 'TextArea',
          },
        },
      }}
      middlewares={mws}
      data={selectedSchema}
      onChange={handleUpdate as any}
    />
  );
};

export const SchemaEditor = Foo;
