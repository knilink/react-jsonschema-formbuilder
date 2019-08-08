import { createStore } from 'redux';
import reducer from './reducers';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
var persistConfig = {
  key: 'react-jsonschema-formbuilder',
  storage,
  stateReconciler: hardSet,
  throttle: 15,
};

var { schema2tree } = require('./core');

var form = {
  schema: {
    title: 'A registration form',
    description: 'A simple form example.',
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      firstName: {
        type: 'string',
        title: 'First name',
      },
      lastName: {
        type: 'string',
        title: 'Last name',
      },
      age: {
        type: 'integer',
        title: 'Age',
        description: '(earthian year)',
      },
      bio: {
        type: 'string',
        title: 'Bio',
      },
      password: {
        type: 'string',
        title: 'Password',
        minLength: 3,
      },
      telephone: {
        type: 'string',
        title: 'Telephone',
        minLength: 10,
      },
    },
  },
  uiSchema: {
    firstName: {
      classNames: '',
      'ui:emptyValue': '',
    },
    age: {
      'ui:widget': 'updown',
    },
    bio: {
      'ui:widget': 'textarea',
    },
    password: {
      'ui:widget': 'password',
      'ui:help': 'Hint: Make it strong!',
    },
    date: {
      'ui:widget': 'alt-datetime',
    },
    telephone: {
      'ui:options': {
        inputType: 'tel',
      },
    },
  },
};

var initTree = schema2tree('root', form.schema, form.uiSchema);

var persistedReducer = persistReducer(persistConfig, reducer);

var store = createStore(persistedReducer, {
  tree: {
    past: [],
    present: initTree,
    future: [],
  },
});

var persistor = persistStore(store);

export { store, persistor };
export default { store, persistor };
