import * as React from 'react';
import Input, { InputProps } from 'antd/lib/input';
import { EditOutlined } from '@ant-design/icons';

export const InlineEditor: React.FC<
  Omit<InputProps, 'value' | 'onChange'> & { value?: string; onChange: (value?: string) => void; icon?: boolean }
> = ({ children, onChange, value, icon, ...props }) => {
  const [editing, setEditing] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState(value);
  const [mouseOver, setMouseOver] = React.useState(false);
  const inputRef = React.useRef<Input>(null);
  const handleStartEditing = React.useCallback<React.MouseEventHandler>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingValue(value);
      setEditing(true);
      setMouseOver(false);
    },
    [setEditing, inputRef, value]
  );

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [inputRef, editing]);

  const handleCompleteEditing = React.useCallback(() => {
    setEditing(false);
    let newValue = editingValue && editingValue.trim();
    if (newValue !== value) {
      onChange && onChange(newValue);
    }
  }, [setEditing, editingValue, value, onChange]);

  const handleCancelEditing = React.useCallback(() => {
    setEditing(false);
  }, [value]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setEditingValue(e.target.value);
  }, []);

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={editingValue}
        onBlur={handleCompleteEditing}
        onChange={handleChange}
        onKeyUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.keyCode === 13) {
            handleCompleteEditing();
          } else if (e.keyCode === 27) {
            handleCancelEditing();
          }
        }}
        {...props}
      />
    );
  } else if (icon) {
    return (
      <>
        {children}
        <EditOutlined onClick={handleStartEditing} />
      </>
    );
  } else {
    return (
      <span
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={handleStartEditing}
        style={mouseOver ? { textDecoration: 'underline', cursor: 'pointer' } : undefined}
      >
        {children}
      </span>
    );
  }
};
/*
   export default class InlineEditor extends Component {
   constructor(props) {
   super(props);
   this.state = {
   editing: false,
   value: this.props.value,
   };
   }

   componentWillReceiveProps(nextProps) {
   this.setState({ value: nextProps.value });
   }

   onChange = (e) => {
   this.setState({ value: e.target.value });
   };
   onCompleteEditing = () => {
   this.setState({ editing: false });
   const newValue = this.state.value.trim();
   if (newValue !== this.props.value) {
   this.props.onChange && this.props.onChange(newValue);
   }
   };
   onStartEditing = (e) => {
   e.stopPropagation();
   e.preventDefault();
   this.setState({ editing: true }, () => this.input && this.input.focus());
   };

   onCancelEditing = () => {
   this.setState({
   editing: false,
   value: this.props.value,
   });
   };

   renderEditing() {
   return (
   <Input
   ref={(r) => (this.input = r)}
   value={this.state.value}
   onBlur={this.onCompleteEditing}
   onChange={this.onChange}
   onKeyUp={(e) => {
   e.preventDefault();
   e.stopPropagation();
   if (e.keyCode === 13) {
   this.onCompleteEditing();
   } else if (e.keyCode === 27) {
   this.onCancelEditing();
   }
   }}
   />
   );
   }

   renderView() {
   return (
   <span>
   {this.props.children}
   <EditOutlined onClick={this.onStartEditing} />
   </span>
   );
   }

   render() {
   if (this.state.editing) {
   return this.renderEditing();
   } else {
   return this.renderView();
   }
   }
   }
 */
