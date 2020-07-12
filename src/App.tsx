import * as React from 'react';
// import { PersistGate } from 'redux-persist/integration/react';
import './css';
import { Layout, Tabs, Card } from 'antd';
import { FormSchemaTree } from './Tree/Tree';
// import { FormView, SchemaView, UiSchemaView, FormDataView } from './views';
import { FormView } from './views/FormView';
import { SchemaView } from './views/SchemaView';
import { ExtraPropsView } from './views/ExtraPropsView';
import { Editor } from './Editor/Editor';
import { Toolbar } from './Toolbar';
// import Settings from './Settings';
import { Provider, SettingsContext, FormBuilderContext } from './FormBuilderContext';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

const App: React.FC<{}> = () => {
  // const { settings } = this.props;
  const { settings } = React.useContext(SettingsContext);
  const { selectedNodePath } = React.useContext(FormBuilderContext);
  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={false /* this.state.collapsed */}
        width={settings.leftSiderWidth}
        style={{
          background: '#fff',
          padding: 0,
          overflow: 'auto',
          boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
          height: '100vh',
          position: 'fixed',
          left: 0,
        }}
      >
        <Tabs defaultActiveKey="0" size="small" type="card">
          <TabPane tab="Editor" style={{ padding: '8px' }} key="0">
            <FormSchemaTree />
          </TabPane>
          <TabPane tab="Settings" style={{ padding: '8px' }} key="1">
            {/* <Settings /> */}
          </TabPane>
        </Tabs>
      </Sider>
      <Layout style={{ marginLeft: settings.leftSiderWidth }}>
        <Header style={{ background: '#fff', padding: 0 }}>{<Toolbar />}</Header>
        <Content style={{ minHeight: 280, padding: '12px 8px' }}>
          <Card
            bordered={false}
            style={{
              width: settings.formWidth,
              margin: '12px 8px',
              display: 'inline-block',
              verticalAlign: 'top',
            }}
          >
            <FormView />
          </Card>
          {(settings.subViews || []).map((a) => {
            const style = { margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top' };
            switch (a) {
              case 'schema':
                return (
                  <Card key="schema" title="Schema" style={style}>
                    <SchemaView />
                  </Card>
                );
              case 'extraProps':
                return (
                  <Card key="extraProps" title="Ui Schema" style={style}>
                    <ExtraPropsView />
                  </Card>
                );
              case 'formData':
                return (
                  <Card key="formData" title="Form Data" style={style}>
                    {/* <FormDataView /> */}
                  </Card>
                );
              default:
                return <div key="null" />;
            }
          })}
        </Content>
      </Layout>
      <Sider
        width={selectedNodePath ? settings.rightSiderWidth : 0}
        style={{
          overflow: 'auto',
          background: '#fff',
          boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
          position: 'fixed',
          height: '100vh',
          right: 0,
        }}
      >
        <Editor />
      </Sider>
    </Layout>
  );
};

export default () => (
  <Provider
    defaultSchema={{
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
        foo: {
          type: 'object',
          properties: {
            bar: { type: 'string' },
          },
        },
      },
    }}
    defaultExtraProps={{
      row: { justify: 'space-between' },
      properties: {
        firstName: { col: { span: 11 } },
        lastName: { col: { span: 11 } },
        gender: {
          component: 'RadioGroup',
          labels: ['%E2%99%82', '%E2%99%80'].map(decodeURIComponent),
        },
        bio: {
          component: 'TextArea',
          props: {
            placeholder: 'Roundhouse kicking asses since 1940',
          },
        },
        password: {
          component: 'Password',
        },
        dof: {
          component: 'DatePicker',
        },
        term: {
          formItem: { label: null },
        },
      },
    }}
  >
    <App />
  </Provider>
);
