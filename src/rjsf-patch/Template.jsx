import React, { Component } from 'react';
import InlineEditor from '../InlineEditor';
import { Input } from 'antd';
import { connect } from 'react-redux';

const TextArea = Input.TextArea;

const REQUIRED_FIELD_SYMBOL = '*';

function Label(props) {
  const { label, required, id } = props;
  if (!label) {
    // See #312: Ensure compatibility with old versions of React.
    return <div />;
  }
  return (
    <label className="control-label" htmlFor={id}>
      {label}
      {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
    </label>
  );
}

class ExtendedInlineEditor extends InlineEditor {
  renderView() {
    return <span className="fb-test" onClick={this.onStartEditing}>
      {this.props.children}
    </span>;
  }
}

class InlineTextAreaEditor extends ExtendedInlineEditor {
  renderEditing() {
    return (
      <TextArea
        ref={r => this.input=r}
        value={this.state.value}
        onBlur={this.onCompleteEditing}
        onChange={this.onChange}
        autosize
        onKeyUp={e => {
            if (e.keyCode === 27 ){
              this.onCancelEditing();
            }
        }}
      />
    );
  }
}

function DefaultTemplate(props) {
  const {
    id,
    classNames,
    label,
    children,
    errors,
    help,
    description,
    hidden,
    required,
    displayLabel,
  } = props;
  if (hidden) {
    return children;
  }

  return (
    <div className={classNames}>
      {displayLabel && <Label label={label} required={required} id={id} />}
      {displayLabel && description ? description : null}
      {children}
      {errors}
      {help}
    </div>
  );
}

function DefaultObjectFieldTemplate(props) {
  const { TitleField, DescriptionField } = props;
  return (
    <fieldset>
      {(props.uiSchema["ui:title"] || props.title) && (
         <TitleField
           id={`${props.idSchema.$id}__title`}
           title={props.title || props.uiSchema["ui:title"]}
           required={props.required}
           formContext={props.formContext}
         />
      )}
      {props.description && (
         <DescriptionField
           id={`${props.idSchema.$id}__description`}
           description={props.description}
           formContext={props.formContext}
         />
      )}
      {props.properties.map(prop => prop.content)}
    </fieldset>
  );
}

export function fieldTemplateConnector(FieldTemplate) {
  return connect(
    ({tree:{present}})=>({tree:present}),
    (dispatch,{id, schema, uiSchema}) => ({
      updateTitle: title => dispatch({
        type:'TREE_UPDATE_NODE_BY_RJSF_ID',
        payload:{rjsfId:id, nodeUpdate:{schema:{...schema, title}}}}
      ),
      updateDescription: description => dispatch({
        type:'TREE_UPDATE_NODE_BY_RJSF_ID',
        payload:{rjsfId:id, nodeUpdate:{schema:{...schema, description}}}}
      ),
      updateHelp: help => dispatch({
        type:'TREE_UPDATE_NODE_BY_RJSF_ID',
        payload:{rjsfId:id, nodeUpdate:{uiSchema:{...uiSchema, 'ui:help':help}}}}
      )
    })
  )(props => {
    const {
      id,
      label,
      description,
      help,
      tree,
      schema,
      updateTitle,
      updateDescription,
      updateHelp
    } = props;
    const labelElement = label && (
      <ExtendedInlineEditor
        value={label}
        onChange={updateTitle}>
        {label}
      </ExtendedInlineEditor>
    );
    const descriptionElement = description && (
      <InlineTextAreaEditor
        value={description.props.description}
        onChange={updateDescription}>
        {description}
      </InlineTextAreaEditor>
    );
    const helpElement = help && (
      <ExtendedInlineEditor
        value={help.props.help}
        onChange={updateHelp}>
        {help}
      </ExtendedInlineEditor>
    );
    return (<div>
      {['object','array'].includes(schema.type)?null:<div className="pull-right"> {id} </div>}
      <FieldTemplate
      _label={label}
              _description={description}
              _help={help}
              {...props}
              label={labelElement}
              description={descriptionElement}
              help={helpElement}
      /></div>);
  });
}

export function objectFieldTemplateConnector(ObjectFieldTemplate) {
  return connect(
    ({tree:{present}})=>({tree:present}),
    (dispatch, {idSchema, schema}) => ({
      updateTitle: title => dispatch({
        type:'TREE_UPDATE_NODE_BY_RJSF_ID',
        payload:{rjsfId:idSchema.$id, nodeUpdate:{schema:{...schema,title}}}}
      ),
      updateDescription: description => dispatch({
        type:'TREE_UPDATE_NODE_BY_RJSF_ID',
        payload:{rjsfId:idSchema.$id, nodeUpdate:{schema:{...schema,description}}}}
      ),
    })
  )(props => {
    const { idSchema, title, description, updateTitle, updateDescription } = props;
    const titleElement = title && (
      <ExtendedInlineEditor
        value={title}
        onChange={updateTitle}>
        {title}
        <div className="pull-right"> {idSchema.$id} </div>
      </ExtendedInlineEditor>
    );
    const descriptionElement = description && (
      <InlineTextAreaEditor
        value={description}
        onChange={updateDescription}>
        {description}
      </InlineTextAreaEditor>
    );

    return (
      <ObjectFieldTemplate
      _title={title}
      _description={description}
      {...props}
      title={titleElement}
      description={descriptionElement}
      />
    );
  });
}

export const FieldTemplate = fieldTemplateConnector(DefaultTemplate);
export const ObjectFieldTemplate = objectFieldTemplateConnector(DefaultObjectFieldTemplate);
export default { FieldTemplate, ObjectFieldTemplate };
