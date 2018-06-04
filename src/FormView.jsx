import React, { Component } from 'react';
import { connect } from 'react-redux';
import Form from "react-jsonschema-form";


class FormView extends React.Component {
  render() {
    if(!this.props.schema) {
      return null;
    }
    console.log(this.props.schema);
    return <Form schema={this.props.schema} uiSchema={this.props.uiSchema} />
  }
}

export default connect(({tree:{present:[{schema, uiSchema}]}})=>({
  schema,
  uiSchema
}))(FormView);
