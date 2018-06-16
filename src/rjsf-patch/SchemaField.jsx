import React, { Component } from 'react';
import SchemaField from "react-jsonschema-form/lib/components/fields/SchemaField";
import { notification } from 'antd';

export default class PatchedSchemaField extends SchemaField {
  componentDidCatch(error, info) {
    // Display fallback UI
    // You can also log the error to an error reporting service
    notification.error({
      message:`Error: ${this.props.idSchema.$id}`,
      description: error.toString(),
      duration:0
    });
  }
}
