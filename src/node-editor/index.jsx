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
  render() {
    const {node} = this.props;
    if(!node) return null;
    return <Tabs defaultActiveKey="1" onChange={console.log}>
      {editorList.filter(a=>a.filter(node)).map(Editor=>(
        <TabPane tab={Editor.name} key={Editor.key}>
          <Editor node={node} />
        </TabPane>
      ))}
    </Tabs>;
    //</Sider>;
  }
}

export default connect(
  ({tree:{present},activeNodeKey}) => ({
    node: activeNodeKey && getNode(present, activeNodeKey)
  })
)(Editor);
