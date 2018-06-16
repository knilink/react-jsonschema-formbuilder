import React from 'react';

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

export function DefaultTemplate(props) {
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

export function DefaultObjectFieldTemplate(props) {
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
