var { createStore } = require('redux');
var reducer = require('./reducers');
var {
  schema2tree,
} = require('./core');

const form = {
  schema: {
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
        "title": "Age",
        "description": "(earthian year)"
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
  },
  uiSchema: {
    "firstName": {
      "ui:emptyValue": ""
    },
    "age": {
      "ui:widget": "updown"
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
  }
};



var initTree = schema2tree(
  'root',
  form.schema,
  form.uiSchema
);

var store = createStore(reducer, {
  tree:{
    present:initTree
  }
});

module.exports = store;
