import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Popconfirm } from 'antd';
import { PlusCircleOutlined, CloseCircleFilled } from '@ant-design/icons';
import InlineEditor from '../InlineEditor';
import { Dropdown } from 'antd';
import AddItemMenu from './Menu';

class TreeNodeTitle extends PureComponent {
  render() {
    const { node, removeNode, updateNodeName, searchValue } = this.props;
    const { name, key } = node;
    const isLeaf = node.isLeaf;
    const isRoot = node.name === node.key;
    const isArray = node.schema.type === 'array';
    const indexBefore = node.name.toLowerCase().indexOf(searchValue);
    const indexAfter = indexBefore + searchValue.length;
    return (
      <span style={{ display: 'block' }}>
        {searchValue && indexBefore >= 0 ? (
          <InlineEditor value={node.name} onChange={(name) => updateNodeName(key, name)}>
            {name.slice(0, indexBefore)}
            <span style={{ color: '#f50' }}>{name.slice(indexBefore, indexAfter)}</span>
            {name.slice(indexAfter)}
          </InlineEditor>
        ) : (
          <InlineEditor value={node.name} onChange={(name) => updateNodeName(key, name)}>
            {name}
          </InlineEditor>
        )}
        <span className="pull-right">
          {!(isLeaf || isArray) ? (
            <span className="form-builder-add-item-menu" onClick={(e) => e.stopPropagation()}>
              <Dropdown placement="bottomLeft" trigger={['click']} overlay={<AddItemMenu node={node} />}>
                <PlusCircleOutlined />
              </Dropdown>
            </span>
          ) : null}
          {!isRoot ? (
            <span className="tree-node-delete" onClick={(e) => e.stopPropagation()}>
              <Popconfirm
                placement="rightTop"
                title={`Delete "${key}"?`}
                onConfirm={() => removeNode(key)}
                okText="Yes"
                cancelText="No"
              >
                <CloseCircleFilled />
              </Popconfirm>
            </span>
          ) : null}
        </span>
      </span>
    );
  }
}

export default connect(null, (dispatch) => ({
  removeNode: (key) =>
    dispatch({
      type: 'TREE_REMOVE_NODE',
      payload: key,
    }),
  updateNodeName: (key, name) =>
    dispatch({
      type: 'TREE_UPDATE_NODE',
      payload: { target: key, nodeUpdate: { name } },
    }),
}))(TreeNodeTitle);
