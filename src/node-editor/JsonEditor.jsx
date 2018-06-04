import React, { Component } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

export default class JsonEditor extends React.Component {
  static get key() {
    console.log('nnnnnnnn');
    return 'json-editor';
  }
  static get name() {
    console.log('kkkkk');
    return 'Json Editor';
  }
  static filter(node) {
    return true;
  }

  render() {
    const { node } = this.props;
    const { schema, uiSchema, title } = node;
    const { properties, items, additionalItems, ...rschema } = schema;
    return <div>
      <Input value={title} />
      <TextArea value={JSON.stringify(rschema, null, 2)} autosize/>
      <TextArea value={JSON.stringify(uiSchema, null, 2)} autosize/>
    </div>;
  }
}
