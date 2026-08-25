import { BaseApiClient } from './base-api-client';
import { ApiClientConfig } from './types';
import type {
  ProcessDefinition,
  ProcessDefinitionRequest,
  Project,
  ProjectFilter,
  ProjectProcessFilter,
  ProjectRequest,
  PaginatedResponse,
  ProcessDefinitionContent,
  ProcessDefinitionFilter,
  VariableDefinition,
  EnumItem,
} from '@igrp/framework-process-studio-types';

function toProjectRequest(project: Project): ProjectRequest {
  return {
    code: project.code,
    name: project.name,
    description: project.description,
    appCode: project.appCode,
  };
}

function toProcessDefinitionRequest(
  processDefinition: ProcessDefinition,
): ProcessDefinitionRequest {
  return {
    title: processDefinition.title,
    processKey: processDefinition.processKey,
    description: processDefinition.description,
    projectId: processDefinition.projectId,
    status: processDefinition.status,
  };
}

export class ProcessStudioApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  // Project endpoints
  async getProjects(filter?: ProjectFilter): Promise<PaginatedResponse<Project>> {
    const response = await this.get<PaginatedResponse<Project>>(
      '/api/v1/projects',
      filter as Record<string, any> | undefined,
    );
    return response.data;
  }

  async getProjectById(projectId: string): Promise<Project> {
    const response = await this.get<Project>(`/api/v1/projects/${projectId}`);
    return response.data;
  }

  async createProject(project: Project): Promise<Project> {
    const response = await this.post<Project>('/api/v1/projects', toProjectRequest(project));
    return response.data;
  }

  async updateProject(project: Project): Promise<Project> {
    const response = await this.put<Project>(
      `/api/v1/projects/${project.projectId}`,
      toProjectRequest(project),
    );
    return response.data;
  }

  async enableProject(projectId: string): Promise<unknown> {
    const response = await this.patch<unknown>(`/api/v1/projects/${projectId}/enable`);
    return response.data;
  }

  async disableProject(projectId: string): Promise<unknown> {
    const response = await this.patch<unknown>(`/api/v1/projects/${projectId}/disable`);
    return response.data;
  }

  async getDeployedProcesses(projectId: string, filter?: ProjectProcessFilter): Promise<Project> {
    const response = await this.get<Project>(
      `/api/v1/projects/${projectId}/deployed-process`,
      filter as Record<string, any> | undefined,
    );
    return response.data;
  }

  async getProcessHistory(projectId: string, filter?: ProjectProcessFilter): Promise<Project> {
    const response = await this.get<Project>(
      `/api/v1/projects/${projectId}/history-process`,
      filter as Record<string, any> | undefined,
    );
    return response.data;
  }

  // Process Definition endpoints
  async getProcessDefinitions(
    filter?: ProcessDefinitionFilter,
  ): Promise<PaginatedResponse<ProcessDefinition>> {
    const response = await this.get<PaginatedResponse<ProcessDefinition>>(
      '/api/v1/projects/process-definitions',
      filter as Record<string, any> | undefined,
    );
    return response.data;
  }

  async getProcessDefinitionById(processDefinitionId: string): Promise<ProcessDefinition> {
    const response = await this.get<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${processDefinitionId}`,
    );
    return response.data;
  }

  async deleteProcessDefinition(processDefinitionId: string): Promise<unknown> {
    const response = await this.patch<unknown>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/delete`,
    );
    return response.data;
  }

  async restoreProcessDefinition(processDefinitionId: string): Promise<unknown> {
    const response = await this.patch<unknown>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/restore`,
    );
    return response.data;
  }

  async createProcessDefinition(
    projectId: string,
    processDefinition: ProcessDefinition,
  ): Promise<ProcessDefinition> {
    const response = await this.post<ProcessDefinition>(
      `/api/v1/projects/${projectId}/process-definitions`,
      toProcessDefinitionRequest(processDefinition),
    );
    return response.data;
  }

  async updateProcessDefinition(
    processId: string,
    processDefinition: ProcessDefinition,
  ): Promise<ProcessDefinition> {
    const response = await this.put<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${processId}`,
      toProcessDefinitionRequest(processDefinition),
    );
    return response.data;
  }

  async saveDiagramProcessDefinition(
    processKey: string,
    processDefinition: ProcessDefinitionContent,
  ): Promise<ProcessDefinition> {
    const response = await this.put<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${processKey}/diagram`,
      processDefinition,
    );
    return response.data;
  }

  async deployProcessDefinition(
    processKey: string,
    processDefinition: ProcessDefinitionContent,
  ): Promise<ProcessDefinition> {
    const response = await this.post<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${processKey}/deploy`,
      processDefinition,
    );
    return response.data;
  }

  async createOrUpdateVariable(
    processDefinitionId: string,
    variable: VariableDefinition[],
  ): Promise<VariableDefinition[]> {
    const response = await this.post<VariableDefinition[]>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/variables`,
      variable,
    );
    return response.data;
  }

  async getVariables(processDefinitionId: string): Promise<VariableDefinition[]> {
    const response = await this.get<VariableDefinition[]>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/variables`,
    );
    return response.data;
  }

  async getProcessDefinitionStates(): Promise<EnumItem[]> {
    const response = await this.get<EnumItem[]>('/parameterization/process-definition-state');
    return response.data;
  }
}
