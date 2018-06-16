import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Icon, Tooltip } from 'antd';
import { ActionTypes } from 'redux-undo';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { tree, undo, redo } = this.props;
    const { past, present, future} = tree;
    return <Row>
      <Tooltip title="Undo">
        <Button onClick={undo} disabled={!past.length}><Icon type="left" /></Button>
      </Tooltip>
      <Tooltip title="Redo">
        <Button onClick={redo} disabled={!future.length}><Icon type="right" /></Button>
      </Tooltip>
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
