import React, { Component } from 'react';
import JsonEditor from '../JsonEditor';
import { Input } from 'antd';
const { TextArea } = Input;

export default class NodeJsonEditor extends React.Component {
  static get key() {
    return 'json-editor';
  }
  static get name() {
    return 'Json Editor';
  }
  static filter(node) {
    return true;
  }

  constructor(props) {
    super(props);
    const {schema, uiSchema} = props;
    this.state = {
      schemaJsonString:JSON.stringify(schema,null,2),
      uiSchemaJsonString:JSON.stringify(schema,null,2),
      schema,
      uiSchema
    };
  }

  render() {
    const { node, updateNode } = this.props;
    const { schema, uiSchema, title } = node;
    const { properties, items, additionalItems, ...rschema } = schema;
    return <div>
      <Input value={node.title} onChange={e => updateNode({title:e.target.value})} />
      <JsonEditor value={rschema} onChange={schema=>updateNode({schema}) } autosize/>
      <JsonEditor value={uiSchema} onChange={uiSchema=>updateNode({uiSchema}) } autosize/>
    </div>;
  }
}
