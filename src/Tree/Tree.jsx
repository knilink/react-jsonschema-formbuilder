import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tree, Input } from 'antd';
import TreeNodeTitle from './TreeNodeTitle';
const { TreeNode } = Tree;
const { Search } = Input;


class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: ['root'],
      searchValue:'',
      searchExpanded: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.activeNodeKey &&
       nextProps.activeNodeKey!==this.props.activeNodeKey) {
      let path = nextProps.activeNodeKey.split('.');
      let expandedKeys = [...this.state.expandedKeys];
      const n = path.length;
      for (var i=1; i < n; i++) {
        path[i] = path[i-1] + '.' + path[i];
        if(!expandedKeys.includes(path[i-1])) {
          expandedKeys.push(path[i-1]);
        }
      }
      this.setState({
        expandedKeys
      });
    }
  }


  onDragEnter = (info) => {
    // console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }
  onDrop = (info) => {
    // console.log(info);
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // const dragNodesKeys = info.dragNodesKeys;
    this.props.moveNode(dragKey, dropKey, dropPosition);
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
    });
  }

  onChange = e => {
    const { expandedKeys } = this.state;
    const searchValue = e.target.value.trim().toLowerCase();
    if(!searchValue) {
      this.setState({
        searchValue,
        searchExpanded: []
      });
      return;
    }

    let newSearchExpanded = [];
    const loop = data => {
      if(!data) return;
      for (const item of data) {
        if (item.name.toLowerCase().includes(searchValue)) {
          let parents = item.key.split('.');
          const n = parents.length;
          for (let i=1;i<n;i++) {
            if(!(
              expandedKeys.includes(parents[i-1]) ||
              newSearchExpanded.includes(parents[i-1])
            )) {
              newSearchExpanded.push(parents[i-1]);
            }
            parents[i] = parents[i-1] + '.' + parents[i];
          }
        }
        loop(item.children);
      }
    }
    loop(this.props.tree);
    this.setState({
      searchValue,
      searchExpanded: newSearchExpanded,
    });
  }

  onBlur = ()=>{
    this.setState({
      expandedKeys: [
        ...this.state.expandedKeys,
        ...this.state.searchExpanded
      ],
      searchExpanded: []
    });
  }

  render() {
    const {
      tree,
      setActiveNode,
      activeNodeKey,
    } = this.props;
    const {
      searchValue,
      expandedKeys,
      searchExpanded
    } = this.state;
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode
                 key={item.key}
                 title={<TreeNodeTitle node={item} searchValue={searchValue}/>}
                 isLeaf={item.isLeaf}>
          {loop(item.children)}
        </TreeNode>;
      }
      return <TreeNode
               key={item.key}
               title={<TreeNodeTitle node={item} searchValue={searchValue} />}
               isLeaf={item.isLeaf}
      />;
    });
    const children = loop(tree);
    return (<div>
      <Search
        placeholder="Search"
        onChange={this.onChange}
        onBlur={this.onBlur}
      />
      <Tree
        className="form-builder-draggable-tree"
        expandedKeys={searchExpanded.length ? [...expandedKeys,...searchExpanded] : expandedKeys}
        selectedKeys={[activeNodeKey]}
        draggable
        onDragEnter={this.onDragEnter}
        onDrop={this.onDrop}
        onExpand={this.onExpand}
        onSelect={(([selected])=>setActiveNode(selected))}
      >
        {children}
      </Tree>
    </div>);
  }
}

export default connect(
  ({tree:{present},activeNodeKey})=>({
    tree:present,
    activeNodeKey,
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
