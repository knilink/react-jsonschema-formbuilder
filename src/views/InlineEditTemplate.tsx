import * as React from 'react';
import { MiddlewareProps } from '@gravel-form/antd';
import { toJSONSchemaPath, isRequired } from '@gravel-form/antd/lib/core';
import { get } from 'lodash';
import { Form, Col } from 'antd';
import { FormBuilderContext } from '../FormBuilderContext';
import { replaceSchemaNode } from '../utils';
import { InlineEditor } from '../InlineEditor';

export const FormItemTemplateMw: React.ComponentType<MiddlewareProps> = (props) => {
  const { schema, schemaPath, dataPath, next, errors, extraProps, formProps } = props;
  const { setSchema } = React.useContext(FormBuilderContext);

  if (typeof schema === 'boolean') return next(props);

  const id = toJSONSchemaPath(dataPath);
  const error = errors && errors.find(({ dataPath }) => dataPath === id);

  const label = schema.title || schemaPath[schemaPath.length - 1];

  return (
    <Form.Item
      label={
        <InlineEditor
          value={label.toString()}
          onChange={(title) => {
            setSchema(replaceSchemaNode(formProps.schema, schemaPath, { ...schema, title }));
          }}
        >
          {label}
        </InlineEditor>
      }
      extra={
        schema.description ? (
          <InlineEditor
            value={schema.description}
            onChange={(description) => {
              setSchema(replaceSchemaNode(formProps.schema, schemaPath, { ...schema, description }));
            }}
          >
            {schema.description}
          </InlineEditor>
        ) : null
      }
      {...(error && { help: error.message })}
      validateStatus={error ? 'error' : ''}
      hasFeedback
      required={isRequired(props)}
      {...get(extraProps, 'formItem')}
    >
      <div
        style={{ background: '#FFF' }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {next(props)}
      </div>
    </Form.Item>
  );
};

export const ColMw: React.ComponentType<MiddlewareProps> = (props) => {
  const { schema, schemaPath, extraProps, parent, next } = props;

  const colRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const { selectedNodePath, setSelectedNodePath } = React.useContext(FormBuilderContext);
  const selected = selectedNodePath ? selectedNodePath.join('.') === schemaPath.join('.') : false;

  const handleMouseEnter = React.useCallback<React.MouseEventHandler>(() => setHover(true), [setHover, colRef]);
  const handleMouseLeave = React.useCallback<React.MouseEventHandler>(() => setHover(false), [setHover, colRef]);
  const handleClick = React.useCallback<React.MouseEventHandler>(
    () => setSelectedNodePath(selected ? null : schemaPath),
    [schemaPath, setSelectedNodePath]
  );

  const atom = typeof schema === 'boolean' || schema.type !== 'object';

  if (!parent) return next(props);

  return (
    <Col
      ref={colRef}
      style={selected ? { backgroundColor: '#bae7ff' } : hover ? { backgroundColor: '#f5f5f5' } : {}}
      onMouseEnter={atom ? handleMouseEnter : null}
      onMouseLeave={atom ? handleMouseLeave : null}
      onClick={atom ? handleClick : null}
      span="24"
      {...get(extraProps, 'col')}
    >
      {next(props)}
    </Col>
  );
};
