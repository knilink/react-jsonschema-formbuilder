import React from 'react';
import InlineEditor from '../InlineEditor';
import { connect } from 'react-redux';
import { Input, Popconfirm, Tooltip } from 'antd';
import { SelectOutlined, DeleteOutlined } from '@ant-design/icons';
const { getNodeByRjsfId } = require('../core');
const { TextArea } = Input;

const ACTIVE_STYLE = { backgroundColor: '#bae7ff' };

class ExtendedInlineEditor extends InlineEditor {
  renderView() {
    return (
      <span className="fb-test" onClick={this.onStartEditing}>
        {this.props.children}
      </span>
    );
  }
}

class InlineTextAreaEditor extends ExtendedInlineEditor {
  renderEditing() {
    return (
      <TextArea
        ref={(r) => (this.input = r)}
        value={this.state.value}
        onBlur={this.onCompleteEditing}
        onChange={this.onChange}
        autoSize
        onKeyUp={(e) => {
          if (e.keyCode === 27) {
            this.onCancelEditing();
          }
        }}
      />
    );
  }
}

const ButtonGroup = connect(null, (dispatch, { id }) => ({
  select: () => dispatch({ type: 'ACTIVE_NODE_KEY_SET_BY_RJSF_ID', payload: id }),
  remove: () => dispatch({ type: 'TREE_REMOVE_NODE_BY_RJSF_ID', payload: id }),
}))((props) => {
  const { select, remove, id } = props;
  return (
    <Tooltip title={id} placement="right">
      <a href="#!">
        <SelectOutlined onClick={select} />
      </a>
      <Popconfirm title={`Remove ${id}?`} onConfirm={remove}>
        <a href="#!">
          <DeleteOutlined />
        </a>
      </Popconfirm>
    </Tooltip>
  );
});

export function fieldTemplateConnector(FieldTemplate) {
  return connect(
    ({ tree: { present }, activeNodeKey, settings: { isInlineMode } }, { id }) => {
      const n = getNodeByRjsfId(present, id);
      const active = n && n.key === activeNodeKey;
      return { tree: present, active, isInlineMode };
    },
    (dispatch, { id, schema, uiSchema }) => ({
      updateTitle: (title) =>
        dispatch({
          type: 'TREE_UPDATE_NODE_BY_RJSF_ID',
          payload: { rjsfId: id, nodeUpdate: { schema: { ...schema, title } } },
        }),
      updateDescription: (description) =>
        dispatch({
          type: 'TREE_UPDATE_NODE_BY_RJSF_ID',
          payload: { rjsfId: id, nodeUpdate: { schema: { ...schema, description } } },
        }),
      updateHelp: (help) =>
        dispatch({
          type: 'TREE_UPDATE_NODE_BY_RJSF_ID',
          payload: { rjsfId: id, nodeUpdate: { uiSchema: { ...uiSchema, 'ui:help': help } } },
        }),
    })
  )((props) => {
    const {
      id,
      label,
      description,
      help,
      schema,
      updateTitle,
      updateDescription,
      updateHelp,
      active,
      classNames,
      isInlineMode,
    } = props;
    if (!isInlineMode) return <FieldTemplate {...props} />;
    const labelElement = label && (
      <ExtendedInlineEditor value={label} onChange={updateTitle}>
        {label}
      </ExtendedInlineEditor>
    );
    const descriptionElement = description && (
      <InlineTextAreaEditor value={description.props.description} onChange={updateDescription}>
        {description}
      </InlineTextAreaEditor>
    );
    const helpElement = help && (
      <ExtendedInlineEditor value={help.props.help} onChange={updateHelp}>
        {help}
      </ExtendedInlineEditor>
    );
    return (
      <div className={classNames} style={active ? ACTIVE_STYLE : null}>
        {['object', 'array'].includes(schema.type) ? null : (
          <div className="pull-right">
            {' '}
            <ButtonGroup id={id} />{' '}
          </div>
        )}
        <FieldTemplate
          _label={label}
          _description={description}
          _help={help}
          {...props}
          classNames={null}
          label={labelElement}
          description={descriptionElement}
          help={helpElement}
        />
      </div>
    );
  });
}

export function objectFieldTemplateConnector(ObjectFieldTemplate) {
  return connect(
    ({ tree: { present }, activeNodeKey, settings: { isInlineMode } }, { idSchema }) => {
      const n = idSchema && idSchema.$id && getNodeByRjsfId(present, idSchema.$id);
      const active = n && n.key === activeNodeKey;
      return { tree: present, active, isInlineMode };
    },
    (dispatch, { idSchema, schema }) => ({
      updateTitle: (title) =>
        dispatch({
          type: 'TREE_UPDATE_NODE_BY_RJSF_ID',
          payload: { rjsfId: idSchema.$id, nodeUpdate: { schema: { ...schema, title } } },
        }),
      updateDescription: (description) =>
        dispatch({
          type: 'TREE_UPDATE_NODE_BY_RJSF_ID',
          payload: { rjsfId: idSchema.$id, nodeUpdate: { schema: { ...schema, description } } },
        }),
    })
  )((props) => {
    const { idSchema, title, description, updateTitle, updateDescription, active, isInlineMode } = props;
    if (!isInlineMode) return <ObjectFieldTemplate {...props} />;
    const titleElement = title && (
      <span>
        <ExtendedInlineEditor value={title} onChange={updateTitle}>
          {title}
        </ExtendedInlineEditor>
        <span className="pull-right">
          {' '}
          <ButtonGroup id={idSchema.$id} />{' '}
        </span>
      </span>
    );
    const descriptionElement = description && (
      <InlineTextAreaEditor value={description} onChange={updateDescription}>
        {description}
      </InlineTextAreaEditor>
    );

    return (
      <div style={active ? ACTIVE_STYLE : null}>
        <ObjectFieldTemplate
          _title={title}
          _description={description}
          {...props}
          title={titleElement}
          description={descriptionElement}
        />
      </div>
    );
  });
}
