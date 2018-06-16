import React, { Component } from 'react';
import { Input, Select, Row, Col } from 'antd';
import { mapValues, toPairs } from 'lodash';
const { TextArea } = Input;
const { Option } = Select;

export function FormItemTemplate({title, children}) {
  return (<Row className="ant-form-item">
    <Col className="ant-form-item-label">
      <label>{title}</label>
    </Col>
    <Col className="ant-form-item-control-wrapper">
      {children}
    </Col>
  </Row>);
}

const widgetMap = mapValues({
  boolean: {
    checkbox: "CheckboxWidget",
    radio: "RadioWidget",
    select: "SelectWidget",
    hidden: "HiddenWidget",
  },
  string: {
    text: "TextWidget",
    password: "PasswordWidget",
    email: "EmailWidget",
    hostname: "TextWidget",
    ipv4: "TextWidget",
    ipv6: "TextWidget",
    uri: "URLWidget",
    "data-url": "FileWidget",
    radio: "RadioWidget",
    select: "SelectWidget",
    textarea: "TextareaWidget",
    hidden: "HiddenWidget",
    date: "DateWidget",
    datetime: "DateTimeWidget",
    "date-time": "DateTimeWidget",
    "alt-date": "AltDateWidget",
    "alt-datetime": "AltDateTimeWidget",
    color: "ColorWidget",
    file: "FileWidget",
  },
  number: {
    text: "TextWidget",
    select: "SelectWidget",
    updown: "UpDownWidget",
    range: "RangeWidget",
    radio: "RadioWidget",
    hidden: "HiddenWidget",
  },
  integer: {
    text: "TextWidget",
    select: "SelectWidget",
    updown: "UpDownWidget",
    range: "RangeWidget",
    radio: "RadioWidget",
    hidden: "HiddenWidget",
  },
  array: {
    select: "SelectWidget",
    checkboxes: "CheckboxesWidget",
    files: "FileWidget",
  },
}, toPairs);

export default class BasicEditor extends Component {
  static get key() {
    return 'basic-editor';
  }

  static get name() {
    return 'Basic';
  }

  static filter(node) {
    return node.schema && node.schema.type !== 'array';
  }

  name() {
    return (<FormItemTemplate title="name">
      <Input
        value={this.props.node.name}
        onChange={e => this.props.updateNode({name:e.target.value})}
      />
    </FormItemTemplate>)
  }
  title() {
    return (<FormItemTemplate title="Title">
      <Input
        value={this.props.node.schema.title}
        onChange={e => this.props.updateSchema({title:e.target.value})}
      />
    </FormItemTemplate>);
  }
  description() {
    return (<FormItemTemplate title="Description">
      <TextArea
        value={this.props.node.schema.description}
        onChange={e => this.props.updateSchema({description:e.target.value})}
        autosize
      />
    </FormItemTemplate>);
  }

  classNames(){
    return (<FormItemTemplate title="Class Names">
      <Input
        value={this.props.node.uiSchema && this.props.node.uiSchema.classNames}
        onChange={e => this.props.updateUiSchema({'classNames':e.target.value})}
      />
    </FormItemTemplate>);
  }

  help() {
    return (<FormItemTemplate title="Help">
      <Input
        value={this.props.node.uiSchema && this.props.node.uiSchema['ui:help']}
        onChange={e => this.props.updateUiSchema({'ui:help':e.target.value})}
      />
    </FormItemTemplate>);
  }

  widgets() {
    const { updateUiSchema } = this.props;
    const { schema, uiSchema } = this.props.node
    if(!schema || !widgetMap[schema.type]) return null;
    return (<FormItemTemplate title="Widget">
      <Select
      mode="combobox"
      onChange={value=>updateUiSchema({'ui:widget':value?value:undefined})}
      value={uiSchema && uiSchema['ui:widget']}
      style={{ width: '100%' }}
      >
      {widgetMap[schema.type].map(([key, title])=><Option key={key}>{title}</Option>)}
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
