import React from 'react';
import { Input, Alert } from 'antd';
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

export default class JsonEditor extends React.Component {
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

  renderErrorMessage() {
    const { error } = this.state;
    if(!error) return null;
    const errorMessage = error.toString();
    const message = <a href="#!" onClick={()=>{
        const matched = /position ([0-9]+)/.exec(errorMessage);
        const position = matched ? matched[1] : -1;
        const input = this.input.textAreaRef;
        input.selectionStart = position;
        input.selectionEnd = position;
        input.focus();
    }}>{error.toString()}</a>;
    return <Alert message={message} type="error" showIcon />;
  }

  onClickPrettify = () => {
    let { error } = this.state;
    if (!error) {
      this.setState({
        string: JSON.stringify(this.props.value, null, 2)
      });
    }
  }

  render() {
    const {string} = this.state;
    return <div>
      {this.renderErrorMessage() ||(
       <Alert
         message={
           <a href="#!" onClick={this.onClickPrettify}>Prettify</a>
         }
         type="success"
         showIcon
       />)
      }
      <TextArea
        {...this.props}
        ref={ref=>this.input=ref}
        value={string}
        onChange={this.onChange}
      />
    </div>
  }
}
