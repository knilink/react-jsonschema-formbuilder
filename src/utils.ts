import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
import { get, isEqual } from 'lodash';

function set(obj: any, path: (string | number)[], value: any): any {
  if (!path.length) return value;

  const [name, ...rest] = path;

  if (Array.isArray(obj)) {
    const child: any = obj[name as any];
    const newObj = [...obj];
    newObj[name as any] = set(child, rest, value);
    return newObj;
  }

  if (typeof obj === 'object') {
    const child: any = obj[name];
    const newObj = { ...obj };
    newObj[name] = set(child, rest, value);
    return newObj;
  }

  return { [name]: set(undefined, rest, value) };
}

export type SchemaPath = (number | string)[];

export interface INode {
  schema: JSONSchema7Definition;
  extraProps: any;
  path: (string | number)[];
  children: INode[] | null;
}

type PropsKeyword = keyof Pick<JSONSchema7, 'definitions' | 'properties' | 'patternProperties' /*| 'dependencies'*/>;
const propsKeywords: PropsKeyword[] = ['definitions', 'properties', 'patternProperties' /*'dependencies'*/];

interface IStack {
  schema: JSONSchema7;
  parent: IStack | null;
  childKeyword: PropsKeyword;
  childName: string | number;
}

function getStack(
  schema: JSONSchema7Definition | undefined,
  path: (string | number)[],
  stack: IStack | null = null
): IStack | null {
  if (path.length < 2 || typeof schema === 'boolean' || !schema) {
    return null;
  }
  if (path.length === 2) {
    const [key, name] = path;
    const k = propsKeywords.find((k) => k === key);
    if (!k) return null;
    return {
      schema,
      parent: stack,
      childKeyword: k,
      childName: name,
    };
  }

  const [key, name, ...pathRest] = path;

  for (const k of propsKeywords) {
    if (k !== key) continue;
    const children = schema[k];
    const child = children && children[name];
    if (Array.isArray(child)) return null;
    return getStack(child, pathRest, {
      schema,
      childKeyword: key,
      childName: name,
      parent: stack,
    });
  }

  return null;
}

function composeStack(stack: IStack): JSONSchema7 {
  let schema: JSONSchema7 = stack.schema;

  for (let current = stack.parent; current; current = current.parent) {
    const children = current.schema[current.childKeyword];
    if (!children || Array.isArray(children)) {
      schema = current.schema;
      continue;
    }
    const child = children[current.childName];
    if (child === schema) {
      schema = current.schema;
    } else {
      const newChildren: { [key: string]: JSONSchema7Definition } = {
        ...children,
      };
      newChildren[current.childName] = schema; // keep the original props sequence
      schema = {
        ...current.schema,
        [current.childKeyword]: newChildren,
      };
    }
  }
  return schema;
}

export function getSchemaByPath(schema: JSONSchema7Definition | undefined, path: (string | number)[]): any {
  //: JSONSchema7Definition | undefined {
  const stack = getStack(schema, path);
  if (!stack) return undefined;
  const children = stack.schema[stack.childKeyword];
  return children ? children[stack.childName] : undefined;
}

export function replaceSchemaNode(
  schema: JSONSchema7,
  path: (string | number)[],
  node: JSONSchema7Definition
): JSONSchema7 {
  const stack = getStack(schema, path);
  if (!stack) return schema;
  const children = stack.schema[stack.childKeyword];
  if (Array.isArray(children) || !children || !Object.hasOwnProperty.call(children, stack.childName)) return schema;

  const newChildren: { [key: string]: JSONSchema7Definition } = { ...children };
  newChildren[stack.childName] = node;

  return composeStack({
    ...stack,
    schema: { ...stack.schema, [stack.childKeyword]: newChildren },
  });
}

export function removeSchemaNode(schema: JSONSchema7, path: (string | number)[]): JSONSchema7 {
  const stack = getStack(schema, path);
  if (!stack) return schema;
  const children = stack.schema[stack.childKeyword];
  if (Array.isArray(children) || !children || !Object.hasOwnProperty.call(children, stack.childName)) return schema;

  const { [stack.childName]: _, ...newChildren } = children;

  return composeStack({
    ...stack,
    schema: { ...stack.schema, [stack.childKeyword]: newChildren },
  });
}

export function addSchemaNode(
  schema: JSONSchema7,
  path: (string | number)[],
  position: number,
  name: string | number,
  node: JSONSchema7Definition
): JSONSchema7 {
  const stack = getStack(schema, path);
  if (!stack) return schema;

  const children = stack.schema[stack.childKeyword];
  if (Array.isArray(children) || !children || Object.hasOwnProperty.call(children, name)) return schema;

  let newChildren: { [key: string]: JSONSchema7Definition } = {};
  let added = false;

  const dstName = path[path.length - 1];
  for (const prop in children) {
    if (prop === dstName) {
      if (position > 0) {
        newChildren[prop] = children[prop];
        newChildren[name] = node;
        added = true;
      }
      if (position < 0) {
        newChildren[name] = node;
        newChildren[prop] = children[prop];
        added = true;
      }
      if (position === 0) {
        const schemaTarget = children[prop];
        if (typeof schemaTarget !== 'boolean' && schemaTarget.type === 'object') {
          // dst is object
          if (!Object.hasOwnProperty.call(schemaTarget.properties, name)) {
            newChildren[prop] = {
              ...schemaTarget,
              // TODO: use stackSrc.childKeyword
              properties: { ...schemaTarget.properties, [name]: node },
            };
          } else {
            return schema;
          }
        } else {
          newChildren[prop] = children[prop];
          newChildren[name] = node;
        }
        added = true;
      }
    } else {
      newChildren[prop] = children[prop];
    }
  }

  return added
    ? composeStack({
        ...stack,
        schema: { ...stack.schema, [stack.childKeyword]: newChildren },
      })
    : schema;
}

export function renameSchemaNode(schema: JSONSchema7, path: (string | number)[], name: string) {
  const stack = getStack(schema, path);
  if (!stack) return schema;
  const children = stack.schema[stack.childKeyword];
  if (
    Array.isArray(children) ||
    !children ||
    !Object.hasOwnProperty.call(children, stack.childName) ||
    Object.hasOwnProperty.call(children, name)
  )
    return schema;

  let newChildren: { [key: string]: JSONSchema7Definition } = {};

  for (const prop in children) {
    newChildren[prop === stack.childName ? name : prop] = children[prop];
  }

  const newSchema = { ...stack.schema };
  newSchema[stack.childKeyword] = newChildren;

  if (typeof stack.childName === 'string' && newSchema.required) {
    let updated = false;
    const newRequired = newSchema.required.map((n) => {
      if (stack.childName === n) {
        updated = true;
        return name;
      }
      return n;
    });
    if (updated) newSchema.required = newRequired;
  }

  return composeStack({
    ...stack,
    schema: newSchema,
  });
}

function reorder(
  properties: JSONSchema7['properties'],
  src: string | number,
  dst: string | number,
  position: number
): JSONSchema7['properties'] {
  const newProperties: JSONSchema7['properties'] = {};

  for (const prop in properties) {
    if (prop === src) {
    } else {
      if (prop === dst) {
        if (position < 0) {
          // before dst
          newProperties[src] = properties[src];
          newProperties[prop] = properties[prop];
        } else if (position > 0) {
          // after dst
          newProperties[prop] = properties[prop];
          newProperties[src] = properties[src];
        } else {
          // drop on dst
          const schemaTarget = properties[prop];
          if (typeof schemaTarget !== 'boolean' && schemaTarget.type === 'object') {
            // dst is object
            if (!Object.hasOwnProperty.call(schemaTarget.properties, src)) {
              newProperties[prop] = {
                ...schemaTarget,
                properties: { ...schemaTarget.properties, [src]: properties[src] },
              };
            } else {
              return properties;
            }
          } else {
            newProperties[prop] = properties[prop];
            newProperties[src] = properties[src];
          }
        }
      } else {
        newProperties[prop] = properties[prop];
      }
    }
  }
  return newProperties;
}

export function moveSchemaNode(
  schema: JSONSchema7,
  src: (string | number)[],
  dst: (string | number)[],
  position: number
) {
  if (isEqual(src.slice(0, -1), dst.slice(0, -1))) {
    const stack = getStack(schema, src);
    if (!stack) return schema;
    // TODO: stackSrc.schema[stackSrc.childKeyword];
    const properties = stack.schema.properties;
    const newProperties = reorder(properties, src[src.length - 1], dst[dst.length - 1], position);
    if (newProperties === properties) return schema;
    return composeStack({
      ...stack,
      schema: {
        ...stack.schema,
        properties: newProperties,
      },
    });
  }

  // get and remove src node
  const stackSrc = getStack(schema, src);
  if (!stackSrc) return schema;
  const children = stackSrc.schema[stackSrc.childKeyword];
  if (Array.isArray(children) || !children || !Object.hasOwnProperty.call(children, stackSrc.childName)) return schema;

  const { [stackSrc.childName]: nodeSrc, ...newChildren } = children;

  const newSchema = composeStack({
    ...stackSrc,
    schema: { ...stackSrc.schema, [stackSrc.childKeyword]: newChildren },
  });

  const newSchema2 = addSchemaNode(newSchema, dst, position, stackSrc.childName, nodeSrc);
  return newSchema === newSchema2 ? schema : newSchema2;
}

export function addExtraPropsNode(extraProps: object, path: (number | string)[], node: any): any {
  return set(extraProps, path, node);
}

export function removeExtraPropsNode(extraProps: object, path: (number | string)[]): object {
  return set(extraProps, path, undefined);
}

export function renameExtraPropsNode(extraProps: object, path: (number | string)[], name: string): object {
  return set(set(extraProps, path, undefined), [...path.slice(0, -1), name], get(extraProps, path));
}

export function replaceExtraPropsNode(extraProps: object, path: (number | string)[], node: any) {
  return set(extraProps, path, node);
}

export function path2key(path: SchemaPath): string {
  return JSON.stringify(path);
}

export function key2path(key: string): SchemaPath | null {
  try {
    return JSON.parse(key);
  } catch (e) {
    console.log(e);
    return null;
  }
}
