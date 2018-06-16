import SchemaField from "react-jsonschema-form/lib/components/fields/SchemaField";
import { notification } from 'antd';

export default class PatchedSchemaField extends SchemaField {
  componentDidCatch(error, info) {
    notification.error({
      message:`Error: ${this.props.idSchema.$id}`,
      description: error.toString(),
      duration:0
    });
  }
}
