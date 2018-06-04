function isEmptyObject(obj) {
  if(!obj) return true;
  for(const i in obj) {
    if(obj[i] !== undefined) {
      return false;
    }
  }
  return true;
}

function schema2tree(name, schema, uiSchema) {
  return [schema2node([name], schema, uiSchema)];
}

function schema2node(path, schema, uiSchema) {
  if(!schema) return null;
  const key = path.join('.');
  const title = path[path.length-1];
  if (schema.type === 'object') {
    let children = [];
    for (const i in schema.properties) {
      const nextPath = [...path, i];
      children.push(schema2node(
        nextPath,
        schema.properties[i],
        uiSchema && uiSchema[i]
      ));
    }
    return {
      key,
      title,
      //path,
      schema,
      uiSchema,
      children
    };
  }
  if(schema.type==='array') {
    let children;
    if(Array.isArray(schema.items)) {
      const nextPath = [...path, '[items]'];
      children = [{
        key: key+'.[items]',
        title: '[items]',
        //path: nextPath,
        children: schema.items.map(
          (a,i) => schema2node(
            [...nextPath, i.toString()],
            schema.items[i],
            uiSchema && uiSchema.items && uiSchema.items[i]
          )
        )
      }];
      if('additionalItems' in schema) {
        const nextPath = [...path,'additionalItems'];
        children.push({
          key: key+'.additionalItems',
          title: 'additionalItems',
          //path: nextPath,
          children: [schema2node(
            nextPath,
            schema.additionalItems,
            uiSchema && uiSchema.additionalItems
          )]
        });
      }
    } else {
      children = [schema2node(
        [...path,'items'],
        schema.items,
        uiSchema && uiSchema.items
      )];
    }

    return {
      key,
      title,
      schema,
      uiSchema,
      children,
      //path,
    };

  }
  return {
    key,
    title,
    //path,
    schema,
    uiSchema,
    leaf: true
  };
}

function getNodeByPath(tree, path) {
  let node;
  let children = tree;
  for(const i of path) {
    node = children.find(a=>a.title===i);
    if(!node) return null;
    children = node.children;
  }
  return node;
}

function getNode(tree, key) {
  return getNodeByPath(tree, key.split('.'));
}

function updateParentKey(tree, parentKey) {
  return tree.map(node=>{
    const key = parentKey + '.' + node.title;
    return Object.assign({}, node, {
      key: parentKey + '.' + node.title,
    }, node.children && {
      children: updateParentKey(key, node.children)
    });
  });
}

function getNodeParentKey(node) {
  return node.key.substring(
    0, node.key.length - node.title.length - 1
  );
}

function updateNodeParentKeyAndTitle(node, parentKey, title) {
  if(!title) {
    title = node.title;
  }
  if(!parentKey) {
    parentKey = getNodeParentKey(node);
  }
  const newKey = parentKey+'.'+title;
  if(node.key === newKey) return node;
  return Object.assign(
    {}, node, {
      title,
      key: newKey,
    }, node.children && {
      children: updateParentKey(
        node.children,
        newKey
      )
    }
  );
}


function updateSchema(node, newChildren) {
  let newSchema = Object.assign({}, node.schema);
  if (node.schema.type==='object') {
    let newProperties = {};
    for (const child of newChildren) {
      newProperties[child.title] = child.schema;
    }
    newSchema.properties = newProperties;
  }
  else if (node.schema.type==='array') {
    if (Array.isArray(node.schema.items)) {
      // items is array
      newSchema = Object.assign({}, node.schema);
      const newItemsNode = newChildren.find(
        a=>a.title==='[items]'
      );
      const oldItemsNode = node.children.find(
        a=>a.title==='[items]'
      );
      if (newItemsNode !== oldItemsNode) {
        // items field updated
        if(newItemsNode){
          newSchema.items = newItemsNode.children.map(
            a=>a.schema
          );
        } else {
          delete newSchema.items;
        }
      } else {
        // additionalItems field updated
        const newAdditionalItemsNode = newChildren.find(
          a=>a.title==='additionalItems'
        );
        if(newAdditionalItemsNode){
          newSchema.additionalItems = newItemsNode.children.map(
            a=>a.schema
          );
        } else {
          delete newSchema.additionalItems;
        }
      }
    } else {
      // items is not array
      const newItemsNode = newChildren.find(
        a=>a.title === 'items'
      );
      if(newItemsNode) {
        newSchema.items = newItemsNode.schema;
      } else {
        delete newSchema.items;
      }
    }
  }
  return newSchema;
}

function updateUiSchema(node, newChildren) {
  let newUiSchema = {};
  for(const i in node.uiSchema) {
    if(i.startsWith('ui:')) {
      newUiSchema[i] = node.uiSchema[i];
    }
  }
  if (node.schema.type==='object') {
    for(const child of newChildren) {
      if(child.uiSchema) {
        newUiSchema[child.title] = child.uiSchema;
      }
    }
  }
  else if (node.schema.type === 'array') {
    if (Array.isArray(node.schema.items)) {
      // items is array
      const newItemsNode = newChildren.find(
        a=>a.title==='[items]'
      );
      const oldItemsNode = node.children.find(
        a=>a.title==='[items]'
      );
      if (newItemsNode !== oldItemsNode) {
        // items field updated
        if(newItemsNode){
          let empty = true;
          newUiSchema.items = newItemsNode.children.map(
            a => {
              empty = empty && !a.uiSchema;
              return a.uiSchema || null;
            }
          );
          if(empty) {
            delete newUiSchema.items;
          }
        }
        if('additionalItems' in node.uiSchema) {
          newUiSchema.additionalItems = node.uiSchema.additionalItems;
        }
      } else {
        // additionalItems field updated
        if('items' in node.uiSchema) {
          newUiSchema.items = node.uiSchema.items;
        }
        const newAdditionalItemsNode = newChildren.find(
          a=>a.title==='additionalItems'
        );
        if (newAdditionalItemsNode) {
          newUiSchema.additionalItems = newItemsNode.children.map(
            a=>a.schema
          );
        }
      }
    } else {
      // items is not array
      const newItemsNode = newChildren.find(
        a=>a.title === 'items'
      );
      if(newItemsNode && newItemsNode.uiSchema) {
        newUiSchema.items = newItemsNode.uiSchema;
      }
    }
  }
  return newUiSchema;
}

function updateNode(oldNode, newChildren) {
  if(!oldNode.schema) {
    return Object.assign({}, oldNode, {children: newChildren});
  }
  const schema = updateSchema(oldNode, newChildren);
  const uiSchema = updateUiSchema(oldNode, newChildren);
  const newNode = Object.assign({}, oldNode, {
    schema,
    uiSchema,
    children: newChildren
  });
  if(isEmptyObject(uiSchema)) {
    delete newNode.uiSchema;
  }
  return newNode;
}

function updateArrayIndex(tree) {
  return tree.map(
    (node, i) => node.title === i.toString() ? node : updateNodeParentKeyAndTitle(node,null,i.toString())
  );
}


function _removeNodeByPath(tree, [head, ...tail], arrayItemsFlag=0) {
  if(!head && head !== 0){
    return tree;
  }
  let removed = false;
  let newTree = [];
  if(!tail.length) {
    let newTree = tree.filter(a=>a.title !== head);
    if(arrayItemsFlag === 2) {
      newTree = updateArrayIndex(newTree);
    }
    return newTree.length === tree.length ? tree : newTree;
  }
  for(const node of tree) {
    if (node.title !== head) {
      newTree.push(node);
      continue;
    }
    if(node.schema &&
       node.schema.type==='array' &&
       Array.isArray(node.schema.items)
      ) {
      arrayItemsFlag = 1;
    } else if(arrayItemsFlag === 1 && head==='[items]') {
      arrayItemsFlag = 2;
    } else {
      arrayItemsFlag = 0;
    }
    const newChildren = _removeNodeByPath(
      node.children,
      tail,
      arrayItemsFlag,
    );
    if(newChildren === node.children) {
      // no change
      return tree;
    }
    removed = true;
    newTree.push(updateNode(node, newChildren));
  }
  return removed ? newTree : tree;
}

function removeNodeByPath(tree, path) {
  return _removeNodeByPath(tree, path);
}

function removeNode(tree, key) {
  return _removeNodeByPath(tree, key.split('.'));
}



function _addNodeByPath(tree, [head, ...tail], position, node2Add, arrayItemsFlag=0) {
  if(!head && head !== 0){
    return tree;
  }
  let added = false;
  let newTree = [];
  if(!tail.length) {
    tree = tree || [];
    let added = false;
    for (const i in tree) {
      const cn = tree[i];
      if(cn.title!==head) {
        newTree.push(cn);
        continue;
      }
      added = true;
      if(position < i) newTree.push(
        updateNodeParentKeyAndTitle(
          node2Add,
          getNodeParentKey(cn)
        )
      );
      if(position === +i) {
        let newNodeChildren = [
          ...cn.children||[],
          updateNodeParentKeyAndTitle(node2Add, cn.key)
        ];
        if(arrayItemsFlag === 1) {
          newNodeChildren = updateArrayIndex(newNodeChildren);
        }
        newTree.push(updateNode(cn, newNodeChildren));
      } else {
        newTree.push(cn);
      }
      if(position > i) newTree.push(
        updateNodeParentKeyAndTitle(
          node2Add,
          getNodeParentKey(cn)
        )
      );
    }
    if(!added)
      return tree;
    if(arrayItemsFlag===2) {
      return updateArrayIndex(newTree);
    }
    return newTree;
  }
  for(const node of tree) {
    if (node.title !== head) {
      newTree.push(node);
      continue;
    }
    if(node.schema &&
       node.schema.type==='array' &&
       Array.isArray(node.schema.items)
      ) {
      arrayItemsFlag = 1;
    } else if(arrayItemsFlag === 1 && head==='[items]') {
      arrayItemsFlag = 2;
    } else {
      arrayItemsFlag = 0;
    }
    const newChildren = _addNodeByPath(
      node.children,
      tail,
      position,
      node2Add,
      arrayItemsFlag
    );
    if (newChildren === node.children) {
      // no change
      return tree;
    }
    added = true;
    newTree.push(
      updateNode(node, newChildren)
    );
  }
  return added ? newTree : tree;
}

function addNodeByPath(tree, [head, ...tail], position, newNode) {
  return _addNodeByPath(tree, [head, ...tail], position, newNode);
}

function addNode(tree, targetKey, position, newNode) {
  return _addNodeByPath(
    tree,
    targetKey.split('.'),
    position,
    newNode
  );
}


function _moveNodeByPath(tree, [sh,...st], [th,...tt], position, arrayItemsFlag=0) {
  if(!sh) return tree;
  if(sh===th) {
    let newTree = [];
    let updated = false;
    for (const node of tree) {
      if (node.title !== sh) {
        newTree.push(node);
        continue;
      };
      if(node.schema &&
         node.schema.type==='array' &&
         Array.isArray(node.schema.items)
        ) {
        arrayItemsFlag = 1;
      } else if(arrayItemsFlag === 1 && sh==='[items]') {
        arrayItemsFlag = 2;
      } else {
        arrayItemsFlag = 0;
      }
      const newChildren = _moveNodeByPath(
        node.children,
        st, tt,
        position,
        arrayItemsFlag
      );
      if (newChildren === node.children) {
        // no change
        return tree;
      }
      updated = true;
      if(tt.length===1 && st.length === 1 &&
         node.schema && node.schema.type==='object') {
        let properties = {};
        for (const child of newChildren) {
          properties[child.title] = child.schema;
        }
        const schema = Object.assign(
          {},node.schema,{properties}
        );
        newTree.push(Object.assign(
          {},node, {
            schema,
            children: newChildren
          }
        ));
      } else {
        newTree.push(
          updateNode(node, newChildren)
        );
      }
    }
    return updated ? newTree : tree;
  }
  if(!st.length && !tt.length) {
    let newTree = [];
    let updated = false;
    const node2move = tree.find(a=>a.title===sh);
    if(!node2move) return tree;
    for (const i in tree) {
      const cn = tree[i];
      if(cn.title === sh) continue;
      if(cn.title === th) {
        updated = true;
        if(position < i) newTree.push(node2move);
        if(position === +i) {
          let newNodeChildren = [
            ...cn.children||[],
            updateNodeParentKeyAndTitle(node2move, cn.key)
          ];
          if(arrayItemsFlag === 1) {
            newNodeChildren = updateArrayIndex(newNodeChildren);
          }
          newTree.push(updateNode(cn, newNodeChildren));
        } else {
          newTree.push(cn);
        }
        if(position > i) newTree.push(node2move);
      } else {
        newTree.push(cn);
      }
    }
    if(arrayItemsFlag === 2) {
      newTree = updateArrayIndex(newTree);
    }
    return updated ? newTree : tree;
  }

  const node2move = getNodeByPath(tree,[sh, ...st]);
  if(!node2move) return tree;
  const tmpTree = _removeNodeByPath(tree, [sh, ...st], arrayItemsFlag);
  const newTree = _addNodeByPath(tmpTree, [th, ...tt], position, node2move, arrayItemsFlag);
  return newTree === tmpTree ? tree : newTree;
}

function moveNodeByPath(tree, sourceNode, targetNode, position) {
  return _moveNodeByPath(tree, sourceNode, targetNode, position);
}
function moveNode(tree, sourceKey, targetKey, position) {
  return _moveNodeByPath(
    tree,
    sourceKey.split('.'),
    targetKey.split('.'),
    position
  );
}


function _setNodeSchemaByPath(tree, [head,...tail], schema, uiSchema) {
    let newTree = [];
    let updated = false;
  for (const node of tree) {
    console.log(node.title,head);
      if(node.title !== head) {
        newTree.push(node);
        continue;
      }
      let newNode = Object.assign({},node);
      if(!tail.length) {
        if(schema) {
          updated = true;
          const oldSchema = node.schema;
          const newSchema = Object.assign({},schema);
          newSchema.type = oldSchema.type;
          if(newSchema.type === 'object') {
            newSchema.properties = oldSchema.properties;
          }
          if(newSchema.type === 'array') {
            newSchema.items = oldSchema.items;
            newSchema.additionalItems = oldSchema.items;
          }
          newNode.schema = newSchema;
        }
        if(uiSchema) {
          updated = true;
          const oldUiSchema = node.uiSchema;
          const newUiSchema = Object.assign({}, uiSchema);
          for(const i in node.uiSchema) {
            if(!i.startsWith('ui:')) {
              newUiSchema[i] = oldUiSchema[i];
            }
          }
          if(isEmptyObject(newUiSchema)) {
            delete newNode.uiSchema;
          } else {
            newNode.uiSchema = newUiSchema;
          }
        }
        newTree.push(newNode);
      } else {
        if(node.children) {
          const newChildren = _setNodeSchemaByPath(
            node.children,
            tail,
            schema,
            uiSchema
          );
          if(newChildren === node.children) {
            return tree;
          }
          updated = true;
          newTree.push(updateNode(node, newChildren));
        } else {
          return tree;
        }
      }
    }
  return updated ? newTree : tree;
}

function setNodeSchemaByPath(tree, path, schema, uiSchema) {
  return _setNodeSchemaByPath(tree, path, schema, uiSchema);
}

function setNodeSchema(tree, key, schema, uiSchema) {
  return _setNodeSchemaByPath(tree, key.split('.'), schema, uiSchema);
}


module.exports = {
  schema2tree,
  removeNodeByPath,
  addNodeByPath,
  moveNodeByPath,
  setNodeSchemaByPath,

  getNode,
  removeNode,
  addNode,
  moveNode,
  setNodeSchema,
};
