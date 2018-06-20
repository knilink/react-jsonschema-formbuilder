import React from 'react';
import { Input, Select, Row, Col, Icon, Button, List, Dropdown, Menu } from 'antd';
import lodash from 'lodash';
const { TextArea } = Input;
const { Option } = Select;

export function _FormItemTemplate({title, children}) {
  return (<Row className="ant-form-item">
    <Col className="ant-form-item-label">
      <label>{title}</label>
    </Col>
    <Col className="ant-form-item-control-wrapper">
      {children}
    </Col>
  </Row>);
}

export function FormItemTemplate({title, children, remove}) {
  return (<List.Item actions={
    remove?[<Button onClick={remove} size="small" type="danger" shape="circle" icon="close" />]:null
  }>
    <List.Item.Meta title={title} description={children} />
  </List.Item>);
}

class TimeThrottle extends React.Component {
  throttle = 1000
  editing = (<Icon type="edit" />)
  constructor(props) {
    super(props);
    this.state = {
      timer: null,
      value: props.value
    };
  }

  componentWillUnmount() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
      this.setState({timer: null});
      this.props.onChange(this.state.value);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value!==this.state.value) {
      if (this.state.timer) {
        clearTimeout(this.state.timer);
        this.props.onChange(this.state.value);
      }
      this.setState({
        value: nextProps.value,
        timer: null
      });
    }
  }

  onChange = value => {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      value: value,
      timer: setTimeout(()=>{
        this.setState({timer:null});
        this.props.onChange(this.state.value);
      }, this.throttle)
    });
  }

  onBlur = () => {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: null
    });
    this.props.onChange(this.state.value);
  }

  onRemove = () => {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: null
    });
    this.props.onChange(undefined);
  }

  render() {
    return null;
  }
}

class TimeThrottleInput extends TimeThrottle {
  render() {
    const { title, ...rest } = this.props;
    return <FormItemTemplate
             title={<span>{title}{this.state.timer?this.editing:null}</span>}
             remove={this.onRemove}
           >
      <Input {...rest} value={this.state.value} onChange={e=>this.onChange(e.target.value)} onBlur={this.onBlur} />
    </FormItemTemplate>
  }
}

class TimeThrottleTextArea extends TimeThrottle {
  render() {
    const { title, ...rest } = this.props;
    const titleElement = <span>{title}{this.state.timer?this.editing:null}</span>;
    return <FormItemTemplate title={titleElement} remove={this.onRemove}>
      <TextArea {...rest} value={this.state.value} onChange={e=>this.onChange(e.target.value)} onBlur={this.onBlur} />
    </FormItemTemplate>;
  }
}

const widgetMap = {
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
}

const widgets = lodash(widgetMap)
  .toPairs()
  .flatMap(
    ([type, widgets])=>
      lodash(widgets)
      .toPairs()
      .map(([widget])=>[widget, type])
      .value()
  )
  .groupBy('0')
  .toPairs()
  .map(([widget, types])=>([widget,types.map(a=>a[1])]))
  .map(([widget, types])=>([
    (types.length>1 ?
     ({type})=>types.includes(type):
     (t=>({type})=>type===t)(types[0])),
    widget
  ]))
  .map(([filter,widget])=>{
    switch(widget) {
      case 'select':
      case 'radio':
        return [
          (schema, uiSchema) => schema.enum && filter(schema, uiSchema),
          widget
        ];

      default:
        return [filter, widget]
    }
  })
  .value();


export default class BasicEditor extends React.Component {
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
    return null;
  }

  title() {
    const value = this.props.node.schema && this.props.node.schema.title;
    // if(value === undefined) return null;
    return (<TimeThrottleInput
              title="Title"
              value={value}
              onChange={value => this.props.updateSchema({title:value || undefined})}
    />);
  }
  description() {
    const value = this.props.node.schema && this.props.node.schema.description;
    // if (value === undefined) return null;
    return (<TimeThrottleTextArea
              title="Description"
              value={value}
              onChange={value => this.props.updateSchema({description:value || undefined})}
              autosize
    />);
  }

  classNames() {
    const value = this.props.node.uiSchema && this.props.node.uiSchema.classNames;
    if (value === undefined) return null;
    return (<TimeThrottleInput
              title="Class Names"
              value={value}
              onChange={value => this.props.updateUiSchema({'classNames':value})}
    />);
  }

  placeholder() {
    const uiSchema = this.props.node.uiSchema || {};
    const uiOptions = uiSchema['ui:options'] || {};
    const value = uiOptions['placeholder'];
    if(value === undefined) return null;
    return (<TimeThrottleInput
              title="Placeholder"
              value={value}
              onChange={value => this.props.updateUiOptions({'placeholder':value})}
    />);
  }

  help() {
    const uiSchema = this.props.node.uiSchema || {};
    const value = uiSchema['ui:help'];
    if (value === undefined) return null;
    return (<TimeThrottleInput
              title="Help"
              value={value}
              onChange={value => this.props.updateUiSchema({'ui:help':value})}
    />);
  }

  widgets() {
    const { updateUiSchema } = this.props;
    const { schema, uiSchema } = this.props.node;
    const availableWidgets = widgets.filter(
      ([f])=>f(schema||{}, uiSchema||{})
    );
    if(!availableWidgets.length) return null;
    const value = (uiSchema || {})['ui:widget'];
    if(value === undefined) return null;
    return (<FormItemTemplate title="Widget" remove={()=>updateUiSchema({'ui:widget': undefined}) }>
      <Select
        onChange={value=>updateUiSchema({'ui:widget': value || null})}
        value={uiSchema && uiSchema['ui:widget']}
        style={{ width: '100%' }}
        showSearch
      >
        {availableWidgets.map(([_, key])=><Option key={key}>{key}</Option>)}
      </Select>
    </FormItemTemplate>);
  }

  addButton() {
    const schema = this.props.node.schema || {};
    const uiSchema = this.props.node.uiSchema || {};
    const uiOptions = uiSchema['ui:options'] || {};
    const { updateSchema, updateUiSchema, updateUiOptions } = this.props;
    const { Item } = Menu;
    const items = [
      // [schema, 'title', 'Title', updateSchema],
      // [schema, 'description', 'Description', updateSchema],
      [uiSchema, 'ui:widget', 'Widget', updateUiSchema],
      [uiSchema, 'classNames', 'Class Names', updateUiSchema],
      [uiSchema, 'ui:help', 'Help', updateUiSchema],
      [uiOptions, 'placeholder', 'Placeholder', updateUiOptions],
    ].filter(
      a=>console.log(a[0],a[1],a[0][a[1]])||a[0][a[1]]===undefined
    ).map(
      a=><Item key={a[1]} onClick={()=>a[3]({[a[1]]:''})}>{a[2]}</Item>
    );
    if (!items.length) return null;
    return <List.Item>
      <Dropdown trigger="click" overlay={<Menu>{items}</Menu>}>
        <Button style={{width:'100%'}} type="primary" icon="plus" />
      </Dropdown>
    </List.Item>
  }

  render() {
    return (<div>
      <List
        itemLayout="horizontal"
        dataSource={[
          this.title(),
          this.description(),
          this.widgets(),
          this.classNames(),
          this.help(),
          this.placeholder(),
          this.addButton()
        ].filter(a=>a)}
        renderItem={a=>a}
      />

    </div>);
  }

  _render() {
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
