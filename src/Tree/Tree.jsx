import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tree } from 'antd';
import TreeNodeTitle from './TreeNodeTitle';
const TreeNode = Tree.TreeNode;


class Demo extends React.Component {
  onDragEnter = (info) => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }
  onDrop = (info) => {
    console.log(info);
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // const dragNodesKeys = info.dragNodesKeys;
    this.props.moveNode(dragKey, dropKey, dropPosition);
  }
  render() {
    const {
      tree,
      setActiveNode,
      activeNodeKey
    } = this.props;
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode
                 key={item.key}
                 title={<TreeNodeTitle node={item}/>}
                 isLeaf={item.isLeaf}>
          {loop(item.children)}
        </TreeNode>;
      }
      return <TreeNode key={item.key} title={<TreeNodeTitle node={item}/>} isLeaf={item.isLeaf} />;
    });
    return (
      <Tree
        className="form-builder-draggable-tree"
        defaultExpandedKeys={['root']}
        selectedKeys={[activeNodeKey]}
        draggable
        onDragEnter={this.onDragEnter}
        onDrop={this.onDrop}
        onSelect={(([selected])=>setActiveNode(selected))}
      >
        {loop(tree)}
      </Tree>
    );
  }
}

export default connect(
  ({tree:{present},activeNodeKey})=>({
    tree:present,
    activeNodeKey
  }),
  (dispatch) =>({
    moveNode: (source, target, position) => dispatch({
      type:'TREE_MOVE_NODE',
      payload: {
        source,
        target,
        position,
      }
    }),
    removeNode: (target) => dispatch({
      type: 'TREE_REMOVE_NODE',
      payload: target,
    }),
    setActiveNode: selectedKey => dispatch({
      type:'ACTIVE_NODE_KEY_SET',
      payload: selectedKey,
    }),
    updateNodeTitle: (target, name) => dispatch({
      type: 'TREE_UPDATE_NODE',
      payload: {
        target: target, node: {name}, updateMode: 1
      }
    }),
  })
)(Demo);
