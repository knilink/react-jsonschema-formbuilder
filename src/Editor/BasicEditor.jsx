import React, { Component } from 'react';
import { Input, Row, Col } from 'antd';
const { TextArea } = Input;

export default class BasicEditor extends Component {
  static get key() {
    return 'basic-editor';
  }

  static get name() {
    return 'Basic Editor';
  }

  static filter(node) {
    console.log(node.schema);
    return node.schema && node.schema.type !== 'array';
  }

  render() {
    const { schema, uiSchema } = this.props.node.schema
    return <div>
      <Row>
        <Col xs={24}>
          <label>Title:</label>
        </Col>
        <Col xs={24}>
          <Input value={this.props.node.schema.title}/>
        </Col>
      </Row>
      <Row>
        <Col xs={24}>
          <label>Description:</label>
        </Col>
        <Col xs={24}>
          <Input value={this.props.node.schema.title}/>
        </Col>
      </Row>

    </div>;
  }
}
