import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import JsonEditor from './JsonEditor';
const { getNode } = require('../core');
const { TabPane } = Tabs;



const editorList = [
  JsonEditor
];

class Editor extends React.Component {
  render(){
    const {node,updateNode} = this.props;
    if(!node) return null;
    return (<Tabs defaultActiveKey="1" onChange={console.log}>
      {editorList.filter(a=>a.filter(node)).map(Editor=>(
        <TabPane tab={Editor.name} key={Editor.key}>
          <Editor node={node} updateNode={updateNode(node.key)} />
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
    updateNode: target => nodeUpdate => dispatch({
      type:'TREE_UPDATE_NODE',
      payload:{
        target,
        nodeUpdate
      }
    })
  })
)(Editor);
