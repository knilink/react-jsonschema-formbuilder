import React, { Component } from 'react';
import { Input, Icon } from 'antd';

const editableIcon = <Icon type="edit" />;

export default class InlineEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      value: this.props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.value})
  }

  onChange = e=>{
    this.setState({value:e.target.value});
  }
  onCompleteEditing = ()=>{
    this.setState({editing:false});
    this.props.onChange && this.props.onChange(this.state.value)
  }
  onStartEditing = e=>{
    e.stopPropagation();
    this.setState(
      { editing: true },
      () => this.input && this.input.focus()
    );
  }

  render() {
    if(this.state.editing) {
      return (
        <Input
          ref={r => this.input=r}
          value={this.state.value}
          onBlur={this.onCompleteEditing}
          onChange={this.onChange}
          onKeyUp={e => {
              if (e.keyCode === 13) {
                this.onCompleteEditing();
              }
          }}
        />
      );
    } else {
      return (
        <span>
          {this.props.children}
          <Icon
            type="edit"
            onClick={this.onStartEditing}
          />
        </span>
      );
    }
  }
}
