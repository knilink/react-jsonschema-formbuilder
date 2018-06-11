var {
  schema2tree,
  getNode,
  removeNode,
  addNode,
  moveNode,
  updateNode,
} = require('./core');

var undoable = require('redux-undo').default;
var { includeAction } = require('redux-undo');
var { combineReducers } = require('redux');

var DEFAULT_TREE_NAME = 'root';

var s = {
  "title": "A registration form",
  "description": "A simple form example.",
  "type": "object",
  "required": [
    "firstName",
    "lastName"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First name"
    },
    "lastName": {
      "type": "string",
      "title": "Last name"
    },
    "age": {
      "type": "integer",
      "title": "Age"
    },
    "bio": {
      "type": "string",
      "title": "Bio"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "minLength": 3
    },
    "telephone": {
      "type": "string",
      "title": "Telephone",
      "minLength": 10
    }
  }
};
var us = {
  "firstName": {
    "ui:autofocus": true,
    "ui:emptyValue": ""
  },
  "age": {
    "ui:widget": "updown",
    "ui:title": "Age of person",
    "ui:description": "(earthian year)"
  },
  "bio": {
    "ui:widget": "textarea"
  },
  "password": {
    "ui:widget": "password",
    "ui:help": "Hint: Make it strong!"
  },
  "date": {
    "ui:widget": "alt-datetime"
  },
  "telephone": {
    "ui:options": {
      "inputType": "tel"
    }
  }
};

var emptyTree =  schema2tree(
  DEFAULT_TREE_NAME,
  s,
  us
);

function rjsfId2nodeKey(tree, rjsfId) {
  for (const node of tree) {
    if(node && node.title===rjsfId) {
      return node.key;
    }
    if(rjsfId.startsWith(node.title) &&
       rjsfId[node.title.length]==='_') {
      if (node.children) {
        rjsfId = rjsfId.slice(node.title.length+1);
        const key = rjsfId2nodeKey(node.children, rjsfId);
        if(key) return key;
      }
    }
  }
  return null;
}

function setTargetKeyByRjsfId(tree, action) {
  const { rjsfId } = action.payload;
  const target = rjsfId2nodeKey(tree, rjsfId);
  if(!target) return null;
  action = Object.assign({}, action, {
    payload: Object.assign({}, action.payload, {target})
  });
  return action;
}


function tree(state=emptyTree, action) {
  switch(action.type) {
  case 'TREE_CLEAR':
    return emptyTree;
  case 'TREE_SET_TREE':{
    const {name, schema, uiSchema} = action.payload;
    return schema2tree(
      name || (state[0] && state[0].title) || DEFAULT_TREE_NAME,
      schema || state[0].schema,
      uiSchema || state[0].uiSchema
    );
  }
  case 'TREE_ADD_NODE': {
    const {
      targetNodeKey,
      position,
      node2add
    } = action.payload;
    return addNode(
      state,
      targetNodeKey,
      position,
      node2add
    );
  }
  case 'TREE_REMOVE_NODE':
    return removeNode(state,action.payload);
  case 'TREE_MOVE_NODE':{
    const { source, target, position } = action.payload;
    return moveNode(state, source, target, position);
  }
  case 'TREE_UPDATE_NODE_BY_RJSF_ID': {
    action = setTargetKeyByRjsfId(state, action);
    if(!action) return state;
  }
  case 'TREE_UPDATE_NODE': {
    const { target, nodeUpdate } = action.payload;
    return updateNode(state, target, nodeUpdate);
  }
  default :
    return state;
  }
}

function activeNodeKey(state=null, action) {
  switch(action.type) {
  case 'ACTIVE_NODE_KEY_SET':
    return action.payload || null;
  case 'TREE_UPDATE_NODE':
    const { target, nodeUpdate } = action.payload;
    if(state && nodeUpdate.title) {
      const path = state.split('.');
      if (path[path.length-1]!==nodeUpdate.title) {
        return path.slice(0,-1).join('.')+'.'+nodeUpdate.title;
      }
    }
    return state;
  case 'TREE_SET_TREE':
  case 'TREE_CLEAR':
    return null;
  default:
    return state;
  }
}


var defaultSettings = {
  leftSiderWidth: 240
};

function settings(state=defaultSettings) {
  return state;
}


var reducer = combineReducers({
  tree: undoable(tree,{
    filter: includeAction([
      'TREE_UPDATE_NODE',
      'TREE_SET_TREE',
      'TREE_CLEAR',
      'TREE_ADD_NODE',
      'TREE_REMOVE_NODE',
      'TREE_MOVE_NODE'
    ]),
  }),
  activeNodeKey,
  settings,
});

module.exports = reducer;


var { toIdSchema } = require('react-jsonschema-form/lib/utils');

`toIdSchema(
  schema,
  id,
  definitions,
  formData = {},
  idPrefix = "root"
)`
