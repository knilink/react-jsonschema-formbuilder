import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import store from './store';
//import logo from './logo.svg';
//import './App.css';
import './css';
import { Layout, Menu, Icon, Tabs } from 'antd';
import Tree from './Tree';
import FormView from './FormView';
import FormJsonEditor from './FormJsonEditor';
import NodeEditor from './node-editor';
import Toolbar from './Toolbar';
const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

class App extends React.Component {
  state = {
    collapsed: false,
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  render() {
    return (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          style={{ background: '#fff', padding: 0 }}
        >
          <Tabs defaultActiveKey='0' size="small">
            <TabPane tab="Editor" style={{ padding: '8px' }} key="0">
              <Tree />
            </TabPane>
            <TabPane tab="Settings" style={{ padding: '8px' }} key="1">
            </TabPane>
          </Tabs>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Toolbar />
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <FormView />
            <FormJsonEditor />
          </Content>
        </Layout>
        <Sider width={this.props.activeNodeKey?window.innerWidth*0.36:0} style={{
          overflow: 'auto',
          background: '#fff',
          boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)'
        }} >
          <NodeEditor />
        </Sider>
      </Layout>
    );
  }
}

const AppContainer = connect(({activeNodeKey})=>({activeNodeKey}))(App);
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
