import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import JsonEditor from '../JsonEditor';

function name2title(name) {
  if (!name) return name;
  const words = name.indexOf('_') >= 0 ? name.split('_') : name.split(/(?=[A-Z])/);
  return words.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
}

function json2schema(data, name) {
  const title = name ? name2title(name) : undefined;
  if (typeof data === 'number') {
    return {
      type: Number.isInteger(data) ? 'integer' : 'number',
      title,
    };
  }
  if (typeof data === 'string') {
    return {
      type: 'string',
      title,
    };
  }
  if (typeof data === 'boolean') {
    return {
      type: 'boolean',
      title,
    };
  }
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        title,
        items: json2schema(data[0]),
      };
    }
    let properties = {};
    for (const i in data) {
      const s = json2schema(data[i], i);
      if (s) {
        properties[i] = s;
      }
    }
    return {
      type: 'object',
      title,
      properties,
    };
  }
  return undefined;
}

export default connect(
  ({ formData }) => ({ formData }),
  (dispatch) => ({
    setFormData: (formData) =>
      dispatch({
        type: 'FORM_DATA_SET',
        payload: formData,
      }),
    genForm: (formData) =>
      dispatch({
        type: 'TREE_SET_TREE',
        payload: {
          name: 'root',
          schema: json2schema(formData, 'form'),
          uiSchema: {},
        },
      }),
  })
)(({ formData, setFormData, genForm }) => (
  <div>
    <JsonEditor value={formData} onChange={(value) => setFormData(value)} autoSize />
    <Button type="primary" onClick={() => genForm(formData)}>
      Gen Form
    </Button>
    <Button onClick={() => setFormData({})}>Clear</Button>
  </div>
));
