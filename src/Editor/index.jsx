import React from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import JsonEditor from './JsonEditor';
import BasicEditor from './BasicEditor';
//import StringEditor from './StringEditor';
import ObjectEditor from './ObjectEditor';

const { getNode } = require('../core');
const { TabPane } = Tabs;

const editorList = [
  // StringEditor,
  BasicEditor,
  ObjectEditor,
  JsonEditor
];

class Editor extends React.Component {
  updateUiOptions = uiOptionsUpdate => {
    const {uiSchema={}, key} = this.props.node
    const uiOptions = uiSchema['ui:options'] || {};
    const newUiOptions = {...uiOptions, ...uiOptionsUpdate};
    for (const i in newUiOptions) {
      if (newUiOptions[i] !== undefined) {
        this.props.updateNode(key, {uiSchema: {...uiSchema, 'ui:options':{...uiOptions, ...newUiOptions}}})
        return
      }
    }
    this.props.updateNode(key, {uiSchema: {...uiSchema, 'ui:options': undefined}});
  }

  render(){
    const { node, updateNode } = this.props;
    if(!(node && node.schema)) return null;
    const filteredEditors = editorList.filter(a=>a.filter(node));
    return (<Tabs defaultActiveKey={filteredEditors[0].key} onChange={console.log}>
      {filteredEditors.map(Editor=>(
        <TabPane tab={Editor.name} key={Editor.key}>
          <div style={{ margin: '0px 16px' }}>
            <Editor
              key={node.key}
              node={node}
              updateNode={nodeUpdate => updateNode(node.key, nodeUpdate)}
              updateSchema={schemaUpdate => updateNode(node.key, {schema:{...node.schema, ...schemaUpdate}})}
              updateUiSchema={uiSchemaUpdate => updateNode(node.key, {uiSchema: {...node.uiSchema, ...uiSchemaUpdate}})}
              updateUiOptions={this.updateUiOptions}/>
          </div>
        </TabPane>
      ))}
    </Tabs>);
  }
}

export default connect(
  ({tree:{present},activeNodeKey}) => ({
    node: activeNodeKey && getNode(present, activeNodeKey)
  }),
  (dispatch) => ({
    updateNode: (target, nodeUpdate) => dispatch({
      type:'TREE_UPDATE_NODE',
      payload:{
        target,
        nodeUpdate
      }
    })
  })
)(Editor);
