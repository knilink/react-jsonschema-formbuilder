import * as React from 'react';
import { Button, Tooltip, message } from 'antd';
import { FileAddOutlined, FolderOpenOutlined, SaveOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { JSONSchema7 } from 'json-schema';
import { FormBuilderContext } from './FormBuilderContext';

function write(filename: string, json: any) {
  const a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }));
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function read(e: React.ChangeEvent<HTMLInputElement>) {
  var files = e?.target?.files;
  const file = files && files[0];
  if (!file) throw new Error('No file');
  var reader = new FileReader();

  const p = new Promise<string>(function (resolve, reject) {
    reader.onload = function (e) {
      if (e?.target?.result) {
        resolve(e.target.result.toString());
      } else {
        reject();
      }
    };
  });
  reader.readAsText(file);
  return p;
}

const buttonStyle = { marginLeft: 8 };

interface FormSchema {
  schema: JSONSchema7;
  extraProps: any;
}

interface History {
  past: FormSchema[];
  current: FormSchema;
  future: FormSchema[];
}

export const Toolbar: React.FC = () => {
  const { setSchema, setExtraProps, schema, extraProps } = React.useContext(FormBuilderContext);

  const { current: history } = React.useRef<History>({ past: [], current: { schema, extraProps }, future: [] });

  const [historyStatus, setHistoryStatus] = React.useState({ disableUndo: true, disableRedo: true });

  React.useEffect(() => {
    if (history.current.schema !== schema || history.current.extraProps !== extraProps) {
      history.past.push(history.current);
      history.current = { schema, extraProps };
      history.future = [];
      setHistoryStatus({ disableUndo: false, disableRedo: true });
    }
  }, [history, schema, extraProps, historyStatus]);

  const handleUndo = () => {
    const past = history.past.pop();
    if (past) {
      history.future.push(history.current);
      history.current = past;
      setSchema(past.schema);
      setExtraProps(past.extraProps);
      setHistoryStatus({ disableUndo: history.past.length === 0, disableRedo: false });
    }
  };

  const handleRedo = () => {
    const future = history.future.pop();
    if (future) {
      history.past.push(history.current);
      history.current = future;
      setSchema(future.schema);
      setExtraProps(future.extraProps);
      setHistoryStatus({ disableUndo: false, disableRedo: history.future.length === 0 });
    }
  };

  const handleNew = React.useCallback(() => {
    setSchema({ type: 'object' });
    setExtraProps({});
  }, [setSchema, setExtraProps]);

  const handleOpen = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    async (e) => {
      try {
        const s = await read(e);
        const { schema, extraProps } = JSON.parse(s);
        setSchema(schema as JSONSchema7);
        setExtraProps(extraProps);
      } catch (e) {
        message.error('Invalid json file!');
      }
    },
    [setSchema, setExtraProps]
  );

  const handleSave = () => {
    write('form', { schema, extraProps });
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleLoad = React.useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  return (
    <span>
      <input ref={inputRef} type="file" accept="application/json" onChange={handleOpen} hidden />
      <Tooltip title="New">
        <Button style={buttonStyle} onClick={handleNew} icon={<FileAddOutlined />} />
      </Tooltip>
      <Tooltip title="Open">
        <Button style={buttonStyle} onClick={handleLoad} icon={<FolderOpenOutlined />} />
      </Tooltip>
      <Tooltip title="Save">
        <Button style={buttonStyle} onClick={handleSave} icon={<SaveOutlined />} />
      </Tooltip>
      <Tooltip title="Undo">
        <Button style={buttonStyle} onClick={handleUndo} disabled={historyStatus.disableUndo} icon={<UndoOutlined />} />
      </Tooltip>
      <Tooltip title="Redo">
        <Button style={buttonStyle} onClick={handleRedo} disabled={historyStatus.disableRedo} icon={<RedoOutlined />} />
      </Tooltip>
      {/*<Select
          mode="multiple"
          style={{ width: 290, marginLeft: 12 }}
          value={settings.subViews}
          onChange={updateSettings}
          placeholder="Select sub views..."
          >
          <Select.Option key="schema">Schema</Select.Option>
          <Select.Option key="uiSchema">Ui Schema</Select.Option>
          <Select.Option key="formData">Data</Select.Option>
          </Select>*/}
    </span>
  );
};
