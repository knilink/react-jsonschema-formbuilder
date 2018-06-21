import React from 'react';
import { connect } from 'react-redux';
import JsonEditor from '../JsonEditor';

export default connect(
  ({tree:{present:[{schema}]}})=>({schema}),
  (dispatch)=>({
    setTree: (schema) => dispatch({
      type:'TREE_SET_TREE',
      payload:{
        schema,
      }
    })
  })
)(({schema, setTree})=>(
    <JsonEditor
      value={schema}
      onChange={value=> setTree(value)}
      autosize
    />
));
