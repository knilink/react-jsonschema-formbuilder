import * as React from 'react';
import { Tabs } from 'antd';
import { NodeJsonEditor } from './JsonEditor';
import { SchemaEditor } from './SchemaEditor';

const { getNode } = require('../core');
const { TabPane } = Tabs;

// const editorList = [NodeJsonEditor];

export const Editor: React.FC = () => {
  const Editor = NodeJsonEditor;
  return (
    <Tabs defaultActiveKey={'schema'} type="card">
      <TabPane tab={'Schema'} key={'schema'} style={{ padding: '0px 16px' }}>
        <SchemaEditor />
      </TabPane>
      <TabPane tab={'Json'} key={'json'} style={{ padding: '0px 16px' }}>
        <Editor />
      </TabPane>
    </Tabs>
  );
};

/*
class Editor extends React.Component {
  updateUiOptions = (uiOptionsUpdate) => {
    const { uiSchema = {}, key } = this.props.node;
    const uiOptions = uiSchema['ui:options'] || {};
    const newUiOptions = { ...uiOptions, ...uiOptionsUpdate };
    for (const i in newUiOptions) {
      if (newUiOptions[i] !== undefined) {
        this.props.updateNode(key, { uiSchema: { ...uiSchema, 'ui:options': { ...uiOptions, ...newUiOptions } } });
        return;
      }
    }
    this.props.updateNode(key, { uiSchema: { ...uiSchema, 'ui:options': undefined } });
  };

  render() {
    const { node, updateNode } = this.props;
    if (!(node && node.schema)) return null;
    const filteredEditors = editorList.filter((a) => a.filter(node));
    return (
      <Tabs defaultActiveKey={filteredEditors[0].key} type="card">
        {filteredEditors.map((Editor) => (
          <TabPane tab={Editor.name} key={Editor.key}>
            <div style={{ margin: '0px 16px' }}>
              <Editor
                key={node.key}
                node={node}
                updateNode={(nodeUpdate) => updateNode(node.key, nodeUpdate)}
                updateSchema={(schemaUpdate) => updateNode(node.key, { schema: { ...node.schema, ...schemaUpdate } })}
                updateUiSchema={(uiSchemaUpdate) =>
                  updateNode(node.key, { uiSchema: { ...node.uiSchema, ...uiSchemaUpdate } })
                }
                updateUiOptions={this.updateUiOptions}
              />
            </div>
          </TabPane>
        ))}
      </Tabs>
    );
  }
}

export default connect(
  ({ tree: { present }, activeNodeKey }) => ({
    node: activeNodeKey && getNode(present, activeNodeKey),
  }),
  (dispatch) => ({
    updateNode: (target, nodeUpdate) =>
      dispatch({
        type: 'TREE_UPDATE_NODE',
        payload: {
          target,
          nodeUpdate,
        },
      }),
  })
)(Editor);
*/
