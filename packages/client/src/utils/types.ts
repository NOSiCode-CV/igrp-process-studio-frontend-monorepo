import { ProcessDefinition } from '@igrp/framework-process-studio-types';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ProcessDefinitionUpdate {
  title: string;
  description: string;
  projectId: string;
  status: string;
  version: string;
  statusDesc: string;
  bpmFileContent: string;
  processKey: string;
}
