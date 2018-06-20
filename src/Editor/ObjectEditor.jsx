import React from 'react';
import { Select } from 'antd';
import BasicEditor, { FormItemTemplate } from './BasicEditor';
const { Option } = Select;

export default class ObjectEditor extends BasicEditor {
  static get key() {
    return 'object-editor';
  }

  static get name() {
    return 'Object';
  }

  static filter(node) {
    return node.schema && node.schema.type === 'object';
  }

  required() {
    const { node, updateSchema } = this.props;
    return (<FormItemTemplate title="Required">
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        onChange={required=>updateSchema({required:required.length?required:undefined})}
        value={node.schema.required}
      >
        {(node.children||[]).map(node=>(<Option key={node.name}>{node.name}</Option>))}
      </Select>
    </FormItemTemplate>);
  }

  render() {
    return <form className="ant-form ant-form-horizontal">
      {this.name()}
      <fieldset>
        <legend>Schema</legend>
        {this.title()}
        {this.description()}
        {this.required()}
      </fieldset>
      <fieldset>
        <legend>uiSchema</legend>
        {this.widgets()}
        {this.classNames()}
        {this.help()}
      </fieldset>
    </form>;
  }
}
