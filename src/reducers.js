var {
  schema2tree,
  getNode,
  removeNode,
  addNode,
  moveNode,
  updateNode,
  getNodeByRjsfId
} = require('./core');

var undoable = require('redux-undo').default;
var { includeAction } = require('redux-undo');
var { combineReducers } = require('redux');

var DEFAULT_TREE_NAME = 'root';

var s = {
  "type": "object",
  "properties": {
    "listOfStrings": {
      "type": "array",
      "title": "A list of strings",
      "items": {
        "type": "string",
        "default": "bazinga"
      }
    },
    "multipleChoicesList": {
      "type": "array",
      "title": "A multiple choices list",
      "items": {
        "type": "string",
        "enum": [
          "foo",
          "bar",
          "fuzz",
          "qux"
        ]
      },
      "uniqueItems": true
    },
    "fixedItemsList": {
      "type": "array",
      "title": "A list of fixed items",
      "items": [
        {
          "title": "A string value",
          "type": "string",
          "default": "lorem ipsum"
        },
        {
          "title": "a boolean value",
          "type": "boolean"
        }
      ],
      "additionalItems": {
        "title": "Additional item",
        "type": "number"
      }
    },
    "minItemsList": {
      "type": "array",
      "title": "A list with a minimal number of items",
      "minItems": 3,
      "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "default": "Default name"
          }
        }
      }
    },
    "defaultsAndMinItems": {
      "type": "array",
      "title": "List and item level defaults",
      "minItems": 5,
      "default": [
        "carp",
        "trout",
        "bream"
      ],
      "items": {
        "type": "string",
        "default": "unidentified"
      }
    },
    "nestedList": {
      "type": "array",
      "title": "Nested list",
      "items": {
        "type": "array",
        "title": "Inner list",
        "items": {
          "type": "string",
          "default": "lorem ipsum"
        }
      }
    },
    "unorderable": {
      "title": "Unorderable items",
      "type": "array",
      "items": {
        "type": "string",
        "default": "lorem ipsum"
      }
    },
    "unremovable": {
      "title": "Unremovable items",
      "type": "array",
      "items": {
        "type": "string",
        "default": "lorem ipsum"
      }
    },
    "noToolbar": {
      "title": "No add, remove and order buttons",
      "type": "array",
      "items": {
        "type": "string",
        "default": "lorem ipsum"
      }
    },
    "fixedNoToolbar": {
      "title": "Fixed array without buttons",
      "type": "array",
      "items": [
        {
          "title": "A number",
          "type": "number",
          "default": 42
        },
        {
          "title": "A boolean",
          "type": "boolean",
          "default": false
        }
      ],
      "additionalItems": {
        "title": "A string",
        "type": "string",
        "default": "lorem ipsum"
      }
    }
  }
};
var us = {
  "listOfStrings": {
    "items": {
      "ui:emptyValue": ""
    }
  },
  "multipleChoicesList": {
    "ui:widget": "checkboxes"
  },
  "fixedItemsList": {
    "items": [
      {
        "ui:widget": "textarea"
      },
      {
        "ui:widget": "select"
      }
    ],
    "additionalItems": {
      "ui:widget": "updown"
    }
  },
  "unorderable": {
    "ui:options": {
      "orderable": false
    }
  },
  "unremovable": {
    "ui:options": {
      "removable": false
    }
  },
  "noToolbar": {
    "ui:options": {
      "addable": false,
      "orderable": false,
      "removable": false
    }
  },
  "fixedNoToolbar": {
    "ui:options": {
      "addable": false,
      "orderable": false,
      "removable": false
    }
  }
};

var emptyTree =  schema2tree(
  DEFAULT_TREE_NAME,
  s,
  us
);



function setTargetKeyByRjsfId(tree, action) {
  const { rjsfId } = action.payload;
  const target = getNodeByRjsfId(tree, rjsfId);
  if(!target) return null;
  action = Object.assign({}, action, {
    payload: Object.assign(
      {}, action.payload, {target: target.key}
    )
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
