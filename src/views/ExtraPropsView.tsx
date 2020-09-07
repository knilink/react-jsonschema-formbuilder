import * as React from 'react';
import { FormBuilderContext } from '../FormBuilderContext';
import JsonEditor from '../JsonEditor';

export const ExtraPropsView: React.FC = () => {
  const { extraProps, setExtraProps } = React.useContext(FormBuilderContext);
  return <JsonEditor value={extraProps} onChange={setExtraProps} autoSize />;
};
