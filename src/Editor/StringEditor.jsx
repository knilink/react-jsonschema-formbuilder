import React, { Component } from 'react';
import { Input, InputNumber, Row, Col } from 'antd';
import BasicEditor, { FormItemTemplate } from './BasicEditor';
const { Group } = Input;

export default class StringEditor extends BasicEditor {
  static get key() {
    return 'string-editor';
  }

  static get name() {
    return 'String';
  }

  static filter(node) {
    return node.schema && node.schema.type === 'string';
  }

  length() {
    const { node, updateSchema } = this.props;
    const { minLength, maxLength } = node.schema;
    return (<FormItemTemplate title="Length">
      <Group compact>
        <InputNumber
          onChange={n=>{
              typeof(n)==='string' && !n && updateSchema({minLength:undefined});
              typeof(n)==='number' && updateSchema({minLength:n});
          }}
          max={maxLength}
          style={{ width: 100, textAlign: 'center' }}
          placeholder="Minimum"
        />
        <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
        <InputNumber
          onChange={n=>{
              typeof(n)==='string' && !n && updateSchema({maxLength:undefined});
              typeof(n)==='number' && updateSchema({maxLength:n});
          }}
          min={minLength}
          style={{ width: 100, textAlign: 'center', borderLeft: 0 }}
          placeholder="Maximum"
        />
      </Group>
    </FormItemTemplate>);
  }

  render() {
    return <form className="ant-form ant-form-horizontal">
      {this.name()}
      <fieldset>
        <legend>Schema</legend>
        {this.title()}
        {this.description()}
        {this.length()}
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
