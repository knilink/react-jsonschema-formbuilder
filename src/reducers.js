var { schema2tree, schema2node, removeNode, addNode, moveNode, updateNode, getNodeByRjsfId } = require('./core');
var defaultSettings = require('./default/settings');
var defaultMenuSchema = require('./default/menu');
var defaultMenu = schema2node(['menu'], defaultMenuSchema.schema, defaultMenuSchema.uiSchema);
var undoable = require('redux-undo').default;
var { includeAction } = require('redux-undo');
var { combineReducers } = require('redux');

var DEFAULT_TREE_NAME = 'root';

var emptyTree = schema2tree(DEFAULT_TREE_NAME, { type: 'object', properties: {} });

function tree(state = emptyTree, action) {
  switch (action.type) {
    case 'TREE_CLEAR':
      return emptyTree;
    case 'TREE_SET_TREE': {
      const { name, schema, uiSchema } = action.payload;
      return schema2tree(
        name || (state[0] && state[0].name) || DEFAULT_TREE_NAME,
        schema || state[0].schema,
        uiSchema || state[0].uiSchema
      );
    }
    case 'TREE_ADD_NODE': {
      const { targetNodeKey, position, node2add } = action.payload;
      return addNode(state, targetNodeKey, position, node2add);
    }
    case 'TREE_REMOVE_NODE':
      const newState = removeNode(state, action.payload);
      return newState.length ? newState : emptyTree;
    case 'TREE_MOVE_NODE': {
      const { source, target, position } = action.payload;
      return moveNode(state, source, target, position);
    }
    case 'TREE_UPDATE_NODE': {
      const { target, nodeUpdate } = action.payload;
      const newState = updateNode(state, target, nodeUpdate);
      return newState;
    }
    default:
      return state;
  }
}

function activeNodeKey(state = null, action) {
  switch (action.type) {
    case 'ACTIVE_NODE_KEY_SET':
      return action.payload || null;
    case 'TREE_UPDATE_NODE':
      const { target, nodeUpdate } = action.payload;
      if (state === target && nodeUpdate.name) {
        const path = state.split('.');
        if (path[path.length - 1] !== nodeUpdate.name) {
          return path.slice(0, -1).join('.') + '.' + nodeUpdate.name;
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

function formData(state = {}, action) {
  switch (action.type) {
    case 'FORM_DATA_SET':
      return action.payload;
    default:
      return state;
  }
}

function settings(state = defaultSettings, action) {
  switch (action.type) {
    case 'SETTINGS_UPDATE':
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}

function menu(state = defaultMenu, action) {
  switch (action.type) {
    case 'MENU_SET': {
      const { schema, uiSchema } = action.payload;
      return schema2node(['menu'], schema, uiSchema);
    }
    case 'MENU_DEFAULT': {
      return defaultMenu;
    }
    default:
      return state;
  }
}

function menuOpenKeys(state = [], action) {
  switch (action.type) {
    case 'MENU_OPEN_KEYS_SET':
      return action.payload;
    default:
      return state;
  }
}

function removeUnnecessaryHistory(reducer) {
  return (state, action) => {
    let newState = reducer(state, action);
    delete newState.history;
    return newState;
  };
}

var reducer = combineReducers({
  tree: removeUnnecessaryHistory(
    undoable(tree, {
      filter: includeAction([
        'TREE_UPDATE_NODE',
        'TREE_SET_TREE',
        'TREE_CLEAR',
        'TREE_ADD_NODE',
        'TREE_REMOVE_NODE',
        'TREE_MOVE_NODE',
      ]),
    })
  ),
  activeNodeKey,
  settings,
  menu,
  formData,
  menuOpenKeys,
});

module.exports = function(state, action) {
  console.log(state, action);
  switch (action.type) {
    case 'TREE_REMOVE_NODE_BY_RJSF_ID': {
      const target = getNodeByRjsfId(state.tree.present, action.payload);
      if (!target) return state;
      action = {
        type: 'TREE_REMOVE_NODE',
        payload: target.key,
      };
      break;
    }
    case 'ACTIVE_NODE_KEY_SET_BY_RJSF_ID': {
      const target = getNodeByRjsfId(state.tree.present, action.payload);
      if (!target) return state;
      action = {
        type: 'ACTIVE_NODE_KEY_SET',
        payload: target.key,
      };
      break;
    }
    case 'TREE_UPDATE_NODE_BY_RJSF_ID': {
      const { rjsfId } = action.payload;
      const target = getNodeByRjsfId(state.tree.present, rjsfId);
      if (!target) return state;
      action = {
        type: 'TREE_UPDATE_NODE',
        payload: Object.assign({}, action.payload, { target: target.key }),
      };
      break;
    }
    default:
      break;
  }
  return reducer(state, action);
};
