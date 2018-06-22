function isEmptyObject(obj) {
  if(!obj) return true;
  for(const i in obj) {
    if(obj[i] !== undefined) {
      return false;
    }
  }
  return true;
}

function isLeaf(node) {
  return node.isLeaf;
}


function schema2tree(name, schema, uiSchema) {
  return [schema2node([name], schema, uiSchema)];
}


let forceChange = ((FORCE_CHANGE_KEY) => (obj) => {
  // workaround for forcing rjsf to rerender because the schema still deep equal to after reordering properties.
  if(FORCE_CHANGE_KEY in obj) {
    delete obj[FORCE_CHANGE_KEY];
  } else {
    obj[FORCE_CHANGE_KEY] = undefined;
  }
})(`__${Date.now()}__`);

try {
  if(process.env.NODE_ENV === 'test'){
    forceChange = a=>a;
  }
} catch (e) {

}


function schema2node(path, schema, uiSchema) {
  if(!schema) return null;
  const key = path.join('.');
  const name = path[path.length-1];
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
      name,
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
        name: '[items]',
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
        children.push(schema2node(
            nextPath,
            schema.additionalItems,
            uiSchema && uiSchema.additionalItems
          )
        );
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
      name,
      schema,
      uiSchema,
      children,
      //path,
    };

  }
  return {
    key,
    name,
    //path,
    schema,
    uiSchema,
    isLeaf: true
  };
}

function getNodeByPath(tree, path) {
  let node;
  let children = tree;
  for(const i of path) {
    node = children.find(a=>a.name===i);
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
    const key = parentKey + '.' + node.name;
    return Object.assign({}, node, {
      key: parentKey + '.' + node.name,
    }, node.children && {
      children: updateParentKey(node.children, key)
    });
  });
}

function getNodeParentKey(node) {
  return node.key.substring(
    0, node.key.length - node.name.length - 1
  );
}

function updateNodeParentKeyAndName(node, parentKey, name) {
  if(!name) {
    name = node.name;
  }
  if(!parentKey) {
    parentKey = getNodeParentKey(node);
  }
  const newKey = parentKey ? parentKey+'.'+name : name;
  if(node.key === newKey) return node;
  return Object.assign(
    {}, node, {
      name,
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
      newProperties[child.name] = child.schema;
    }
    newSchema.properties = newProperties;
  }
  else if (node.schema.type==='array') {
    if (Array.isArray(node.schema.items)) {
      // items is array
      newSchema = Object.assign({}, node.schema);
      const newItemsNode = newChildren.find(
        a=>a.name==='[items]'
      );
      const oldItemsNode = node.children.find(
        a=>a.name==='[items]'
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
          a=>a.name==='additionalItems'
        );
        if(newAdditionalItemsNode){
          newSchema.additionalItems = newAdditionalItemsNode.schema;
        } else {
          delete newSchema.additionalItems;
        }
      }
    } else {
      // items is not array
      const newItemsNode = newChildren.find(
        a=>a.name === 'items'
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
    if(i.startsWith('ui:') || i==='classNames') {
      newUiSchema[i] = node.uiSchema[i];
    }
  }
  if (node.schema.type==='object') {
    for(const child of newChildren) {
      if(child.uiSchema) {
        newUiSchema[child.name] = child.uiSchema;
      }
    }
  }
  else if (node.schema.type === 'array') {
    if (Array.isArray(node.schema.items)) {
      // items is array
      const newItemsNode = newChildren.find(
        a=>a.name==='[items]'
      );
      const oldItemsNode = node.children.find(
        a=>a.name==='[items]'
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
          a=>a.name==='additionalItems'
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
        a=>a.name === 'items'
      );
      if(newItemsNode && newItemsNode.uiSchema) {
        newUiSchema.items = newItemsNode.uiSchema;
      }
    }
  }
  return newUiSchema;
}

function updateNodeByNewChildren(oldNode, newChildren) {
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
    (node, i) => node.name === i.toString() ? node : updateNodeParentKeyAndName(node,null,i.toString())
  );
}


function _removeNodeByPath(tree, [head, ...tail], arrayItemsFlag=0) {
  if(!head && head !== 0){
    return tree;
  }
  let removed = false;
  let newTree = [];
  if(!tail.length) {
    let newTree = tree.filter(a=>a.name !== head);
    if(arrayItemsFlag === 2) {
      newTree = updateArrayIndex(newTree);
    }
    return newTree.length === tree.length ? tree : newTree;
  }
  for(const node of tree) {
    if (node.name !== head) {
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
    let newNode = updateNodeByNewChildren(node, newChildren);
    let newSchema = null;
    if (tail.length===1 &&
        (newSchema = newNode.schema) &&
        newSchema.required
       ) {
      const newRequired = newSchema.required.filter(a=>a!==tail[0]);
      if(newRequired.length !== newSchema.required.length) {
        newNode.schema = Object.assign(
          {},
          newSchema, {
            required: newRequired.length ? newRequired : undefined
          }
        );
      }
    }
    newTree.push(newNode);
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
      if(cn.name!==head) {
        newTree.push(cn);
        continue;
      }
      added = true;
      if(position < 0) {
        if(!arrayItemsFlag &&
           tree.find(a=>a.name===node2Add.name)
          ) {
          // name already exists;
          return tree;
        }
        newTree.push(
          updateNodeParentKeyAndName(
            node2Add,
            getNodeParentKey(cn)
          )
        );
      }
      if(position === 0) {
        if(isLeaf(cn)) return tree;
        if(!arrayItemsFlag &&
           cn.children.find(a=>a.name===node2Add.name)
          ) {
          // name already exists;
          return tree;
        }

        let newNodeChildren = [
          ...cn.children||[],
          updateNodeParentKeyAndName(node2Add, cn.key)
        ];
        if(arrayItemsFlag === 1) {
          newNodeChildren = updateArrayIndex(newNodeChildren);
        }
        newTree.push(updateNodeByNewChildren(cn, newNodeChildren));
      } else {
        newTree.push(cn);
      }
      if(position > 0) {
        if(!arrayItemsFlag &&
           tree.find(a=>a.name===node2Add.name)
          ) {
          // name already exists;
          return tree;
        }
        newTree.push(
          updateNodeParentKeyAndName(
            node2Add,
            getNodeParentKey(cn)
          )
        );
      }
    }
    if(!added)
      return tree;
    if(arrayItemsFlag===2) {
      return updateArrayIndex(newTree);
    }
    return newTree;
  }
  for(const node of tree) {
    if (node.name !== head) {
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
      updateNodeByNewChildren(node, newChildren)
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
  if(sh===th && tt.length) {
    let newTree = [];
    let updated = false;
    for (const node of tree) {
      if (node.name !== sh) {
        newTree.push(node);
        continue;
      };
      if (isLeaf(node)) return tree;
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
        // reorder object properties
        let properties = {};
        for (const child of newChildren) {
          properties[child.name] = child.schema;
        }
        let schema = Object.assign(
          {},node.schema,{
            properties,
          }
        );
        forceChange(schema);
        newTree.push(Object.assign(
          {},node, {
            schema,
            children: newChildren
          }
        ));
      } else {
        newTree.push(
          updateNodeByNewChildren(node, newChildren)
        );
      }
    }
    return updated ? newTree : tree;
  }

  if(!st.length && !tt.length) {
    let newTree = [];
    let updated = false;
    const node2move = tree.find(a=>a.name===sh);
    if(!node2move) return tree;
    for (const i in tree) {
      const cn = tree[i];
      if(cn.name === sh) continue;
      if(cn.name === th) {
        updated = true;
        if(position < 0) newTree.push(node2move);
        if(position === 0) {
          if(isLeaf(cn)) return tree;
          let newNodeChildren = [
            ...cn.children||[],
            updateNodeParentKeyAndName(node2move, cn.key)
          ];
          if(arrayItemsFlag === 1) {
            newNodeChildren = updateArrayIndex(newNodeChildren);
          }
          newTree.push(updateNodeByNewChildren(cn, newNodeChildren));
        } else {
          newTree.push(cn);
        }
        if(position > 0) newTree.push(node2move);
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


function _updateNodeByPath(tree, [head,...tail], nodeUpdate) {
  let newTree = [];
  let updated = false;
  for (const node of tree) {
    if(node.name !== head) {
      newTree.push(node);
      continue;
    }
    let newNode = Object.assign({},node);
    if(!tail.length) {
      const {schema, uiSchema, name} = nodeUpdate;
      let nu = Object.assign({},nodeUpdate);
      delete nu.schema;
      delete nu.uiSchema;
      delete nu.name;
      delete nu.children;
      delete nu.key;
      newNode = Object.assign(newNode, nu);
      if(schema) {
        updated = true;
        const oldSchema = node.schema;
        const newSchema = Object.assign({}, schema);
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
          if(!(i.startsWith('ui:') || i==='classNames')) {
            newUiSchema[i] = oldUiSchema[i];
          }
        }
        if(isEmptyObject(newUiSchema)) {
          delete newNode.uiSchema;
        } else {
          newNode.uiSchema = newUiSchema;
        }
      }
      if (name && name !== newNode.name) {
        if (tree.find(a=>a.name===name)) return tree;
        updated = true;
        newNode = updateNodeParentKeyAndName(
          newNode, null, name
        );
      }
      newTree.push(newNode);
    } else {
      if(node.children) {
        const newChildren = _updateNodeByPath(
          node.children,
          tail,
          nodeUpdate
        );
        if(newChildren === node.children) {
          return tree;
        }
        updated = true;
        let newNode = updateNodeByNewChildren(node, newChildren);
        // update required
        let newSchema = null;
        if (tail.length===1 &&
            nodeUpdate.name &&
            (newSchema = newNode.schema) &&
            newSchema.required &&
            newSchema.required.includes(tail[0])
           ) {
          newNode.schema = Object.assign(
            {},
            newSchema, {
              required: newSchema.required.map(
                a=>a===tail[0]?nodeUpdate.name:a
              )
            }
          );
        }
        newTree.push(
          newNode
        );
      } else {
        return tree;
      }
    }
  }
  return updated ? newTree : tree;
}

function updateNodeByPath(tree, path, nodeUpdate) {
  return _updateNodeByPath(tree, path, nodeUpdate);
}

function updateNode(tree, targetKey, nodeUpdate) {
  return updateNodeByPath(tree, targetKey.split('.'), nodeUpdate);
}

var SEPERATOR = '_';
function getNodeByRjsfId(tree, rjsfId) {
  for (const node of tree) {
    if(node && node.name===rjsfId) {
      return node;
    }
    if(rjsfId.startsWith(node.name) &&
       rjsfId[node.name.length]===SEPERATOR
      ) {
      if(node.schema.type==='array') {
        rjsfId = rjsfId.slice(node.name.length+1);
        const i = rjsfId.indexOf(SEPERATOR);
        const index = i>0 ? rjsfId.slice(0,i) : rjsfId;
        if(isNaN(index)) return null;
        const rest = i>0 ? rjsfId.slice(i+1) : null;
        if(Array.isArray(node.schema.items)) {
          if((+index)<node.schema.items.length) {
            let n = node.children.find(a=>a.name=== '[items]');
            n = n && n.children.find(a=>a.name === index);
            return rest ? n && getNodeByRjsfId(
              n.children,
              rjsfId.slice(i+1)
            ) : n;
          } else {
            let n = node.children.find(a=>a.name==='additionalItems');
            return rest ? n && getNodeByRjsfId(
              n.children,
              rest
            ) : n;
          }
        } else {
          let n = node.children.find(a=>a.name=== 'items');
          return rest ? n && getNodeByRjsfId(
            n.children,
            rjsfId.slice(i+1)
          ) : n;
        }
      }

      if (node.children) {
        rjsfId = rjsfId.slice(node.name.length+1);
        const n = getNodeByRjsfId(node.children, rjsfId);
        if(n) return n;
      }
    }
  }
  return null;
}

module.exports = {
  schema2tree,
  removeNodeByPath,
  addNodeByPath,
  moveNodeByPath,
  updateNodeByPath,

  getNode,
  removeNode,
  addNode,
  moveNode,
  updateNode,
  schema2node,
  getNodeByRjsfId
};
