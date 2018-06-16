import React, { Component } from 'react';
import { DefaultTemplate, DefaultObjectFieldTemplate } from './Template';
import { fieldTemplateConnector, objectFieldTemplateConnector } from './connectors';

export const FieldTemplate = fieldTemplateConnector(DefaultTemplate);
export const ObjectFieldTemplate = objectFieldTemplateConnector(DefaultObjectFieldTemplate);
