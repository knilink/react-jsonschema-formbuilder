import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import JsonEditor from './JsonEditor';


class FormJsonEditor extends Component {
  render() {
    const {schema, uiSchema, setTree } = this.props;
    return <Row><Col span={12}>
      <JsonEditor
        value={schema}
        onChange={value=> setTree(value)}
        autosize
      />
    </Col><Col span={12}>
      <JsonEditor
        value={uiSchema}
        onChange={value => setTree(null, value)}
        autosize
      />
    </Col></Row>;
  }
}

export default connect(
  ({tree:{present:[{schema,uiSchema}]}})=>({schema,uiSchema}),
  (dispatch)=>({
    setTree: (schema, uiSchema) => dispatch({
      type:'TREE_SET_TREE',
      payload:{
        schema,
        uiSchema
      }
    })
  })
)(FormJsonEditor);
