const basic = {
  schema: {
    type:'object',
    title:'Basic',
    properties: {
      object: {type:'object', title:'Object', porperties: {}},
      text: {type:'string', title:'Text'},
      checkbox: {type:'boolean', title:'Checkbox'},
      dropdown: {
        type:'string',
        title: 'Dropdown',
        enum: ['option-1','option-2','option-3'],
        enumNames: ['Option 1', 'Option 2', 'Option 3']
      },
      number: {type:'number', title:'Number'},
      textarea: {type:'string', title:'Text Area'},
      datetime: {type:'string', title: 'Date Time'},
      multiChoices: {
        "type": "array",
        "title": "Multiple Choices",
        "items": {
          "type": "string",
          "enum": [
            "option-1",
            "option-2",
            "option-3",
          ]
        },
        "uniqueItems": true
      }

    }
  },
  uiSchema: {
    textarea: { 'ui:widget': 'textarea' },
    datetime: { 'ui:widget': 'datetime' },
    multiChoices: {
      "ui:widget": "checkboxes"
    }
  }
};

module.exports = {
  schema: {
    type:'object',
    properties: {
      basic: basic.schema
    }
  },
  uiSchema: {
    basic: basic.uiSchema
  }
};
