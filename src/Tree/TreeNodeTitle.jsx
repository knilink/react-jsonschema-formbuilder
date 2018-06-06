import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Popconfirm, Input } from 'antd';
import InlineEditor from '../InlineEditor';

import { Popover } from 'antd';

import AddItemMenu from './Menu';

class TreeNodeTitle extends React.Component {
  render() {
    const { node, removeNode, updateNodeTitle } = this.props;
    const { key } = node;
    return <span style={{width:'100%',display:'block'}}>
      <InlineEditor
        value={node.title}
        onChange={title=>updateNodeTitle(key,title)}
      >
        {node.title}
      </InlineEditor>
      <span className="pull-right">
        {!node.isLeaf ? <span className="form-builder-add-item-menu" onClick={e=>e.stopPropagation()}>
          <Popover
            placement="rightTop"
            content={<AddItemMenu node={node} />}
            trigger='click'
          >
            <Icon type="plus-circle-o" />
          </Popover>
        </span> : null}
        <span className="tree-node-delete" onClick={e=>e.stopPropagation()}>
          <Popconfirm
            placement="rightTop"
            title={`Delete "${key}"?`}
            onConfirm={()=>removeNode(key)}
            okText="Yes"
            cancelText="No"
          >
            <Icon type="close-circle" />
          </Popconfirm>
        </span>
      </span>
    </span>;
  }
}

export default connect(
  null,
  (dispatch) => ({
    removeNode: (key)=>dispatch({
      type:'TREE_REMOVE_NODE',
      payload: key
    }),
    updateNodeTitle: (key, title) => dispatch({
      type:'TREE_UPDATE_NODE',
      payload: {target:key,nodeUpdate:{title}}
    })
  })
)(TreeNodeTitle)
