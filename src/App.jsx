import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import store from './store';
//import logo from './logo.svg';
//import './App.css';
import './css';
import { Layout, Tabs, Card } from 'antd';
import Tree from './Tree';
import {FormView, SchemaView, UiSchemaView, FormDataView} from './views';
import NodeEditor from './Editor';
import Toolbar from './Toolbar';
import Settings from './Settings';
const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

class App extends Component {
  state = {
    collapsed: false,
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  render() {
    const { settings } = this.props;
    return (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          width={settings.leftSiderWidth}
          style={{
            background: '#fff',
            padding: 0,
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          <Tabs defaultActiveKey='0' size="small">
            <TabPane tab="Editor" style={{ padding: '8px' }} key="0">
              <Tree />
            </TabPane>
            <TabPane tab="Settings" style={{ padding: '8px' }} key="1">
              <Settings />
            </TabPane>
          </Tabs>
        </Sider>
        <Layout style={{ marginLeft: settings.leftSiderWidth }}>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Toolbar />
          </Header>
          <Content style={{ minHeight: 280, padding:'12px 8px' }}>
            <Card bordered={false} style={{width: settings.formWidth, margin: '12px 8px', display: 'inline-block', verticalAlign: 'top'}}>
              <FormView />
            </Card>
            <Card title="Schema" style={{margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top'}}>
              <SchemaView />
            </Card>
            <Card title="Ui Schema" style={{margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top'}}>
              <UiSchemaView />
            </Card>
            <Card title="Form Data" style={{margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top'}}>
              <FormDataView />
            </Card>
          </Content>
        </Layout>
        <Sider width={this.props.activeNodeKey?settings.rightSiderWidth:0} style={{
          overflow: 'auto',
          background: '#fff',
          boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
          position: 'fixed',
          height: '100vh',
          right: 0
        }} >
          <NodeEditor />
        </Sider>
      </Layout>
    );
  }
}

const AppContainer = connect(({
  activeNodeKey,
  settings
})=>({
  activeNodeKey,
  settings
}))(App);
export default ()=>(<Provider store={store}>
  <AppContainer />
</Provider>)
/*
   <Icon
   className="trigger"
   type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
   onClick={this.toggle}
   />
 */
/*
   <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280, width:settings.formWidth }}>
 */
