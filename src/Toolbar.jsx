import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Icon } from 'antd';
import { ActionTypes } from 'redux-undo';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(this.props.tree);
    const { tree, undo, redo } = this.props;
    const { past, present, future} = tree;
    return <Row>
      <Button onClick={undo} disabled={!past.length}><Icon type="left" /></Button>
      <Button onClick={redo} disabled={!future.length}><Icon type="right" /></Button>
    </Row>;
  }
}

export default connect(
  ({tree})=>({tree}),
  dispatch => ({
    undo:()=>dispatch({type: ActionTypes.UNDO}),
    redo:()=>dispatch({type: ActionTypes.REDO}),
  })
)(Toolbar);
