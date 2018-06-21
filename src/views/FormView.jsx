import React from 'react';
import { connect } from 'react-redux';
import Form from "../rjsf-patch/Form";
import {FieldTemplate, ObjectFieldTemplate} from '../Template';

class FormView extends React.Component {
  render() {
    if(!this.props.schema) {
      return null;
    }
    const {
      name,
      schema,
      uiSchema,
      formData,
      setFormData,
      liveValidate
    } = this.props;
    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        liveValidate={liveValidate}
        FieldTemplate={FieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        idPrefix={name}
        onChange={setFormData}
      />
    );
  }
}

export default connect(({
  tree:{present:[{name, schema, uiSchema}]},
  formData,
  settings:{isLiveValidate},
})=>({
  name,
  schema,
  uiSchema,
  formData,
  liveValidate: isLiveValidate
}),
  dispatch => ({
    setFormData: ({formData}) => dispatch({
      type:'FORM_DATA_SET',
      payload: formData
    })
  })
)(FormView);
