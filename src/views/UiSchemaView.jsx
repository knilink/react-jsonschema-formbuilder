import React from 'react';
import { connect } from 'react-redux';
import JsonEditor from '../JsonEditor';

export default connect(
  ({
    tree: {
      present: [{ uiSchema }],
    },
  }) => ({ uiSchema }),
  (dispatch) => ({
    setTree: (uiSchema) =>
      dispatch({
        type: 'TREE_SET_TREE',
        payload: {
          uiSchema,
        },
      }),
  })
)(({ uiSchema, setTree }) => <JsonEditor value={uiSchema} onChange={(value) => setTree(value)} autosize />);
