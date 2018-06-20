import React from 'react';
import { connect } from 'react-redux';
import Form from "./rjsf-patch/Form";
import {FieldTemplate, ObjectFieldTemplate} from './Template';

class FormView extends React.Component {
  render() {
    if(!this.props.schema) {
      return null;
    }
    const {
      name,
      schema,
      uiSchema,
      liveValidate
    } = this.props;
    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        liveValidate={liveValidate}
        FieldTemplate={FieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        idPrefix={name}
      />
    );
  }
}

export default connect(({
  tree:{present:[{name, schema, uiSchema}]},
  settings:{isLiveValidate}
})=>({
  name,
  schema,
  uiSchema,
  liveValidate: isLiveValidate
}))(FormView);
