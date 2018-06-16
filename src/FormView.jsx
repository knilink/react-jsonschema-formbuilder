import React, { Component } from 'react';
import { connect } from 'react-redux';
import Form from "./rjsf-patch/Form";
import {FieldTemplate, ObjectFieldTemplate} from './Template';

const schema = {
  type: 'object',
  properties: {
    myField:{type:'string'}
  }
}

const uiSchema =  {
  myField: {
    "ui:help": <div className="sidebar">some help</div>
  }
};

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
      />);
  }
}

export default connect(({tree:{present:[{schema, uiSchema}]}})=>({
  schema,
  uiSchema
}))(FormView);
