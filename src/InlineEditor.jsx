import React, { Component } from 'react';
import { Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default class InlineEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      value: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  onChange = (e) => {
    this.setState({ value: e.target.value });
  };
  onCompleteEditing = () => {
    this.setState({ editing: false });
    const newValue = this.state.value.trim();
    if (newValue !== this.props.value) {
      this.props.onChange && this.props.onChange(newValue);
    }
  };
  onStartEditing = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ editing: true }, () => this.input && this.input.focus());
  };

  onCancelEditing = () => {
    this.setState({
      editing: false,
      value: this.props.value,
    });
  };

  renderEditing() {
    return (
      <Input
        ref={(r) => (this.input = r)}
        value={this.state.value}
        onBlur={this.onCompleteEditing}
        onChange={this.onChange}
        onKeyUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.keyCode === 13) {
            this.onCompleteEditing();
          } else if (e.keyCode === 27) {
            this.onCancelEditing();
          }
        }}
      />
    );
  }

  renderView() {
    return (
      <span>
        {this.props.children}
        <EditOutlined onClick={this.onStartEditing} />
      </span>
    );
  }

  render() {
    if (this.state.editing) {
      return this.renderEditing();
    } else {
      return this.renderView();
    }
  }
}
