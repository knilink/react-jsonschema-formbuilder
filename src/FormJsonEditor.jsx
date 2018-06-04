import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col,Input } from 'antd';
const { TextArea } = Input;


class FormJsonEditor extends React.Component {
  render() {
    const {schema, uiSchema, setTree } = this.props;
    return <Row><Col span={12}>
      <TextArea
        value={JSON.stringify(schema, null, 2)}
        onChange={e=> setTree(JSON.parse(e.target.value))}
        autosize
      />
    </Col><Col span={12}>
      <TextArea
        value={JSON.stringify(uiSchema, null, 2)}
        onChange={e => setTree(null, JSON.parse(e.target.value))}
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
