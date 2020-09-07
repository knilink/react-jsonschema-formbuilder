import * as React from 'react';
import { Menu } from 'antd';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { FormBuilderContext } from '../FormBuilderContext';
import { addSchemaNode, addExtraPropsNode, getSchemaByPath } from '../utils';
const { Item } = Menu;

function nameGen(name: string, occupied: string[]) {
  let n = 1;
  let newName = name;
  while (occupied && occupied.includes(newName)) {
    newName = name + '_' + n;
    n += 1;
  }
  return newName;
}

const menueSchema: JSONSchema7 = {
  type: 'object',
  title: 'Basic',
  properties: {
    text: { type: 'string', title: 'Text' },
    textarea: { type: 'string', title: 'Text Area' },
    date: { type: 'string', title: 'Date' },
    time: { type: 'string', title: 'Timel' },
    password: { type: 'string', title: 'Password' },
    number: { type: 'number', title: 'Number' },
    rate: { type: 'number', title: 'Rate' },
    slider: { type: 'integer', minimum: 0, maximum: 100, title: 'Slider' },
    select: {
      type: 'string',
      enum: ['foo', 'bar', 'baz'],
      title: 'Select',
    },
    radioGroup: {
      type: 'string',
      enum: ['foo', 'bar', 'baz'],
      title: 'Radio Group',
    },
    checkbox: { type: 'boolean', title: 'Checkbox' },
    switch: { type: 'boolean', title: 'Switch' },
    checkboxGroup: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['foo', 'bar', 'baz'],
      },
      uniqueItems: true,
      title: 'Checkbox Group',
    },
  },
};

const menuExtraProps = {
  properties: {
    textarea: { component: 'TextArea' },
    password: { component: 'Password' },
    date: { component: 'DatePicker' },
    time: { component: 'TimePicker' },
    rate: { component: 'Rate' },
    slider: { component: 'Slider' },
    radioGroup: { component: 'RadioGroup' },
    switch: { component: 'Switch' },
  },
};

export const AddItemMenu: React.FC<{ schemaPath: (string | number)[] }> = ({ schemaPath }) => {
  const { schema, setSchema, extraProps, setExtraProps, setSelectedNodePath } = React.useContext(FormBuilderContext);

  const selectedSchema = getSchemaByPath(schema, schemaPath);

  const handleAddNode = (key: string, newSchemaNode: JSONSchema7Definition, newExtraPropsNode: any) => {
    if (typeof selectedSchema === 'boolean' || !selectedSchema?.properties) return;
    const properties = selectedSchema?.properties || {};

    const childrenNames = Object.keys(properties);
    const name = nameGen(key, childrenNames);

    const newSchema = addSchemaNode(schema, schemaPath, 0, name, newSchemaNode);
    if (newSchema !== schema) {
      setSchema(newSchema);
      setExtraProps(addExtraPropsNode(extraProps, [...schemaPath, 'properties', name], newExtraPropsNode));
      setSelectedNodePath([...schemaPath, 'properties', name]);
    }
  };

  const { properties } = menueSchema;

  if (!properties) return null;

  return (
    <Menu mode="inline" theme="dark">
      {Object.keys(properties).map((key) => {
        const itemSchema = properties[key];
        const itemExtraProps = (menuExtraProps.properties as any)[key];
        key === 'textarea' && console.log(itemExtraProps);
        if (typeof itemSchema === 'boolean') return null;

        return (
          <Item key={key} onClick={() => handleAddNode(key, itemSchema, itemExtraProps)}>
            {itemSchema.title || key}
          </Item>
        );
      })}
    </Menu>
  );
};

/*
class AddItemMenu extends React.Component {
  onAddNode = (node2add) => {
    const { addNode } = this.props;
    const name = nameGen(
      node2add.name,
      this.props.node.children.map((a) => a.name)
    );
    addNode({ ...node2add, name });
  };
  render() {
    const {
      menu: { children: menuTree },
      menuOpenKeys,
      menuOpenChange,
    } = this.props;
    return (
      <Menu mode="inline" theme="dark" openKeys={menuOpenKeys} onOpenChange={menuOpenChange}>
        {menuTree.map((a) =>
          a.schema && a.schema.type === 'object' && a.children && a.children.length ? (
            <SubMenu key={a.key} title={a.schema.title || a.name}>
              {a.children.map((b) => (
                <Item key={b.key} onClick={() => this.onAddNode(b)}>
                  {b.schema.title || b.name}
                </Item>
              ))}
            </SubMenu>
          ) : (
            <Item key={a.key} onClick={() => this.onAddNode(a)}>
              {a.schema.title || a.name}
            </Item>
          )
        )}
      </Menu>
    );
  }
}

export default connect(
  ({ menu, menuOpenKeys }) => ({ menu, menuOpenKeys }),
  (dispatch, { node }) => ({
    addNode: (node2add) =>
      dispatch({
        type: 'TREE_ADD_NODE',
        payload: {
          targetNodeKey: node.key,
          position: 0,
          node2add,
        },
      }),
    menuOpenChange: (keys) =>
      dispatch({
        type: 'MENU_OPEN_KEYS_SET',
        payload: keys,
      }),
  })
)(AddItemMenu);
*/
