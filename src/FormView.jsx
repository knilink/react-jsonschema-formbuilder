import React from 'react';
import { connect } from 'react-redux';
import Form from "./rjsf-patch/Form";
import {FieldTemplate, ObjectFieldTemplate} from './Template';

class FormView extends React.Component {
  render() {
    if(!this.props.schema) {
      return null;
    }
    return (<Form
              schema={this.props.schema}
              uiSchema={this.props.uiSchema}
              FieldTemplate={FieldTemplate}
      ObjectFieldTemplate={ObjectFieldTemplate}
      idPrefix={this.props.name}
      />);
  }
}

export default connect(({tree:{present:[{name, schema, uiSchema}]}})=>({
  schema,
  uiSchema,
  name
}))(FormView);
