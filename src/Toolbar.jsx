import React from 'react';
import { connect } from 'react-redux';
import { Row, Button, Icon, Tooltip, message } from 'antd';
import { ActionTypes } from 'redux-undo';

function write(filename, json) {
  const a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([JSON.stringify(json, null ,2)], {type: 'application/json'}));
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function read(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();

  const p = new Promise(function (resolve) {
    reader.onload = function(e) {
      var contents = e.target.result;
      resolve(contents);
    };
  });
  reader.readAsText(file);
  return p;
}


class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  save = () => {
    const { name, schema, uiSchema } = this.props.tree.present[0];
    write(name, { name, schema, uiSchema });
  }
  open = async e => {
    const s = await read(e);
    try {
      const { name, schema, uiSchema } = JSON.parse(s);
      this.props.setTree({ name, schema, uiSchema });
    } catch(e) {
      message.error('Invalid json file!')
    }
  }
  render() {
    const { tree, undo, redo } = this.props;
    const { past, future} = tree;
    return <Row>
      <input ref={ref => this.loadFile = ref } type="file" accept="application/json" onChange={this.open} hidden/>
      <Tooltip title="Open">
        <Button onClick={()=>this.loadFile && this.loadFile.click() }><Icon type="folder-open" /></Button>
      </Tooltip>
      <Tooltip title="Save">
        <Button onClick={this.save}><Icon type="save" /></Button>
      </Tooltip>
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
    setTree: payload => dispatch({
      type:'TREE_SET_TREE',
      payload
    }),
    undo:()=>dispatch({type: ActionTypes.UNDO}),
    redo:()=>dispatch({type: ActionTypes.REDO}),
  })
)(Toolbar);
