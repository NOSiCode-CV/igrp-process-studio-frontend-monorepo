import type {
  Project,
  ProcessDefinition,
  PaginatedResponse,
  ProcessDefinitionContent,
  ProcessDefinitionFilter,
  ProjectFilter,
  ProjectProcessFilter,
  VariableDefinition,
  EnumItem,
} from './index';

export interface ProcessStudioClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ProcessStudioClient {
  projects: {
    getAll: (filter?: ProjectFilter) => Promise<PaginatedResponse<Project>>;
    getById: (id: string) => Promise<Project>;
    create: (project: Project) => Promise<Project>;
    update: (project: Project) => Promise<Project>;
    createOrUpdate: (project: Project) => Promise<Project>;
    enable: (projectId: string) => Promise<unknown>;
    disable: (projectId: string) => Promise<unknown>;
    /** Soft-deletes a project via `PATCH /projects/{id}/disable`. */
    delete: (projectId: string) => Promise<unknown>;
    getDeployedProcesses: (projectId: string, filter?: ProjectProcessFilter) => Promise<Project>;
    getProcessHistory: (projectId: string, filter?: ProjectProcessFilter) => Promise<Project>;
  };
  processDefinitions: {
    getAll: () => Promise<ProcessDefinition[]>;
    list: (filter?: ProcessDefinitionFilter) => Promise<PaginatedResponse<ProcessDefinition>>;
    getById: (id: string) => Promise<ProcessDefinition>;
    delete: (id: string) => Promise<unknown>;
    restore: (id: string) => Promise<unknown>;
    create: (projectId: string, processDefinition: ProcessDefinition) => Promise<ProcessDefinition>;
    update: (processId: string, processDefinition: ProcessDefinition) => Promise<ProcessDefinition>;
    createOrUpdate: (processDefinition: ProcessDefinition) => Promise<ProcessDefinition>;
    saveDiagram: (
      processKey: string,
      processDefinition: ProcessDefinitionContent,
    ) => Promise<ProcessDefinition>;
    deploy: (
      processKey: string,
      processDefinition: ProcessDefinitionContent,
    ) => Promise<ProcessDefinition>;
    createOrUpdateVariable: (
      processDefinitionId: string,
      variable: VariableDefinition[],
    ) => Promise<VariableDefinition[]>;
    getVariables: (processDefinitionId: string) => Promise<VariableDefinition[]>;
    getStates: () => Promise<EnumItem[]>;
  };
}
