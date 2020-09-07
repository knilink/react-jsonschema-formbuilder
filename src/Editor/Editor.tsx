import * as React from 'react';
import { Tabs } from 'antd';
import { NodeJsonEditor } from './JsonEditor';
import { SchemaEditor } from './SchemaEditor';

const { TabPane } = Tabs;

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
