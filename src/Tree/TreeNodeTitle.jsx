import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Popconfirm, Button } from 'antd';
import InlineEditor from '../InlineEditor';
import { Popover, Dropdown } from 'antd';
import AddItemMenu from './Menu';
const ButtonGroup = Button.Group;


class TreeNodeTitle extends Component {
  _render() {
    const { node, removeNode, updateNodeName } = this.props;
    const { key } = node;
    const isLeaf = node.isLeaf;
    const isRoot = node.name === node.key;
    const isArray = node.schema.type==='array';
    return <span style={{width:'100%',display:'block'}}>
      <InlineEditor
        value={node.name}
        onChange={name=>updateNodeName(key,name)}
      >
        {node.name}
      </InlineEditor>
      <span className="pull-right">
        <ButtonGroup>
          {!(isLeaf && isArray) ? <span className="form-builder-add-item-menu" onClick={e=>e.stopPropagation()}>
            <Popover
              placement="rightTop"
              content={<AddItemMenu node={node} />}
              trigger='click'
            >
              <Button size="small" icon="plus-circle-o"/>
            </Popover>
          </span> : null}
          {!isRoot ? <span className="tree-node-delete" onClick={e=>e.stopPropagation()}>
            <Popconfirm
              placement="rightTop"
              title={`Delete "${key}"?`}
              onConfirm={()=>removeNode(key)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="danger" icon="close-circle"/>
            </Popconfirm>
          </span>:null}
        </ButtonGroup>
      </span>
    </span>;
  }
  render() {
    const { node, removeNode, updateNodeName, searchValue } = this.props;
    const { name, key } = node;
    const isLeaf = node.isLeaf;
    const isRoot = node.name === node.key;
    const isArray = node.schema.type==='array';
    const indexBefore = node.name.toLowerCase().indexOf(searchValue);
    const indexAfter = indexBefore + searchValue.length;
    return <span style={{width:'100%',display:'block'}}>
      {searchValue && indexBefore >= 0 ? (
         <InlineEditor
           value={node.name}
           onChange={name=>updateNodeName(key,name)}
           >
           {name.slice(0, indexBefore)}
           <span style={{ color: '#f50' }}>{name.slice(indexBefore, indexAfter)}</span>
           {name.slice(indexAfter)}
         </InlineEditor>
      ) : (
         <InlineEditor
           value={node.name}
           onChange={name=>updateNodeName(key,name)}
           >
           {name}
         </InlineEditor>
      )}
      <span className="pull-right">
        {!(isLeaf || isArray) ? <span className="form-builder-add-item-menu" onClick={e=>e.stopPropagation()}>
          <Dropdown
            placement="bottomLeft"
            trigger={['click']}
            overlay={<AddItemMenu node={node}/>}
          >
            <Icon type="plus-circle-o" />
          </Dropdown>
        </span> : null}
        {!isRoot ? <span className="tree-node-delete" onClick={e=>e.stopPropagation()}>
          <Popconfirm
            placement="rightTop"
            title={`Delete "${key}"?`}
            onConfirm={()=>removeNode(key)}
            okText="Yes"
            cancelText="No"
          >
            <Icon type="close-circle" />
          </Popconfirm>
        </span> : null}
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
    updateNodeName: (key, name) => dispatch({
      type:'TREE_UPDATE_NODE',
      payload: {target:key,nodeUpdate:{name}}
    })
  })
)(TreeNodeTitle)
/*
   <Popover
   placement="rightTop"
   content={<AddItemMenu node={node} />}
   trigger='click'
   >
   <Icon type="plus-circle-o" />
   </Popover>

 */
