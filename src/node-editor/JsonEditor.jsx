import React, { Component } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  if(!objA || !objB) {
    return false;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B'a keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}


class JsonEditor extends React.Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      string: JSON.stringify(value,null,2),
      value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if(!shallowEqual(nextProps.value,this.state.value)){
      this.setState({
        value: nextProps.value,
        string: JSON.stringify(nextProps.value,null,2),
        error: null
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.string !== this.state.string;
  }


  onChange = e => {
    const value = e.target.value;
    try {
      const obj = JSON.parse(value);
      this.setState({
        value: obj,
        string: value,
        error: null
      },()=>this.props.onChange(obj));
    } catch(error) {
      this.setState({
        string:value,
        error
      });
    }

  }
  render() {
    const {string} = this.state;
    return <TextArea {...this.props} value={string} onChange={this.onChange} />;
  }

}


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
