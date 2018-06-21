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



function title({node:{schema}, updateSchema:update}) {
  const key='title';
  const title = 'Title';
  const value = (schema||{})[key];
  if (value === undefined) {
    return [(
      <Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>
    )];
  } else {
    return [
      null,
      (<TimeThrottleInput
         key={key}
         title={title}
         value={value}
         onChange={value => update({[key]:value || undefined})}
      />)];
  }
}

function description({node:{schema}, updateSchema:update}) {
  const key = 'description';
  const title = 'Description';
  const value = (schema||{})[key];
  if (value === undefined) {
    return [(
      <Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>
    )];
  } else {
    return [
      null,
      (<TimeThrottleTextArea
         key={key}
         title={title}
         value={value}
         onChange={value => update({[key]:value || undefined})}
         autosize
      />)
    ];
  }
}

function classNames({node:{uiSchema}, updateUiSchema:update}) {
  const key = 'classNames';
  const title = 'Class Names'
  const value = (uiSchema||{})[key];
  if (value === undefined) {
    return [(
      <Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>
    )];
  } else {
    return [
      null,
      (<TimeThrottleInput
         key={key}
         title={title}
         value={value}
         onChange={value => update({'classNames':value})}
      />)
    ];
  }
}

function placeholder({node:{schema, uiSchema}, updateUiOptions:update}) {
  if(schema.type === 'object' || schema.type==='array') {
    return []
  }
  const key = 'placeholder';
  const title = 'Placeholder';
  const uiOptions = (uiSchema||{})['ui:options'];
  const value = (uiOptions || {})[key];
  if(value === undefined) {
    return [
      (<Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>)
    ];
  } else {
    return [
      null,
      (<TimeThrottleInput
         key={key}
         title={title}
         value={value}
         onChange={value => update({[key]:value})}
      />)
    ];
  }
}

function help({node:{uiSchema}, updateUiSchema:update}) {
  const key = 'ui:help';
  const title = 'Help';
  const value = (uiSchema||{})[key];
  if (value === undefined) {
    return [
      (<Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>)
    ];
  } else {
    return [
      null,
      (<TimeThrottleInput
         key={key}
         title={title}
         value={value}
         onChange={value => update({[key]:value})}
      />)
    ];
  }
}

function widget({node:{schema, uiSchema}, updateUiSchema:update}) {
  const key = 'ui:widget';
  const title = 'Widget';
  const availableWidgets = widgets.filter(
    ([f])=>f(schema||{}, uiSchema||{})
  );
  if(!availableWidgets.length) return [];
  const value = (uiSchema || {})[key];
  if(value === undefined) {
    return [(<Menu.Item key={key} onClick={()=>update({[key]:''})}>
      {title}
    </Menu.Item>)];
  } else {
    return [
      null,
      (<FormItemTemplate key={key} title={title} remove={()=>update({[key]: undefined}) }>
        <Select
          onChange={value=>update({[key]: value || null})}
          value={value}
          style={{ width: '100%' }}
          showSearch
        >
          {availableWidgets.map(([_, key])=><Option key={key}>{key}</Option>)}
        </Select>
      </FormItemTemplate>)
    ];
  }
}
function pattern({node:{schema}, updateSchema:update}) {
  if(schema.type!=='string') return [];
  const key='pattern';
  const title = 'Pattern';
  const value = (schema||{})[key];
  if (value === undefined) {
    return [(
      <Menu.Item key={key} onClick={()=>update({[key]:''})}>
        {title}
      </Menu.Item>
    )];
  } else {
    return [
      null,
      (<TimeThrottleInput
         key={key}
         title={title}
         value={value}
         onChange={value => update({[key]:value || undefined})}
      />)];
  }
}

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

  render() {
    const l = [
      title,
      description,
      widget,
      classNames,
      help,
      placeholder,
      pattern
    ].map(f=>f(this.props));

    const addable = l.map(a=>a[0]).filter(a=>a);
    const editable = l.map(a=>a[1]).filter(a=>a);

    if(addable.length) {
      editable.push(<List.Item key="addButton">
        <Dropdown trigger={['click']} overlay={<Menu>{addable}</Menu>}>
          <Button style={{width:'100%'}} type="primary" icon="plus" />
        </Dropdown>
      </List.Item>);
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={editable}
        renderItem={a=>a}
      />
    );
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
