import React from 'react';
import {
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Icon,
  Button,
  List,
  Dropdown,
  Menu,
  Switch,
  Slider
} from 'antd';
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
      this.onSubmitValue(this.state.value);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value!==this.state.value) {
      if (this.state.timer) {
        clearTimeout(this.state.timer);
        // this.props.onChange(this.state.value);
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
        this.onSubmitValue(this.state.value);
      }, this.throttle)
    });
  }

  onSubmitValue(value) {
    this.props.onChange(value);
  }

  onBlur = () => {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: null
    });
    this.onSubmitValue(this.state.value);
  }

  onRemove = () => {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.setState({
      timer: null
    });
    this.onSubmitValue(undefined);
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

class TimeThrottleRange extends TimeThrottle {
  componentWillReceiveProps(nextProps) {
    if(nextProps.value[0]!==this.state.value[0] ||
       nextProps.value[1]!==this.state.value[1]
    ) {
      if (this.state.timer) {
        clearTimeout(this.state.timer);
        // this.props.onChange(this.state.value);
      }
      this.setState({
        value: nextProps.value,
        timer: null
      });
    }
  }
  onSubmitValue(value) {
    if (!value) {
      this.props.onChange(value);
    }
    let [min,max] = value;
    if(typeof(min)==='string') {
      if(min) {
        min = this.props.value[0];
      } else {
        min = undefined;
      }
    }
    if(typeof(max)==='string') {
      if(max) {
        max = this.props.value[1];
      } else {
        max = undefined;
      }
    }
    this.props.onChange([min,max]);
  }
  render() {
    const {
      value: [min, max],
      timer
    } = this.state;
    const {
      title
    } = this.props;
    const titleElement = <span>{title}{timer?this.editing:null}</span>;
    return (
      <FormItemTemplate title={titleElement} remove={this.onRemove}>
        <InputNumber
          onChange={n=>{
              this.onChange([
                typeof(n)==='string' && !n ? undefined : n,
                max
              ]);
          }}
          value={min===0 && max===undefined ? '' : min }
          style={{ width: 100, textAlign: 'center' }}
          placeholder="Minimum"
        />
        <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
        <InputNumber
          onChange={n=>{
              this.onChange([
                min,
                typeof(n)==='string' && !n ? undefined : n
              ]);
          }}
          value={max}
          style={{ width: 100, textAlign: 'center', borderLeft: 0 }}
          placeholder="Maximum"
        />
      </FormItemTemplate>
    );
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


function type({node:{schema}, updateSchema:update}) {
  const key = 'type';
  const title = 'Type';
  const availableTypes = ['string','number','integer','boolean'];
  if(!availableTypes.includes(schema.type)) return [];
  const value = (schema || {})[key];
  return [
    null,
    (<FormItemTemplate key={key} title={title} remove={()=>update({[key]: undefined}) }>
      <Select
        onChange={value=>update({[key]: value})}
        value={value}
        style={{ width: '100%' }}
      >
        {availableTypes.map(key=><Option key={key}>{key}</Option>)}
      </Select>
    </FormItemTemplate>)
  ];
}

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

class ClassNamesEditor extends React.Component {
  colSizes = ['sm','md','lg','xl'];
  style = { width: '100%' };

  constructor(props) {
    super(props);
    const value = [...(new Set(
      this.props.value.split(' ').filter(a=>a)
    ))];

    const cols = this.extractCol(value);
    this.state = {
      col: cols.length ? cols[0][0] : 'md',
      value: value,
      options: value
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value !== this.props.value) {
      const value = nextProps.value.split(' ').filter(a=>a);
      const {options} = this.state;
      const newOptions = value.filter(a=>!options.includes(a));
      this.setState({
        value,
        options: newOptions //[...options, ...newOptions]
      });
    }
  }

  extractCol(classNames) {
    return classNames.filter(
      a=>a.startsWith('col-')
    ).map(
      a=>a.split('-')
    ).filter(
      a=>a.length===3 && Number.isInteger(+a[2]) && this.colSizes.includes(a[1])
    ).map(([a,b,c])=>([b,+c]));
  }

  renderMenu() {
    return (
      <Menu onClick={({key})=>this.setState({col:key})}>
        {this.colSizes.map(a=>(<Menu.Item key={a}>col-{a}-</Menu.Item>))}
      </Menu>
    );
  }

  sliderValue() {
    const { value, col } = this.state;
    console.log(this.state);
    return (this.extractCol(value).find(a=>a[0]===col)||[0,0])[1];
  }

  onSliderChange = value => {
    const { value: classNames, col } = this.state;

    let found = false;
    let newClassNames = classNames.map(a=>{
      let [perfix, b, v] = a.split('-');
      if(perfix==='col' && b===col && Number.isInteger(+v)) {
        found = true;
        return value?`col-${b}-${value}`:'';
      }
      return a;
    }).filter(a=>a);
    if (!found && value) {
      newClassNames.push(`col-${col}-${value}`);
    }
    this.props.onChange(newClassNames.join(' '));
  }

  render() {
    const { title, ...rest } = this.props;
    const {options, value, col} = this.state;
    return (
      <FormItemTemplate
        title={title}
        remove={this.onRemove}
      >
        <Row type="flex" align="middle">
          <Col xs={4}>
            <Dropdown overlay={this.renderMenu()}>
              <a>{this.state.col} <Icon type="down"/></a>
            </Dropdown>
          </Col>
          <Col xs={20}>
            <Slider min={0} max={12} value={this.sliderValue()} onChange={this.onSliderChange} />
          </Col>
        </Row>
        <Select
          style={this.style}
          mode="tags"
          tokenSeparators={[' ']}
          {...rest}
          value={value}
          onChange={value => this.props.onChange(value.join(' '))}
          onBlur={this.onBlur}
        >
          {options.map(a=>(<Option key={a}>{a}</Option>))}
        </Select>
      </FormItemTemplate>
    );
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
      (<ClassNamesEditor
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

function required({node:{schema},updateSchema: update}) {
  const key = 'required';
  const title = 'Required';
  if(schema.type!=='object') return [];
  if (!schema.required) {
    return [(
      <Menu.Item key={key} onClick={()=>update({[key]:[]})}>
        {title}
      </Menu.Item>
    )];
  }
  return [
    null,
    (<FormItemTemplate key={key} title="Required" remove={()=>update({[key]: undefined})}>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        onChange={required=>update({required})}
        value={schema.required}
      >
        {Object.keys(schema.properties||{}).map(a=>(<Option key={a}>{a}</Option>))}
      </Select>
    </FormItemTemplate>)
  ];
}


const rangeMeta = (match, key, title, minp, maxp) => ({node:{schema}, updateSchema:update}) => {
  if(!match(schema)) return [];
  if (schema[minp] === undefined && schema[maxp] === undefined) {
    return [(<Menu.Item key={key} onClick={()=>update({[minp]:0})}>
      {title}
    </Menu.Item>)];
  }
  return [
    null,
    (<TimeThrottleRange
       key={key}
       title={title}
       value={[schema[minp], schema[maxp]]}
       onChange={value => {
           if(!value) {
             update({[minp]:undefined, [maxp]:undefined});
           } else {
             const [min, max] = value;
             update({
               [minp]:min?min:max===undefined?0:undefined,
               [maxp]: max
             });
           }
       }}
    />)
  ];
}
const length = rangeMeta(a=>a.type==='string','length','Length','minLength', 'maxLength');
const range = rangeMeta(a=>(a.type==='number'||a.type==='integer'),'range','Range','minimum', 'maximum');
const itemRange = rangeMeta(a=>a.type==='array', 'itemRange','Item Range','minItems', 'maxItems');

function uniqueItems({node:{schema}, updateSchema:update}) {
  const key = 'uniqueItems';
  const title = 'Unique Items';
  if(schema.type!=='array') return [];
  if (schema[key] === undefined ) {
    return [(<Menu.Item key={key} onClick={()=>update({[key]:true})}>
      {title}
    </Menu.Item>)];
  } else {
    return [
      null,
      (<List.Item actions={[
        (<Button onClick={()=>update({[key]:undefined})} size="small" type="danger" shape="circle" icon="close" />)
      ]}>
        <List.Item.Meta title={title} />
        <Switch defaultChecked onChange={value=>update({[key]:value}) } />
      </List.Item>)
    ];
  }
};

const [enumKey, enumName] = [['enum','Enum'],['enumNames','Enum Names']].map(
  ([key,title]) => ({node:{schema}, updateSchema:update}) => {
    if(schema.type !== 'string') return [];
    if (schema[key] === undefined ) {
      return [(<Menu.Item key={key} onClick={()=>update({[key]:[]})}>
        {title}
      </Menu.Item>)];
    } else {
      return [
        null,
        (<FormItemTemplate key={key} title={title} remove={()=>update({[key]: undefined})}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            onChange={values=>update({[key]:values})}
            value={schema[key]}
          >
            {schema[key].map(a=>(<Select.Option key={a}>{a}</Select.Option>))}
          </Select>
        </FormItemTemplate>)
      ];
    }
  }
)



export default class BasicEditor extends React.Component {
  static get key() {
    return 'basic-editor';
  }

  static get name() {
    return 'Basic';
  }

  static filter(node) {
    return node.schema;
  }

  name() {
    return null;
  }

  render() {
    const l = [
      type,
      title,
      description,
      required,
      widget,
      classNames,
      help,
      placeholder,
      enumKey,
      enumName,
      pattern,
      length,
      range,
      itemRange,
      uniqueItems,
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
