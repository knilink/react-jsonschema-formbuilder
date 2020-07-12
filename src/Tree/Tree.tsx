import * as React from 'react';
import { flatMap } from 'lodash';
import { Tree, Input } from 'antd';
import { TreeProps } from 'antd/lib/tree';
import { DataNode } from 'rc-tree/lib/interface';
import { INode, path2key, key2path, moveSchemaNode } from '../utils';
import { FormBuilderContext } from '../FormBuilderContext';
import { compose, MiddlewareProps } from '@gravel-form/core-rc';
import { Middleware } from '@gravel-form/core-rc/lib/compose';
import { JSONSchema7Definition } from 'json-schema';

import { TreeNodeTitle } from './TreeNodeTitle';
const { TreeNode } = Tree;
const { Search } = Input;

function isClassComponent<T>(Component: React.ComponentType<T>): Component is React.ComponentClass<T> {
  return Component.prototype && Component.prototype.isReactComponent;
}

interface TreeMiddlewareProps extends Pick<MiddlewareProps, 'schema' | 'schemaPath'> {
  parent: TreeMiddlewareProps | null;
  composed: TreeNodeMiddleware;
}

type TreeNodeMiddleware = Middleware<Parameters<(props: TreeMiddlewareProps) => void>, DataNode[]>;

const propertiesMw: TreeNodeMiddleware = (next, props): DataNode[] => {
  const { schema, schemaPath, composed } = props;
  if (typeof schema === 'boolean' || (schema.type && schema.type !== 'object') || !schema.properties)
    return next(props);
  const properties = schema.properties;

  return flatMap(Object.keys(properties), (key) => {
    const childProps: TreeMiddlewareProps = {
      ...props,
      schema: properties[key],
      schemaPath: [...schemaPath, 'properties', key],
      parent: props,
    };
    return composed(() => [], childProps);
  });
};

const treeNodeMw: TreeNodeMiddleware = (next, props): DataNode[] => {
  const { schema, schemaPath } = props;
  if (typeof schema === 'boolean') return next(props);
  // const name = schemaPath.length ? schemaPath[schemaPath.length - 1] : 'root';

  if (schema.properties) {
    return [
      {
        key: path2key(schemaPath),
        title: <TreeNodeTitle path={schemaPath} />,
        isLeaf: false,
        children: next(props),
      },
    ];
  }
  return [
    {
      key: path2key(schemaPath),
      title: <TreeNodeTitle path={schemaPath} isLeaf={schema.type !== 'object' && schema.type !== 'array'} />,
      isLeaf: schema.type !== 'object' && schema.type !== 'array',
    },
  ];
};

const composed = compose([treeNodeMw, propertiesMw]);

export const FormSchemaTree: React.FC = () => {
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>(['']);
  const [searchValue, setSearchValue] = React.useState('');

  const { schema, extraProps, setSchema, selectedNodePath, setSelectedNodePath } = React.useContext(FormBuilderContext);

  const handleDrop: TreeProps['onDrop'] = React.useCallback(
    (info) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      // const dropPos = info.node.pos.split('-');
      // const dropPosition = info.dropPosition - +dropPos[dropPos.length - 1];
      const src = key2path(dragKey);
      const dst = key2path(dropKey);
      if (src && dst) {
        setSchema(moveSchemaNode(schema, src, dst, info.dropPosition));
      }
    },
    [schema]
  );

  const handleExpand: TreeProps['onExpand'] = setExpandedKeys;

  const handleBlur = () => {};

  const treeChildren = composed(() => [], { schema, schemaPath: [], composed, parent: null });

  return (
    <>
      <Search placeholder="Search" onChange={(e) => setSearchValue(e.target.value)} onBlur={handleBlur} />
      <Tree
        className="form-builder-draggable-tree"
        // expandedKeys={searchExpanded.length ? [...expandedKeys, ...searchExpanded] : expandedKeys}
        expandedKeys={expandedKeys}
        selectedKeys={selectedNodePath ? [path2key(selectedNodePath)] : []}
        draggable
        treeData={treeChildren}
        onDrop={handleDrop}
        onExpand={handleExpand}
        onSelect={([selectedKey]) => setSelectedNodePath((selectedKey && key2path(selectedKey.toString())) || null)}
        blockNode
      />
    </>
  );
};
