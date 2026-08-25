export interface AuditUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  sub: string;
}

export interface EnumItem {
  value: string;
  label: string;
}

export type ProcessDefinitionState =
  | 'DRAFT'
  | 'VALIDATED'
  | 'PUBLISHED'
  | 'DEPRECATED'
  | 'ARCHIVED'
  | 'DISABLED'
  | 'ERROR'
  | 'DELETED';

export type ProjectFilter = {
  appCode?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
};

export type ProjectProcessFilter = {
  processName?: string;
  processKey?: string;
  pageSize?: string | number;
  pageNumber?: string | number;
};

export type ProjectRequest = {
  code: string;
  name: string;
  description?: string;
  appCode?: string;
};

export type Project = {
  code: string;
  name: string;
  description: string;
  projectId: string;
  active?: boolean;
  appCode?: string;
  processDefinitions: ProcessDefinition[];
  createdBy?: AuditUser;
  createdDate?: string;
  lastModifiedBy?: AuditUser;
  lastModifiedDate?: string;
};

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  content: T[];
}

export interface ArtifactVariable {
  artifactVariableId: string;
  key: string;
  name: string;
  type: string;
  defaultValue: string;
  required: boolean;
}

export interface ProcessArtifact {
  projectArtifactId: string;
  taskKey: string;
  name: string;
  formKey: string;
  subProcessId?: string;
  subProcessName?: string;
  artifactVariables?: ArtifactVariable[];
  subProcessTask?: boolean;
}

export type ProcessDefinitionRequest = {
  title: string;
  processKey: string;
  description?: string;
  projectId?: string;
  status?: ProcessDefinitionState | string;
};

export interface ProcessDefinition {
  title: string;
  description: string;
  projectId: string;
  status: string;
  processDefinitionId: string;
  /**
   * List/detail payloads return `int32`. Some older consumers still stringify it.
   */
  version: string | number;
  statusDesc: string;
  /** Present on the detail DTO; omitted from the list Light DTO. */
  bpmFileContent?: string;
  processKey: string;
  bpmnDiagramUrl?: string;
  deploymentId?: string;
  /**
   * Either an ISO string, a Java `LocalDateTime` array `[y, m, d, h, m, s, ns]`,
   * or a pre-formatted display string — depends on backend serialization config.
   * Use `formatDeploymentDate` (from `@igrp/framework-process-studio-client`) to
   * normalize for display.
   */
  deploymentDate?: string | number[];
  processArtifacts?: ProcessArtifact[];
  createdBy?: AuditUser;
  createdDate?: string;
  lastModifiedBy?: AuditUser;
  lastModifiedDate?: string;
}

export interface ProcessDefinitionContent {
  content: string;
}

export interface ProcessDefinitionFilter {
  appCode?: string;
  processKey?: string;
  processName?: string;
  projectCode?: string;
  projectName?: string;
  state?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
}

export interface VariableDefinition {
  id: string;
  name: string;
  type: string;
  defaultValue: string;
  required: boolean;
  processDefinitionId?: string;
}

// Process Studio Client Types
export * from './process-studio';
