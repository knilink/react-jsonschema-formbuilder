import React from 'react';
import JsonEditor from '../JsonEditor';
import { FormBuilderContext } from '../FormBuilderContext';
import { Input } from 'antd';
import { replaceSchemaNode, renameSchemaNode, replaceExtraPropsNode } from '../utils';
import { JSONSchema7Definition } from 'json-schema';

export const NodeJsonEditor: React.FC = () => {
  const {
    selectedNodePath,
    setSelectedNodePath,

    schema,
    selectedSchema,
    setSchema,

    extraProps,
    selectedExtraProps,
    setExtraProps,
  } = React.useContext(FormBuilderContext);

  if (!selectedNodePath || !selectedSchema) return null;
  return (
    <>
      <Input
        value={selectedNodePath[selectedNodePath.length - 1]}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedNodePath([...selectedNodePath.slice(0, -1), value]);
          setSchema(renameSchemaNode(schema, selectedNodePath, value));
        }}
      />
      <JsonEditor
        value={selectedSchema}
        onChange={(newNode) => setSchema(replaceSchemaNode(schema, selectedNodePath, newNode as JSONSchema7Definition))}
        autoSize
      />
      <JsonEditor
        value={selectedExtraProps}
        onChange={(newNode) => setExtraProps(replaceExtraPropsNode(extraProps, selectedNodePath, newNode))}
        autoSize
      />
    </>
  );
};

/*
export default class NodeJsonEditor extends React.Component {
  static get key() {
    return 'json-editor';
  }
  static get name() {
    return 'Json';
  }
  static filter(node) {
    return true;
  }

  constructor(props) {
    super(props);
    const { schema, uiSchema } = props;
    this.state = {
      schemaJsonString: JSON.stringify(schema, null, 2),
      uiSchemaJsonString: JSON.stringify(schema, null, 2),
      schema,
      uiSchema,
    };
  }

  render() {
    const { node, updateNode } = this.props;
    const { schema, uiSchema } = node;
    const { properties, items, additionalItems, ...rschema } = schema;
    return (
      <div>
        <Input value={node.name} onChange={(e) => updateNode({ name: e.target.value })} />
        <JsonEditor value={rschema} onChange={(schema) => updateNode({ schema })} autoSize />
        <JsonEditor value={uiSchema} onChange={(uiSchema) => updateNode({ uiSchema })} autoSize />
      </div>
    );
  }
}
*/
