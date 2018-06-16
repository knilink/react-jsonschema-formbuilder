import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Slider, Col, Row, Switch } from 'antd';

function FormItemTemplate({title, children}) {
  return (<Row className="ant-form-item">
    <Col className="ant-form-item-label">
      <label>{title}</label>
    </Col>
    <Col  className="ant-form-item-control-wrapper">
      {children}
    </Col>
  </Row>);
}

const tipFormatter = ((flag=false)=>number=>{
  flag = !flag;
  return flag ? number : window.innerWidth - number
})()

class Settings extends React.Component {
  siderWidth() {
    const { leftSiderWidth, rightSiderWidth } = this.props.settings;
    return (<FormItemTemplate title={'Sider Width'}>
      <Slider
        included
        min={0}
        max={window.innerWidth}
        tipFormatter={ tipFormatter }
        range
        value={[leftSiderWidth, window.innerWidth-rightSiderWidth]}
        onChange={([left, right])=>{
            this.props.updateSettings({
              leftSiderWidth: left > 200 ? left : 200,
              rightSiderWidth: window.innerWidth - right
            });
        }}
      />
    </FormItemTemplate>);
  }

  formWidth() {
    return (<FormItemTemplate title={'Form Width'}>
      <Slider
        min={0}
        max={window.innerWidth}
        value={this.props.settings.formWidth}
        onChange={value => {
            this.props.updateSettings({
              formWidth: value,
            });
        }}
      />
    </FormItemTemplate>);
  }

  inlineMode() {
    return (<FormItemTemplate title={'Inline Mode'}>
      <Switch
        onChange={v => this.props.updateSettings({isInlineMode: v}) }
        checked={this.props.settings.isInlineMode}
      />
    </FormItemTemplate>);
  }

  render() {
    return <form className="ant-form ant-form-horizontal">
      {this.siderWidth()}
      {this.formWidth()}
      {this.inlineMode()}
    </form>;
  }
}

export default connect(
  ({settings}) => ({settings}),
  dispatch => ({
    updateSettings: payload => dispatch({
      type:'SETTINGS_UPDATE',
      payload
    })
  })
)(Settings);
