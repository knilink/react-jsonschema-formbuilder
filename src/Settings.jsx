import React from 'react';
import { connect } from 'react-redux';
import { Slider, Switch, Button, List, Modal } from 'antd';
const { confirm } = Modal;

const tipFormatter = ((flag = false) => (number) => {
  flag = !flag;
  return flag ? number : window.innerWidth - number;
})();

class Settings extends React.Component {
  siderWidth() {
    const { leftSiderWidth, rightSiderWidth } = this.props.settings;
    return {
      key: 'sider-width',
      title: 'Sider Width',
      description: (
        <Slider
          included
          min={0}
          max={window.innerWidth}
          tipFormatter={tipFormatter}
          range
          value={[leftSiderWidth, window.innerWidth - rightSiderWidth]}
          onChange={([left, right]) => {
            this.props.updateSettings({
              leftSiderWidth: left > 200 ? left : 200,
              rightSiderWidth: window.innerWidth - right,
            });
          }}
        />
      ),
    };
  }

  formWidth() {
    return {
      key: 'form-item',
      title: 'Form Width',
      description: (
        <Slider
          min={0}
          max={window.innerWidth}
          value={this.props.settings.formWidth}
          onChange={(value) => {
            this.props.updateSettings({
              formWidth: value,
            });
          }}
        />
      ),
    };
  }

  inlineMode() {
    return {
      key: 'inline-mode',
      title: 'Inline Mode',
      actions: [
        <Switch
          onChange={(v) => this.props.updateSettings({ isInlineMode: v })}
          checked={this.props.settings.isInlineMode}
        />,
      ],
    };
  }

  liveValidate() {
    return {
      key: 'live-validate',
      title: 'Live Validate',
      actions: [
        <Switch
          onChange={(v) => this.props.updateSettings({ isLiveValidate: v })}
          checked={this.props.settings.isLiveValidate}
        />,
      ],
    };
  }

  menu() {
    const { setTree, rootNode, setMenu, menu } = this.props;
    return {
      key: 'menu',
      title: 'Menu',
      description: [
        <Button key="edit" onClick={() => setTree(menu)}>
          Customize
        </Button>,
        <Button key="set" onClick={() => setMenu(rootNode)}>
          Apply Change
        </Button>,
      ],
    };
  }

  reset() {
    return {
      key: 'reset',
      description: (
        <Button
          type="danger"
          sytle={{ width: '100%' }}
          key="edit"
          onClick={() => {
            confirm({
              title: 'Reset Form Buiilder?',
              content: 'Removing persistent data from local storage.\n All settings and unsaved form will be lost.',
              okText: 'Continue',
              okType: 'danger',
              closable: true,
              maskClosable: true,
              onOk() {
                window.localStorage.removeItem('persist:react-jsonschema-formbuilder');
                window.location.reload();
              },
            });
          }}
        >
          Reset Form Builder
        </Button>
      ),
    };
  }

  listItems() {
    return [this.siderWidth(), this.formWidth(), this.inlineMode(), this.liveValidate(), this.menu(), this.reset()];
  }

  renderItem(a) {
    const {
      Item,
      Item: { Meta },
    } = List;
    return (
      <Item key={a.key} actions={a.actions}>
        <Meta title={a.title} description={a.description} />
      </Item>
    );
  }

  render() {
    return <List itemLayout="horizontal" dataSource={this.listItems()} renderItem={this.renderItem} />;
  }
}

export default connect(
  ({
    settings,
    tree: {
      present: [rootNode],
    },
    menu,
  }) => ({ settings, rootNode, menu }),
  (dispatch) => ({
    updateSettings: (payload) =>
      dispatch({
        type: 'SETTINGS_UPDATE',
        payload,
      }),
    setTree: ({ schema, uiSchema }) =>
      dispatch({
        type: 'TREE_SET_TREE',
        payload: {
          name: 'menu',
          schema,
          uiSchema,
        },
      }),
    setMenu: ({ schema, uiSchema }) =>
      dispatch({
        type: 'MENU_SET',
        payload: {
          schema,
          uiSchema,
        },
      }),
  })
)(Settings);
