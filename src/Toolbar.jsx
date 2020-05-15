import React from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, message, Select } from 'antd';
import { FileAddOutlined, FolderOpenOutlined, SaveOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';

import { ActionTypes } from 'redux-undo';

function write(filename, json) {
  const a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }));
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
    reader.onload = function (e) {
      var contents = e.target.result;
      resolve(contents);
    };
  });
  reader.readAsText(file);
  return p;
}

const buttonStyle = { marginLeft: 8 };
class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  save = () => {
    const { name, schema, uiSchema } = this.props.tree.present[0];
    write(name, { name, schema, uiSchema });
  };
  open = async (e) => {
    const s = await read(e);
    try {
      const { name, schema, uiSchema } = JSON.parse(s);
      this.props.setTree({ name, schema, uiSchema });
    } catch (e) {
      message.error('Invalid json file!');
    }
  };
  render() {
    const { tree, undo, redo, settings, updateSettings, newForm } = this.props;
    const { past, future } = tree;
    return (
      <span>
        <input ref={(ref) => (this.loadFile = ref)} type="file" accept="application/json" onChange={this.open} hidden />
        <Tooltip title="New">
          <Button style={buttonStyle} onClick={newForm} icon={<FileAddOutlined />} />
        </Tooltip>
        <Tooltip title="Open">
          <Button
            style={buttonStyle}
            onClick={() => this.loadFile && this.loadFile.click()}
            icon={<FolderOpenOutlined />}
          />
        </Tooltip>
        <Tooltip title="Save">
          <Button style={buttonStyle} onClick={this.save} icon={<SaveOutlined />} />
        </Tooltip>
        <Tooltip title="Undo">
          <Button style={buttonStyle} onClick={undo} disabled={!past.length} icon={<UndoOutlined />} />
        </Tooltip>
        <Tooltip title="Redo">
          <Button style={buttonStyle} onClick={redo} disabled={!future.length} icon={<RedoOutlined />} />
        </Tooltip>
        <Select
          mode="multiple"
          style={{ width: 290, marginLeft: 12 }}
          value={settings.subViews}
          onChange={updateSettings}
          placeholder="Select sub views..."
        >
          <Select.Option key="schema">Schema</Select.Option>
          <Select.Option key="uiSchema">Ui Schema</Select.Option>
          <Select.Option key="formData">Data</Select.Option>
        </Select>
      </span>
    );
  }
}

export default connect(
  ({ tree, settings }) => ({ tree, settings }),
  (dispatch) => ({
    newForm: () =>
      dispatch({
        type: 'TREE_CLEAR',
      }),
    setTree: (payload) =>
      dispatch({
        type: 'TREE_SET_TREE',
        payload,
      }),
    undo: () => dispatch({ type: ActionTypes.UNDO }),
    redo: () => dispatch({ type: ActionTypes.REDO }),
    updateSettings: (subViews) =>
      dispatch({
        type: 'SETTINGS_UPDATE',
        payload: { subViews },
      }),
  })
)(Toolbar);
